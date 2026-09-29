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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="text-center space-y-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Portal Kehadiran Mandiri Berbasis GPS & AI Face Verification
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Presensi: {application.event.title}
        </h1>
        <p className="text-xs text-slate-500">
          {application.event.venueName} • Toleransi Radius Geofence: {application.event.radiusMeters}m
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
