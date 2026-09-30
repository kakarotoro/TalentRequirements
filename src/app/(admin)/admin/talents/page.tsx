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
                const cleanPhone = (t.phone || "").replace(/\D/g, "");
                const waPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                const waMsg = encodeURIComponent(`Halo ${t.fullName}, kami dari tim Rekrutmen SPG/Usher. Kami ingin menawarkan penugasan event.`);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {t.fullName}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-400 font-normal">
                          {t.user.email} • {t.phone}
                        </span>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${waMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Hubungi langsung via WhatsApp (Japri)"
                          >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            Japri WA
                          </a>
                        )}
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
