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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Antrean Review Pendaftar
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Daftar pengajuan verifikasi talent yang menunggu kurasi dan persetujuan human-reviewer.
        </p>
      </div>

      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Talent</th>
              <th className="px-4 py-3">Domisili</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Percobaan</th>
              <th className="px-4 py-3">Match KTP-Selfie</th>
              <th className="px-4 py-3">Match Video-Selfie</th>
              <th className="px-4 py-3">Flags Rekognition</th>
              <th className="px-4 py-3">Waktu Masuk</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-zinc-400">
                  🎉 Tidak ada antrean review yang tertunda. Semua pendaftar telah diproses!
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.talent.fullName}
                    <div className="text-[10px] text-zinc-400 font-normal">
                      {item.talent.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.talent.city}</td>
                  <td className="px-4 py-3 font-medium">{item.talent.category}</td>
                  <td className="px-4 py-3">#{item.attemptNo}</td>
                  <td className="px-4 py-3">
                    {item.matchKtpSelfie !== null ? (
                      <span className="font-semibold text-blue-600">
                        {item.matchKtpSelfie.toFixed(1)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.matchVideoSelfie !== null ? (
                      <span className="font-semibold text-emerald-600">
                        {item.matchVideoSelfie.toFixed(1)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.flags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.flags.map((f, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Bersih</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(item.submittedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/reviews/${item.id}`}>
                      <Button size="sm">Buka Review</Button>
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
