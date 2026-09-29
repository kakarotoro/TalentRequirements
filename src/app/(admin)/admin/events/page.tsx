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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Kelola Lowongan & Event
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Daftar event yang sedang dibuka, pelamar yang mendaftar, dan absensi di lokasi.
          </p>
        </div>

        <Link href="/admin/events/new">
          <Button size="sm">＋ Buat Event Baru</Button>
        </Link>
      </div>

      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Klien</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tanggal Event</th>
              <th className="px-4 py-3">Kebutuhan / Pelamar</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-zinc-400">
                  Belum ada event yang dibuat. Klik tombol di atas untuk membuat event baru.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const confirmedCount = event.applications.filter(
                  (a) => a.status === "CONFIRMED"
                ).length;

                return (
                  <tr key={event.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {event.title}
                    </td>
                    <td className="px-4 py-3">{event.clientName}</td>
                    <td className="px-4 py-3">
                      {event.venueName}
                      <span className="text-[10px] text-zinc-400 block">
                        Radius: {event.radiusMeters}m
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{event.category}</td>
                    <td className="px-4 py-3">
                      {new Date(event.startsAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {confirmedCount} / {event.requiredCount} confirmed
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        ({event._count.applications} total pelamar)
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Pelamar
                        </Link>
                        <span className="text-zinc-300">|</span>
                        <Link
                          href={`/admin/events/${event.id}/attendance`}
                          className="text-xs text-emerald-600 hover:underline font-medium"
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
