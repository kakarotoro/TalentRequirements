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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Database Profil Talent
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Database profil talent, status verifikasi identitas, dan spesifikasi fisik.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <Link
            href="/admin/talents"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !status && !category
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({talents.length})
          </Link>
          <Link
            href="/admin/talents?status=VERIFIED"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === "VERIFIED"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terverifikasi
          </Link>
          <Link
            href="/admin/talents?status=PENDING_REVIEW"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === "PENDING_REVIEW"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Menunggu Review
          </Link>
          <Link
            href="/admin/talents?category=SPG"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === "SPG"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SPG
          </Link>
          <Link
            href="/admin/talents?category=USHER"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === "USHER"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Usher
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Talent</th>
              <th className="px-4 py-3.5">Domisili</th>
              <th className="px-4 py-3.5">Kategori</th>
              <th className="px-4 py-3.5">Tinggi / Berat</th>
              <th className="px-4 py-3.5">Gender</th>
              <th className="px-4 py-3.5">Status Akun</th>
              <th className="px-4 py-3.5">Tgl Terdaftar</th>
              <th className="px-5 py-3.5 text-right">Berkas Bukti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {talents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  Tidak ada talent yang cocok dengan filter yang dipilih.
                </td>
              </tr>
            ) : (
              talents.map((t) => {
                const latestVerif = t.verifications[0];
                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {t.fullName}
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                        {t.user.email} • {t.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium">{t.city}</td>
                    <td className="px-4 py-4">
                      <Badge variant="info">{t.category}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {t.heightCm} cm / {t.weightKg} kg
                    </td>
                    <td className="px-4 py-4 text-slate-600">{t.gender === "FEMALE" ? "Wanita" : "Pria"}</td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {latestVerif ? (
                        <Link
                          href={`/admin/reviews/${latestVerif.id}`}
                          className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                        >
                          Lihat Bukti →
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
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
