import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminEventsPage() {
  await requireRole(["ADMIN"]);

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
      applications: {
        include: { attendances: true },
      },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Kelola Penugasan & Event
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar event yang sedang dibuka, pelamar yang mendaftar, dan absensi di lokasi.
          </p>
        </div>

        <Link href="/admin/events/new">
          <Button size="sm" className="font-bold shadow-xs">
            ＋ Buat Event Baru
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Nama Event</th>
              <th className="px-4 py-3.5">Klien Korporat</th>
              <th className="px-4 py-3.5">Venue & Radius</th>
              <th className="px-4 py-3.5">Kategori</th>
              <th className="px-4 py-3.5">Tanggal Event</th>
              <th className="px-4 py-3.5">Kebutuhan / Pelamar</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  Belum ada event yang dibuat. Klik tombol di atas untuk membuat event baru.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const confirmedCount = event.applications.filter(
                  (a) => a.status === "CONFIRMED"
                ).length;

                return (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {event.title}
                    </td>
                    <td className="px-4 py-4 font-semibold text-blue-700">{event.clientName}</td>
                    <td className="px-4 py-4 text-slate-700">
                      <span className="font-medium text-slate-900 block">{event.venueName}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Toleransi Geofence: {event.radiusMeters}m
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      <Badge variant="info">{event.category}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {new Date(event.startsAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900">
                        {confirmedCount} / {event.requiredCount} terkonfirmasi
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        ({event._count.applications} total pelamar)
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          event.status === "OPEN"
                            ? "success"
                            : event.status === "ONGOING"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                        >
                          Pelamar
                        </Link>
                        <span className="text-slate-200">|</span>
                        <Link
                          href={`/admin/events/${event.id}/attendance`}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          Absensi Live
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
