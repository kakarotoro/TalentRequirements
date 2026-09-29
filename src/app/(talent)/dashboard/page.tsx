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
    <div className="space-y-8 animate-fade-in">
      {/* Header Profile Greeting Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Selamat Datang, {profile?.fullName || user.email}!
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Verifikasi:
            </span>
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Ubah Data Diri
            </Button>
          </Link>
          {status === "VERIFIED" ? (
            <Link href="/events">
              <Button size="sm">Cari Lowongan Event</Button>
            </Link>
          ) : (
            <Link href="/verification">
              <Button size="sm">Verifikasi Dokumen</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Verification Status Warning / Action Banner */}
      {status === "DRAFT" && (
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-900">
              Lengkapi Berkas Verifikasi Akun Anda
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed max-w-xl">
              Akun Anda belum mengirimkan KTP, selfie, atau video casting. Verifikasi kurasi wajah otomatis diperlukan sebelum melamar pekerjaan event.
            </p>
          </div>
          <Link href={!profile ? "/profile" : "/verification"}>
            <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white whitespace-nowrap border-amber-800">
              {!profile ? "Lengkapi Profil" : "Mulai Verifikasi Sekarang →"}
            </Button>
          </Link>
        </div>
      )}

      {status === "PENDING_REVIEW" && (
        <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs">
          <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            Verifikasi Sedang Ditinjau Tim Kurasi
          </h4>
          <p className="text-xs text-blue-800 mt-1 leading-relaxed">
            Pengajuan verifikasi Anda (percobaan #{latestVerification?.attemptNo}) sedang diproses oleh human reviewer. Anda akan menerima notifikasi status verifikasi di dashboard ini.
          </p>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-rose-900">
              Pengajuan Verifikasi Belum Disetujui
            </h4>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Penugasan Terkonfirmasi & Absensi Live
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {confirmedEvents.length} Event Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedEvents.map((app) => {
              const checkIn = app.attendances.find((a) => a.type === "CHECK_IN");
              const checkOut = app.attendances.find((a) => a.type === "CHECK_OUT");

              return (
                <Card key={app.id} className="border-blue-200 hover-lift shadow-xs">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-slate-900">{app.event.title}</CardTitle>
                      <Badge variant="success">CONFIRMED</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {app.event.venueName} • {new Date(app.event.startsAt).toLocaleDateString("id-ID")}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-3">
                    <div className="text-xs text-slate-600 flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span>Jam Tugas:</span>
                      <span className="font-semibold text-slate-900">
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

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-xs">
                        Check-in:{" "}
                        {checkIn ? (
                          <span className="text-emerald-700 font-bold">✓ Sudah Absen</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Belum Absen</span>
                        )}
                      </div>
                      <Link href={`/attendance/${app.id}`}>
                        <Button size="sm">Buka Presensi GPS</Button>
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
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Riwayat Lamaran Event Anda
        </h3>

        {!profile?.applications || profile.applications.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-500 shadow-2xs">
            Anda belum melamar event apapun.{" "}
            {status === "VERIFIED" ? (
              <Link href="/events" className="text-blue-700 font-bold underline ml-1">
                Jelajahi lowongan event aktif
              </Link>
            ) : (
              "Selesaikan verifikasi berkas terlebih dahulu untuk mulai melamar."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Event</th>
                  <th className="px-4 py-3">Klien</th>
                  <th className="px-4 py-3">Tanggal Penugasan</th>
                  <th className="px-4 py-3">Status Lamaran</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {app.event.title}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{app.event.clientName}</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(app.event.startsAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5">
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
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/events/${app.eventId}`}
                        className="text-blue-700 hover:text-blue-800 font-bold hover:underline"
                      >
                        Detail Event →
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
