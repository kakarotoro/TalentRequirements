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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/events" className="text-xs text-blue-600 hover:underline">
          ← Kembali ke Kelola Event
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">{event.category}</Badge>
            <Badge variant="success">{event.status}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {event.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Klien: {event.clientName} • Venue: {event.venueName} • Kuota: {confirmedCount} / {event.requiredCount} Terisi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/events/${event.id}/attendance`}>
            <Button size="sm">Absensi Live Lapangan →</Button>
          </Link>
        </div>
      </div>

      {/* Applicants Management Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
          Daftar Pelamar ({event.applications.length})
        </h3>

        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Talent</th>
                <th className="px-4 py-3">Domisili</th>
                <th className="px-4 py-3">Tinggi/Berat</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tgl Melamar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Kelola Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {event.applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Belum ada talent yang melamar pada event ini.
                  </td>
                </tr>
              ) : (
                event.applications.map((app) => {
                  const talent = app.talent;
                  return (
                    <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {talent.fullName}
                        <div className="text-[10px] text-zinc-400 font-normal">
                          {talent.user.email} • {talent.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">{talent.city}</td>
                      <td className="px-4 py-3">
                        {talent.heightCm} cm / {talent.weightKg} kg
                      </td>
                      <td className="px-4 py-3 font-medium">{talent.category}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {new Date(app.appliedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-right">
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
                                className="px-2 py-1 text-[11px] rounded font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
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
                                className="px-2 py-1 text-[11px] rounded font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
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
                                className="px-2 py-1 text-[11px] rounded font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
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
