import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminReportsPage() {
  await requireRole(["ADMIN"]);

  const [events, totalTalents, totalAttendances] = await Promise.all([
    prisma.event.findMany({
      include: {
        _count: { select: { applications: true } },
        applications: {
          include: { attendances: true },
        },
      },
      orderBy: { startsAt: "desc" },
    }),
    prisma.talentProfile.count({ where: { status: "VERIFIED" } }),
    prisma.attendance.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Laporan & Rekapitulasi Data
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Ekspor rekap kehadiran, kinerja penempatan, dan status kepatuhan UU PDP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/api/reports/export?format=csv" download>
            <Button variant="outline" size="sm">
              📥 Ekspor CSV
            </Button>
          </a>
          <a href="/api/reports/export?format=xlsx" download>
            <Button size="sm">
              📊 Ekspor Excel (.xlsx)
            </Button>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500">Talent Terverifikasi Siap Kerja</span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {totalTalents} orang
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500">Total Event Terkelola</span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {events.length} event
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500">Total Log Kehadiran Tercatat</span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {totalAttendances} log
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Rekap Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Kehadiran per Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Nama Event</th>
                  <th className="px-4 py-3">Klien</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Target Talent</th>
                  <th className="px-4 py-3">Confirmed</th>
                  <th className="px-4 py-3">Kehadiran (Valid)</th>
                  <th className="px-4 py-3">Needs Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                      Belum ada data event.
                    </td>
                  </tr>
                ) : (
                  events.map((e) => {
                    const confirmed = e.applications.filter((a) => a.status === "CONFIRMED");
                    let validCount = 0;
                    let reviewCount = 0;

                    confirmed.forEach((c) => {
                      c.attendances.forEach((att) => {
                        if (att.status === "VALID") validCount++;
                        if (att.status === "NEEDS_REVIEW") reviewCount++;
                      });
                    });

                    return (
                      <tr key={e.id}>
                        <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                          {e.title}
                        </td>
                        <td className="px-4 py-3">{e.clientName}</td>
                        <td className="px-4 py-3">
                          {new Date(e.startsAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-4 py-3">{e.requiredCount}</td>
                        <td className="px-4 py-3 font-medium">{confirmed.length}</td>
                        <td className="px-4 py-3 text-emerald-600 font-bold">
                          {validCount}
                        </td>
                        <td className="px-4 py-3 text-amber-600 font-bold">
                          {reviewCount}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
