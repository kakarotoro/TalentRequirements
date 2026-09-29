import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);

  const [
    totalTalents,
    pendingReviews,
    verifiedTalents,
    activeEvents,
    recentAudits,
  ] = await Promise.all([
    prisma.talentProfile.count(),
    prisma.verification.count({ where: { decision: "PENDING" } }),
    prisma.talentProfile.count({ where: { status: "VERIFIED" } }),
    prisma.event.count({ where: { status: "OPEN" } }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin Dashboard Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitoring rekrutmen talent, verifikasi identitas, dan absensi event.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/events/new">
            <Button size="sm">＋ Buat Lowongan Event</Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm">
              Rekap Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500 font-medium">Antrean Review</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
              {pendingReviews}
            </div>
            <Link
              href="/admin/reviews"
              className="text-[11px] text-blue-600 hover:underline block mt-2"
            >
              Lihat antrean →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500 font-medium">Talent Terverifikasi</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
              {verifiedTalents}
            </div>
            <Link
              href="/admin/talents"
              className="text-[11px] text-blue-600 hover:underline block mt-2"
            >
              Daftar talent →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500 font-medium">Event Terbuka</span>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
              {activeEvents}
            </div>
            <Link
              href="/admin/events"
              className="text-[11px] text-blue-600 hover:underline block mt-2"
            >
              Kelola event →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-zinc-500">
          <CardContent className="p-5">
            <span className="text-xs text-zinc-500 font-medium">Total Akun Talent</span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {totalTalents}
            </div>
            <span className="text-[11px] text-zinc-400 block mt-2">Ditinjau & Draft</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Logs (UU PDP compliance tracking) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aktivitas & Log Audit Keamanan (UU PDP)</CardTitle>
            <span className="text-xs text-zinc-400">Pencatatan immutable</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5">Aktor</th>
                  <th className="px-4 py-2.5">Aksi</th>
                  <th className="px-4 py-2.5">Target</th>
                  <th className="px-4 py-2.5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentAudits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                      Belum ada audit log tercatat.
                    </td>
                  </tr>
                ) : (
                  recentAudits.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                        {log.actor?.email || "Sistem"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {log.targetType} ({log.targetId.slice(0, 8)}...)
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
