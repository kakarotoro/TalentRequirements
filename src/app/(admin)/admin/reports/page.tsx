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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Laporan & Rekapitulasi Eksekutif
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor rekapitulasi presensi, data penempatan talent, dan log kepatuhan UU PDP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a href="/api/reports/export?format=csv" download>
            <Button variant="outline" size="sm" className="font-semibold border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300">
              <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Ekspor CSV
            </Button>
          </a>
          <a href="/api/reports/export?format=xlsx" download>
            <Button size="sm" className="font-bold shadow-xs">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ekspor Excel (.xlsx)
            </Button>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-emerald-600">
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Talent Terverifikasi Siap Kerja</span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {totalTalents} <span className="text-xs font-normal text-slate-500">orang</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-blue-600">
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Penugasan Event</span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {events.length} <span className="text-xs font-normal text-slate-500">event</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-indigo-600">
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Presensi Lapangan</span>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {totalAttendances} <span className="text-xs font-normal text-slate-500">log</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Rekap Table */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
            Rekap Kehadiran Presensi per Event
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Nama Event</th>
                  <th className="px-4 py-3.5">Klien Korporat</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Kebutuhan</th>
                  <th className="px-4 py-3.5">Terkonfirmasi</th>
                  <th className="px-4 py-3.5">Presensi Valid</th>
                  <th className="px-5 py-3.5 text-right">Perlu Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
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
                      <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {e.title}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-blue-700">{e.clientName}</td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {new Date(e.startsAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">{e.requiredCount} talent</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{confirmed.length}</td>
                        <td className="px-4 py-3.5 text-emerald-700 font-bold">
                          {validCount} log
                        </td>
                        <td className="px-5 py-3.5 text-right text-amber-700 font-bold">
                          {reviewCount > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                              {reviewCount} review
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
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
