import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateApplicationStatusAction, adminAssignTalentAction } from "@/server/actions/applications";
import { revalidatePath } from "next/cache";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["ADMIN"]);

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          talent: {
            include: {
              user: true,
              verifications: {
                orderBy: { attemptNo: "desc" },
                take: 1,
              },
            },
          },
          attendances: true,
        },
        orderBy: { appliedAt: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const assignedTalentIds = event.applications.map((a) => a.talentId);

  // Talents available to be directly assigned
  const availableTalents = await prisma.talentProfile.findMany({
    where: {
      status: "VERIFIED",
      id: { notIn: assignedTalentIds },
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      category: true,
      city: true,
      phone: true,
      heightCm: true,
    },
  });

  const confirmedCount = event.applications.filter((a) => a.status === "CONFIRMED").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Kelola Event
        </Link>
      </div>

      {/* Event Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">{event.category}</Badge>
            <Badge variant={event.status === "OPEN" ? "success" : "neutral"}>{event.status}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Klien Korporat: <strong className="text-blue-700">{event.clientName}</strong> • Venue: {event.venueName} • Kuota: <strong className="text-slate-900">{confirmedCount} / {event.requiredCount}</strong> Terisi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/admin/events/${event.id}/attendance`}>
            <Button size="sm" className="font-bold shadow-xs">
              Absensi Live Lapangan →
            </Button>
          </Link>
        </div>
      </div>

      {/* Direct Assign Talent Panel (Japri & Assign) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Tugaskan Talent (Kontak Japri & Assign)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hubungi talent terverifikasi via WhatsApp, lalu tetapkan langsung ke event ini.
            </p>
          </div>
        </div>

        {availableTalents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Semua talent terverifikasi sudah terdaftar dalam penugasan event ini, atau belum ada talent baru yang berstatus terverifikasi.
          </p>
        ) : (
          <form
            action={async (formData: FormData) => {
              "use server";
              const talentId = formData.get("talentId") as string;
              if (talentId) {
                await adminAssignTalentAction({ eventId: id, talentId });
                revalidatePath(`/admin/events/${id}`);
              }
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1"
          >
            <select
              name="talentId"
              required
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800"
            >
              <option value="">-- Pilih Talent Terverifikasi yang Akan Ditugaskan --</option>
              {availableTalents.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.category} • {t.city} • {t.heightCm}cm • WA: {t.phone})
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" className="font-bold whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white">
              ＋ Tugaskan ke Event
            </Button>
          </form>
        )}
      </div>

      {/* Assigned Talents Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Daftar Talent Penugasan Event ({event.applications.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {confirmedCount} talent terkonfirmasi siap bertugas
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Talent</th>
                <th className="px-4 py-3.5">Domisili</th>
                <th className="px-4 py-3.5">Tinggi / Berat</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Tgl Penugasan</th>
                <th className="px-4 py-3.5">Status Penugasan</th>
                <th className="px-5 py-3.5 text-right">Kelola Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {event.applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Belum ada talent yang ditugaskan pada event ini. Gunakan formulir di atas untuk menugaskan talent.
                  </td>
                </tr>
              ) : (
                event.applications.map((app) => {
                  const talent = app.talent;
                  const cleanPhone = (talent.phone || "").replace(/\D/g, "");
                  const waPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                  const waMsg = encodeURIComponent(
                    `Halo ${talent.fullName}, kami dari tim SPG/Usher. Anda ditugaskan pada event "${event.title}" di ${event.venueName} pada tanggal ${new Date(event.startsAt).toLocaleDateString("id-ID")}${event.fee ? ` (Honor: Rp ${event.fee.toLocaleString("id-ID")})` : ""}. Mohon konfirmasi kesiapannya.`
                  );

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {talent.fullName}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-400 font-normal">
                            {talent.user.email} • {talent.phone}
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
                      <td className="px-4 py-4 text-slate-700 font-medium">{talent.city}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {talent.heightCm} cm / {talent.weightKg} kg
                      </td>
                      <td className="px-4 py-4 font-medium">
                        <Badge variant="info">{talent.category}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            app.status === "CONFIRMED"
                              ? "success"
                              : app.status === "SHORTLISTED"
                              ? "info"
                              : app.status === "REJECTED"
                              ? "danger"
                              : "neutral"
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status !== "SHORTLISTED" && (
                            <form
                              action={async () => {
                                "use server";
                                await updateApplicationStatusAction({
                                  applicationId: app.id,
                                  status: "SHORTLISTED",
                                });
                                revalidatePath(`/admin/events/${id}`);
                              }}
                            >
                              <button
                                type="submit"
                                className="px-2.5 py-1 text-[11px] rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                              >
                                Shortlist
                              </button>
                            </form>
                          )}

                          {app.status !== "CONFIRMED" && (
                            <form
                              action={async () => {
                                "use server";
                                await updateApplicationStatusAction({
                                  applicationId: app.id,
                                  status: "CONFIRMED",
                                });
                                revalidatePath(`/admin/events/${id}`);
                              }}
                            >
                              <button
                                type="submit"
                                className="px-2.5 py-1 text-[11px] rounded-lg font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                              >
                                Konfirmasi
                              </button>
                            </form>
                          )}

                          {app.status !== "REJECTED" && (
                            <form
                              action={async () => {
                                "use server";
                                await updateApplicationStatusAction({
                                  applicationId: app.id,
                                  status: "REJECTED",
                                });
                                revalidatePath(`/admin/events/${id}`);
                              }}
                            >
                              <button
                                type="submit"
                                className="px-2.5 py-1 text-[11px] rounded-lg font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              >
                                Batalkan
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
