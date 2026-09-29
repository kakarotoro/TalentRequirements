import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function EventsListPage() {
  const user = await requireRole(["TALENT"]);

  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.id },
  });

  const events = await prisma.event.findMany({
    where: {
      status: { in: ["OPEN", "ONGOING"] },
    },
    orderBy: { startsAt: "asc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Daftar Lowongan Event Aktif
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pilih event yang sesuai dengan profil dan jadwal ketersediaan Anda.
          </p>
        </div>

        {profile?.status !== "VERIFIED" && (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            ⚠️ Profil belum terverifikasi. Selesaikan verifikasi untuk melamar.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
            Belum ada lowongan event yang sedang dibuka saat ini.
          </div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="flex flex-col justify-between hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="info">{event.category}</Badge>
                  {event.fee && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {event.fee.toLocaleString("id-ID")} / talent
                    </span>
                  )}
                </div>
                <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">{event.clientName}</p>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="line-clamp-1">{event.venueName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🗓️</span>
                    <span>
                      {new Date(event.startsAt).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>
                      Kebutuhan: {event.requiredCount} talent ({event._count.applications} pelamar)
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Lihat Detail & Lamar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
