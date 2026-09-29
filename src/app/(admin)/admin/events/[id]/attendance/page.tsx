import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AttendanceTable } from "@/components/admin/AttendanceTable";
import { Badge } from "@/components/ui/badge";

export default async function AdminEventAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["ADMIN"]);

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      applications: {
        where: { status: "CONFIRMED" },
        include: {
          talent: true,
          attendances: {
            orderBy: { serverTimestamp: "desc" },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Flatten attendances for the AttendanceTable
  const attendancesList: any[] = [];
  event.applications.forEach((app) => {
    app.attendances.forEach((att) => {
      attendancesList.push({
        ...att,
        serverTimestamp: att.serverTimestamp.toISOString(),
        application: {
          talent: {
            fullName: app.talent.fullName,
            phone: app.talent.phone,
            category: app.talent.category,
          },
        },
      });
    });
  });

  const checkInCount = attendancesList.filter((a) => a.type === "CHECK_IN").length;
  const checkOutCount = attendancesList.filter((a) => a.type === "CHECK_OUT").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/events/${event.id}`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Kembali ke Detail Event
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">Live Monitoring</Badge>
            <span className="text-xs text-zinc-500">{event.venueName}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Absensi: {event.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Batas Geofence: {event.radiusMeters} meter • Jadwal:{" "}
            {new Date(event.startsAt).toLocaleTimeString("id-ID")} -{" "}
            {new Date(event.endsAt).toLocaleTimeString("id-ID")}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center">
            <span className="text-zinc-400 block text-[10px]">Confirmed</span>
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {event.applications.length}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center">
            <span className="text-emerald-600 block text-[10px]">Check-In</span>
            <span className="font-bold text-base text-emerald-600">
              {checkInCount}
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-center">
            <span className="text-blue-600 block text-[10px]">Check-Out</span>
            <span className="font-bold text-base text-blue-600">
              {checkOutCount}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
          Daftar Rekap Absensi Talent di Lapangan
        </h3>
        <AttendanceTable attendances={attendancesList} />
      </div>
    </div>
  );
}
