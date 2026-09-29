import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function TalentDashboardPage() {
  const user = await requireRole(["TALENT"]);

  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.id },
    include: {
      verifications: {
        orderBy: { attemptNo: "desc" },
        take: 1,
      },
      applications: {
        include: {
          event: true,
          attendances: true,
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  const latestVerification = profile?.verifications?.[0];
  const status = profile?.status || "DRAFT";

  const confirmedEvents =
    profile?.applications?.filter((app) => app.status === "CONFIRMED") || [];

  return (
    <div className="space-y-8">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Halo, {profile?.fullName || user.email}!
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Status Akun:{" "}
            <Badge
              variant={
                status === "VERIFIED"
                  ? "success"
                  : status === "PENDING_REVIEW"
                  ? "warning"
                  : status === "REJECTED"
                  ? "danger"
                  : "neutral"
              }
            >
              {status}
            </Badge>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Ubah Data Diri
            </Button>
          </Link>
          {status === "VERIFIED" && (
            <Link href="/events">
              <Button size="sm">Cari Lowongan Event</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Verification Status Warning / Action Banner */}
      {status === "DRAFT" && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
              Lengkapi Verifikasi Akun Anda
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Anda belum mengunggah foto KTP, selfie, atau video casting. Verifikasi akun diperlukan sebelum Anda dapat melamar pekerjaan event.
            </p>
          </div>
          <Link href={!profile ? "/profile" : "/verification"}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
              {!profile ? "Lengkapi Profil" : "Mulai Verifikasi"}
            </Button>
          </Link>
        </div>
      )}

      {status === "PENDING_REVIEW" && (
        <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
          <h4 className="font-semibold text-sm text-sky-900 dark:text-sky-200">
            ⏳ Verifikasi Sedang Ditinjau Tim Kurasi
          </h4>
          <p className="text-xs text-sky-700 dark:text-sky-400 mt-1">
            Pengajuan verifikasi Anda (percobaan #{latestVerification?.attemptNo}) sedang diproses. Anda akan menerima notifikasi email setelah hasil review selesai.
          </p>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-sm text-rose-900 dark:text-rose-200">
              Pengajuan Verifikasi Belum Disetujui
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              Catatan Reviewer: {latestVerification?.reviewNote || "Foto KTP atau video perkenalan belum memenuhi kualifikasi."}
            </p>
          </div>
          <Link href="/verification">
            <Button size="sm" variant="danger">
              Unggah Ulang Dokumen
            </Button>
          </Link>
        </div>
      )}

      {/* Confirmed / Today's Event Attendance Section */}
      {confirmedEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Jadwal Penugasan Terkonfirmasi & Absensi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedEvents.map((app) => {
              const checkIn = app.attendances.find((a) => a.type === "CHECK_IN");
              const checkOut = app.attendances.find((a) => a.type === "CHECK_OUT");

              return (
                <Card key={app.id} className="border-blue-200 dark:border-blue-900 shadow-sm">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{app.event.title}</CardTitle>
                      <Badge variant="success">CONFIRMED</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {app.event.venueName} • {new Date(app.event.startsAt).toLocaleDateString("id-ID")}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-3">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 flex justify-between">
                      <span>Jam Acara:</span>
                      <span className="font-medium">
                        {new Date(app.event.startsAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(app.event.endsAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="text-xs">
                        Check-in:{" "}
                        {checkIn ? (
                          <span className="text-emerald-600 font-semibold">Sudah Absen</span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Belum</span>
                        )}
                      </div>
                      <Link href={`/attendance/${app.id}`}>
                        <Button size="sm">Buka Halaman Absen</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Applications List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Riwayat Lamaran Event
        </h3>

        {!profile?.applications || profile.applications.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-500">
            Anda belum melamar event apapun.{" "}
            {status === "VERIFIED" ? (
              <Link href="/events" className="text-blue-600 underline font-medium">
                Cari lowongan event sekarang
              </Link>
            ) : (
              "Lengkapi verifikasi terlebih dahulu untuk mulai melamar."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Nama Event</th>
                  <th className="px-4 py-3">Klien</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Status Lamaran</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {profile.applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {app.event.title}
                    </td>
                    <td className="px-4 py-3">{app.event.clientName}</td>
                    <td className="px-4 py-3">
                      {new Date(app.event.startsAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          app.status === "CONFIRMED"
                            ? "success"
                            : app.status === "SHORTLISTED"
                            ? "info"
                            : app.status === "APPLIED"
                            ? "neutral"
                            : "danger"
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/events/${app.eventId}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
