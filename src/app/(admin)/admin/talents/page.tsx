import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminTalentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { status, category } = await searchParams;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (category && category !== "ALL") {
    where.category = category;
  }

  const talents = await prisma.talentProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      verifications: {
        orderBy: { attemptNo: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Daftar Talent Terdaftar
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Database profil talent, status verifikasi, dan spesifikasi fisik.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/talents"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              !status && !category
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Semua
          </Link>
          <Link
            href="/admin/talents?status=VERIFIED"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              status === "VERIFIED"
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Terverifikasi
          </Link>
          <Link
            href="/admin/talents?status=PENDING_REVIEW"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              status === "PENDING_REVIEW"
                ? "bg-amber-600 text-white"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Menunggu Review
          </Link>
          <Link
            href="/admin/talents?category=SPG"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              category === "SPG"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            SPG
          </Link>
          <Link
            href="/admin/talents?category=USHER"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              category === "USHER"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Usher
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Talent</th>
              <th className="px-4 py-3">Domisili</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tinggi / Berat</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tgl Daftar</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {talents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-zinc-400">
                  Tidak ada talent yang cocok dengan filter yang dipilih.
                </td>
              </tr>
            ) : (
              talents.map((t) => {
                const latestVerif = t.verifications[0];
                return (
                  <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.fullName}
                      <div className="text-[10px] text-zinc-400 font-normal">
                        {t.user.email} • {t.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">{t.city}</td>
                    <td className="px-4 py-3 font-medium">{t.category}</td>
                    <td className="px-4 py-3">
                      {t.heightCm} cm / {t.weightKg} kg
                    </td>
                    <td className="px-4 py-3">{t.gender === "FEMALE" ? "Wanita" : "Pria"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.status === "VERIFIED"
                            ? "success"
                            : t.status === "PENDING_REVIEW"
                            ? "warning"
                            : t.status === "REJECTED"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(t.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {latestVerif ? (
                        <Link
                          href={`/admin/reviews/${latestVerif.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Lihat Bukti
                        </Link>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
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
