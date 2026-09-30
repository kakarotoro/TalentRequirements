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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Admin Executive Overview
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring rekrutmen talent, verifikasi identitas, dan pengawasan absensi presensi event.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/events/new">
            <Button size="sm" className="font-bold shadow-xs">
              ＋ Buat Penugasan Event
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm" className="font-semibold border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300">
              Rekap Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Antrean Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-2">
              {pendingReviews}
            </div>
            <Link
              href="/admin/reviews"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 mt-3"
            >
              Lihat antrean →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-emerald-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Talent Terverifikasi</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-2">
              {verifiedTalents}
            </div>
            <Link
              href="/admin/talents"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 mt-3"
            >
              Daftar talent →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-blue-600">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Event Aktif</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-blue-700 mt-2">
              {activeEvents}
            </div>
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 mt-3"
            >
              Kelola event →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-slate-200/90 shadow-2xs border-t-4 border-t-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Akun Talent</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {totalTalents}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-3">
              Termasuk akun terverifikasi & draft
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Logs (UU PDP compliance tracking) */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Aktivitas & Log Audit Keamanan (UU PDP)
                </CardTitle>
                <p className="text-xs text-slate-500">Pencatatan immutable forensik akses data pribadi talent</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
              Immutable Records
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Aktor Administrator</th>
                  <th className="px-5 py-3">Aksi / Tindakan</th>
                  <th className="px-5 py-3">Entitas Sasaran</th>
                  <th className="px-5 py-3">Waktu Pencatatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAudits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      Belum ada audit log tercatat dalam sistem.
                    </td>
                  </tr>
                ) : (
                  recentAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {log.actor?.email || "Sistem Otomatis"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {log.targetType} <span className="text-slate-400 font-mono text-[11px]">({log.targetId.slice(0, 8)}...)</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-medium">
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
