"use server";

import { requireRole, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema, EventInput } from "@/validations/event";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function createEventAction(data: EventInput) {
  const admin = await requireRole(["ADMIN"]);
  const parsed = eventSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const payload = parsed.data;

  try {
    const event = await prisma.event.create({
      data: {
        title: payload.title,
        clientName: payload.clientName,
        description: payload.description || null,
        venueName: payload.venueName,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        radiusMeters: payload.radiusMeters,
        startsAt: new Date(payload.startsAt),
        endsAt: new Date(payload.endsAt),
        checkInOpensMinutesBefore: payload.checkInOpensMinutesBefore,
        requiredCount: payload.requiredCount,
        category: payload.category,
        fee: payload.fee || null,
        requirements: payload.requirements || null,
        status: payload.status,
        createdById: admin.id,
      },
    });

    await logAudit({
      actorId: admin.id,
      action: "CREATE_EVENT",
      targetType: "Event",
      targetId: event.id,
      meta: { title: event.title },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, eventId: event.id };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { success: false, error: error.message || "Gagal membuat event" };
  }
}

export async function updateEventAction(id: string, data: Partial<EventInput>) {
  const admin = await requireRole(["ADMIN"]);

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.clientName && { clientName: data.clientName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.venueName && { venueName: data.venueName }),
        ...(data.address && { address: data.address }),
        ...(data.latitude && { latitude: data.latitude }),
        ...(data.longitude && { longitude: data.longitude }),
        ...(data.radiusMeters && { radiusMeters: data.radiusMeters }),
        ...(data.startsAt && { startsAt: new Date(data.startsAt) }),
        ...(data.endsAt && { endsAt: new Date(data.endsAt) }),
        ...(data.checkInOpensMinutesBefore && { checkInOpensMinutesBefore: data.checkInOpensMinutesBefore }),
        ...(data.requiredCount && { requiredCount: data.requiredCount }),
        ...(data.category && { category: data.category }),
        ...(data.fee !== undefined && { fee: data.fee }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.status && { status: data.status }),
      },
    });

    await logAudit({
      actorId: admin.id,
      action: "UPDATE_EVENT",
      targetType: "Event",
      targetId: id,
      meta: data,
    });

    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, event: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getEventsAction(filter?: {
  status?: string;
  category?: string;
}) {
  const session = await getSession();

  const where: any = {};
  if (filter?.status) {
    where.status = filter.status;
  } else if (!session || session.role !== "ADMIN") {
    // Public/talent only see OPEN or ONGOING
    where.status = { in: ["OPEN", "ONGOING"] };
  }

  if (filter?.category && filter.category !== "ALL") {
    where.category = { in: [filter.category, "BOTH"] };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return { success: true, events };
}

export async function getEventDetailAction(id: string) {
  const session = await getSession();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          talent: {
            include: {
              verifications: {
                orderBy: { attemptNo: "desc" },
                take: 1,
              },
            },
          },
          attendances: true,
        },
      },
      createdBy: {
        select: { email: true },
      },
    },
  });

  if (!event) {
    return { success: false, error: "Event tidak ditemukan" };
  }

  let userApplication = null;
  if (session?.talentProfileId) {
    userApplication = event.applications.find(
      (app) => app.talentId === session.talentProfileId
    );
  }

  return {
    success: true,
    event,
    userApplication,
    isAdmin: session?.role === "ADMIN",
  };
}
