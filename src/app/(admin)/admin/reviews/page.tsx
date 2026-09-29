import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminReviewsQueuePage() {
  await requireRole(["ADMIN"]);

  const queue = await prisma.verification.findMany({
    where: { decision: "PENDING" },
    include: {
      talent: {
        include: { user: { select: { email: true } } },
      },
      video: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Antrean Review Pendaftar
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar pengajuan verifikasi talent yang menunggu kurasi dan persetujuan human-reviewer.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>{queue.length} Berkas Perlu Ditinjau</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Talent</th>
              <th className="px-4 py-3.5">Domisili</th>
              <th className="px-4 py-3.5">Kategori</th>
              <th className="px-3 py-3.5">Percobaan</th>
              <th className="px-4 py-3.5">Match KTP-Selfie</th>
              <th className="px-4 py-3.5">Match Video-Selfie</th>
              <th className="px-4 py-3.5">Flags Rekognition</th>
              <th className="px-4 py-3.5">Waktu Masuk</th>
              <th className="px-5 py-3.5 text-right">Aksi Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-slate-700">Tidak ada antrean review yang tertunda</p>
                    <p className="text-[11px] text-slate-400">Semua pendaftar telah diproses oleh reviewer.</p>
                  </div>
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {item.talent.fullName}
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {item.talent.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 font-medium">{item.talent.city}</td>
                  <td className="px-4 py-4">
                    <Badge variant="info">{item.talent.category}</Badge>
                  </td>
                  <td className="px-3 py-4 text-slate-500 font-mono">#{item.attemptNo}</td>
                  <td className="px-4 py-4">
                    {item.matchKtpSelfie !== null ? (
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${item.matchKtpSelfie >= 80 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        {item.matchKtpSelfie.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {item.matchVideoSelfie !== null ? (
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${item.matchVideoSelfie >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        {item.matchVideoSelfie.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {item.flags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.flags.map((f, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Lolos Otomatis
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {new Date(item.submittedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/reviews/${item.id}`}>
                      <Button size="sm" className="font-semibold shadow-xs">
                        Buka Review →
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
