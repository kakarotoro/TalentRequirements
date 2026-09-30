"use server";

import { requireUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { sendApplicationStatusEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function applyEventAction(eventId: string) {
  const user = await requireUser();
  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { success: false, error: "Silakan isi profil talent terlebih dahulu" };
  }

  if (profile.status !== "VERIFIED") {
    return {
      success: false,
      error: "Hanya akun talent yang telah terverifikasi yang dapat melamar event.",
    };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.status !== "OPEN") {
    return { success: false, error: "Pendaftaran untuk event ini sedang ditutup" };
  }

  try {
    const application = await prisma.application.create({
      data: {
        eventId,
        talentId: profile.id,
        status: "APPLIED",
      },
    });

    await logAudit({
      actorId: user.id,
      action: "APPLY_EVENT",
      targetType: "Application",
      targetId: application.id,
      meta: { eventId, eventTitle: event.title },
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/dashboard");
    return { success: true, application };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { success: false, error: "Anda sudah melamar event ini sebelumnya." };
    }
    return { success: false, error: err.message || "Gagal mengirim lamaran" };
  }
}

export async function updateApplicationStatusAction(params: {
  applicationId: string;
  status: "SHORTLISTED" | "CONFIRMED" | "REJECTED" | "CANCELLED";
}) {
  const admin = await requireRole(["ADMIN"]);

  try {
    const updated = await prisma.application.update({
      where: { id: params.applicationId },
      data: {
        status: params.status,
        decidedAt: new Date(),
        decidedById: admin.id,
      },
      include: {
        event: true,
        talent: {
          include: { user: true },
        },
      },
    });

    // Notify talent via email if status changed to shortlisted, confirmed, or rejected
    if (
      params.status === "SHORTLISTED" ||
      params.status === "CONFIRMED" ||
      params.status === "REJECTED"
    ) {
      await sendApplicationStatusEmail({
        to: updated.talent.user.email,
        fullName: updated.talent.fullName,
        eventTitle: updated.event.title,
        status: params.status,
      });
    }

    await logAudit({
      actorId: admin.id,
      action: `APPLICATION_${params.status}`,
      targetType: "Application",
      targetId: params.applicationId,
      meta: { newStatus: params.status, eventId: updated.eventId },
    });

    revalidatePath(`/admin/events/${updated.eventId}`);
    return { success: true, application: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status lamaran" };
  }
}

export async function getMyApplicationsAction() {
  const user = await requireUser();
  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) return { success: true, applications: [] };

  const applications = await prisma.application.findMany({
    where: { talentId: profile.id },
    include: {
      event: true,
      attendances: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  return { success: true, applications };
}

export async function adminAssignTalentAction(params: {
  eventId: string;
  talentId: string;
}) {
  const admin = await requireRole(["ADMIN"]);

  try {
    const existing = await prisma.application.findUnique({
      where: {
        eventId_talentId: {
          eventId: params.eventId,
          talentId: params.talentId,
        },
      },
    });

    if (existing) {
      if (existing.status !== "CONFIRMED") {
        await prisma.application.update({
          where: { id: existing.id },
          data: {
            status: "CONFIRMED",
            decidedAt: new Date(),
            decidedById: admin.id,
          },
        });
      }
      revalidatePath(`/admin/events/${params.eventId}`);
      return { success: true, application: existing };
    }

    const application = await prisma.application.create({
      data: {
        eventId: params.eventId,
        talentId: params.talentId,
        status: "CONFIRMED",
        decidedAt: new Date(),
        decidedById: admin.id,
      },
      include: {
        event: true,
        talent: {
          include: { user: true },
        },
      },
    });

    await logAudit({
      actorId: admin.id,
      action: "ADMIN_ASSIGN_TALENT",
      targetType: "Application",
      targetId: application.id,
      meta: { eventId: params.eventId, talentId: params.talentId },
    });

    revalidatePath(`/admin/events/${params.eventId}`);
    return { success: true, application };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menugaskan talent ke event" };
  }
}

