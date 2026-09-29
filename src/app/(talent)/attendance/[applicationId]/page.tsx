import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckInCard } from "@/components/attendance/CheckInCard";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const user = await requireRole(["TALENT", "ADMIN"]);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      event: true,
      attendances: true,
      talent: true,
    },
  });

  if (!application) {
    notFound();
  }

  // Security check: only the talent or an admin can view this page
  if (user.role !== "ADMIN" && application.talent.userId !== user.id) {
    notFound();
  }

  const checkInAttendance = application.attendances.find(
    (a) => a.type === "CHECK_IN"
  );
  const checkOutAttendance = application.attendances.find(
    (a) => a.type === "CHECK_OUT"
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-xs text-blue-600 hover:underline">
          ← Kembali ke Dashboard
        </Link>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Absensi Event: {application.event.title}
        </h1>
        <p className="text-xs text-zinc-500">
          {application.event.venueName} • Radius batas: {application.event.radiusMeters}m
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Check-In Card */}
        <CheckInCard
          applicationId={application.id}
          type="CHECK_IN"
          event={{
            title: application.event.title,
            venueName: application.event.venueName,
            latitude: application.event.latitude,
            longitude: application.event.longitude,
            radiusMeters: application.event.radiusMeters,
            startsAt: application.event.startsAt.toISOString(),
            endsAt: application.event.endsAt.toISOString(),
          }}
          existingAttendance={checkInAttendance}
        />

        {/* Check-Out Card (active only if check-in exists) */}
        {checkInAttendance && (
          <CheckInCard
            applicationId={application.id}
            type="CHECK_OUT"
            event={{
              title: application.event.title,
              venueName: application.event.venueName,
              latitude: application.event.latitude,
              longitude: application.event.longitude,
              radiusMeters: application.event.radiusMeters,
              startsAt: application.event.startsAt.toISOString(),
              endsAt: application.event.endsAt.toISOString(),
            }}
            existingAttendance={checkOutAttendance}
          />
        )}
      </div>
    </div>
  );
}
