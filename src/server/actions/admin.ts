"use server";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { sendVerificationResultEmail } from "@/lib/email";
import { setAppSetting } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function reviewVerificationAction(params: {
  verificationId: string;
  decision: "APPROVED" | "REJECTED";
  reviewNote?: string;
}) {
  const admin = await requireRole(["ADMIN"]);

  const verification = await prisma.verification.findUnique({
    where: { id: params.verificationId },
    include: {
      talent: {
        include: { user: true },
      },
    },
  });

  if (!verification) {
    return { success: false, error: "Data verifikasi tidak ditemukan" };
  }

  const isApproved = params.decision === "APPROVED";

  try {
    // 1. Update Verification status
    const updatedVerification = await prisma.verification.update({
      where: { id: params.verificationId },
      data: {
        decision: params.decision,
        reviewNote: params.reviewNote || null,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    // 2. Update TalentProfile status
    await prisma.talentProfile.update({
      where: { id: verification.talentId },
      data: {
        status: isApproved ? "VERIFIED" : "REJECTED",
      },
    });

    // 3. Send Notification Email
    await sendVerificationResultEmail({
      to: verification.talent.user.email,
      fullName: verification.talent.fullName,
      decision: params.decision,
      note: params.reviewNote,
    });

    // 4. Record Audit Log
    await logAudit({
      actorId: admin.id,
      action: `${params.decision}_VERIFICATION`,
      targetType: "Verification",
      targetId: params.verificationId,
      meta: {
        talentId: verification.talentId,
        decision: params.decision,
        note: params.reviewNote,
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath(`/admin/reviews/${params.verificationId}`);
    revalidatePath("/admin/talents");
    return { success: true, verification: updatedVerification };
  } catch (err: any) {
    console.error("Review verification error:", err);
    return { success: false, error: err.message || "Gagal menyimpan keputusan review" };
  }
}

export async function getVerificationQueueAction() {
  await requireRole(["ADMIN"]);

  const queue = await prisma.verification.findMany({
    where: { decision: "PENDING" },
    include: {
      talent: {
        include: { user: { select: { email: true } } },
      },
      video: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  return { success: true, queue };
}

export async function getAdminSummaryAction() {
  await requireRole(["ADMIN"]);

  const [
    totalTalents,
    pendingReviews,
    verifiedTalents,
    activeEvents,
    recentAudits,
  ] = await Promise.all([
    prisma.talentProfile.count(),
    prisma.verification.count({ where: { decision: "PENDING" } }),
    prisma.talentProfile.count({ where: { status: "VERIFIED" } }),
    prisma.event.count({ where: { status: "OPEN" } }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true } } },
    }),
  ]);

  return {
    success: true,
    summary: {
      totalTalents,
      pendingReviews,
      verifiedTalents,
      activeEvents,
      recentAudits,
    },
  };
}

export async function updateSettingAction(key: string, value: any) {
  const admin = await requireRole(["ADMIN"]);
  await setAppSetting(key, value);

  await logAudit({
    actorId: admin.id,
    action: "UPDATE_SETTING",
    targetType: "AppSetting",
    targetId: key,
    meta: { value },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
