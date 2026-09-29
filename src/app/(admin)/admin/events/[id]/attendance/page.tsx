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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Detail Penugasan Event
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Live Geofence Monitoring
            </span>
            <span className="text-xs text-slate-500 font-medium">{event.venueName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Presensi Lapangan: {event.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Radius Toleransi Geofence: <strong className="text-slate-800">{event.radiusMeters} meter</strong> • Jam Operasional:{" "}
            {new Date(event.startsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
            {new Date(event.endsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[80px]">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Confirmed</span>
            <span className="font-black text-xl text-slate-900">
              {event.applications.length}
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[80px]">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase tracking-wider">Check-In</span>
            <span className="font-black text-xl text-emerald-700">
              {checkInCount}
            </span>
          </div>
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-center min-w-[80px]">
            <span className="text-blue-700 block text-[10px] font-bold uppercase tracking-wider">Check-Out</span>
            <span className="font-black text-xl text-blue-700">
              {checkOutCount}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <h3 className="font-bold text-base text-slate-900">
            Daftar Rekap Absensi Talent di Lapangan
          </h3>
        </div>
        <AttendanceTable attendances={attendancesList} />
      </div>
    </div>
  );
}
