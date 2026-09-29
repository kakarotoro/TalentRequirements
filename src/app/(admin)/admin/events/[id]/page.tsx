import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateApplicationStatusAction } from "@/server/actions/applications";
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

      {/* Applicants Management Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Daftar Pelamar ({event.applications.length})
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
                <th className="px-4 py-3.5">Tgl Melamar</th>
                <th className="px-4 py-3.5">Status Lamaran</th>
                <th className="px-5 py-3.5 text-right">Kelola Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {event.applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Belum ada talent yang melamar pada event ini.
                  </td>
                </tr>
              ) : (
                event.applications.map((app) => {
                  const talent = app.talent;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {talent.fullName}
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {talent.user.email} • {talent.phone}
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
                                className="px-2.5 py-1 text-[11px] rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
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
                                className="px-2.5 py-1 text-[11px] rounded-lg font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
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
                                className="px-2.5 py-1 text-[11px] rounded-lg font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                Tolak
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
