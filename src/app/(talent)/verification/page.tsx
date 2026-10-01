import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationForm } from "./VerificationForm";

export default async function VerificationPage() {
  const session = await requireRole(["TALENT"]);

  const profile = await prisma.talentProfile.findUnique({
    where: { userId: session.id },
    include: {
      verifications: {
        orderBy: { attemptNo: "desc" },
        take: 1,
        include: { video: true },
      },
    },
  });

  if (!profile) {
    redirect("/profile");
  }

  const latestVerif = profile.verifications[0];
  const status = profile.status;

  // 1. If status is already VERIFIED
  if (status === "VERIFIED") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Status Verifikasi Identitas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status kepatuhan identitas resmi dan aktivasi akun talent Anda.
          </p>
        </div>

        <Card className="border-emerald-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="bg-emerald-600 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Akun Anda Telah Terverifikasi!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
              Seluruh berkas identitas Anda (KTP, Selfie, dan Video Casting) telah disetujui oleh tim kurasi SHP Entertainment.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              STATUS: TERVERIFIKASI &amp; AKTIF
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dokumen KTP Fisik</h4>
                    <p className="text-[11px] text-slate-500">NIK terdaftar dan tervalidasi</p>
                  </div>
                </div>
                <Badge variant="success">✓ Terverifikasi</Badge>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Foto Selfie Wajah</h4>
                    <p className="text-[11px] text-slate-500">Kesesuaian wajah dengan KTP terverifikasi</p>
                  </div>
                </div>
                <Badge variant="success">✓ Terverifikasi</Badge>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Video Casting Perkenalan</h4>
                    <p className="text-[11px] text-slate-500">Kesesuaian gestur dan audio perkenalan</p>
                  </div>
                </div>
                <Badge variant="success">✓ Terverifikasi</Badge>
              </div>
            </div>

            {latestVerif?.reviewNote && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Catatan Reviewer:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{latestVerif.reviewNote}&rdquo;
                </p>
                {latestVerif.reviewedAt && (
                  <span className="text-[10px] text-slate-400 block mt-1.5">
                    Disetujui pada: {new Date(latestVerif.reviewedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} WIB
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="md" className="font-bold shadow-xs">
                  ← Ke Dashboard Utama
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="md">
                  Lihat Data Diri
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. If status is PENDING_REVIEW
  if (status === "PENDING_REVIEW") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Status Verifikasi Identitas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status kepatuhan identitas resmi dan antrean kurasi akun talent Anda.
          </p>
        </div>

        <Card className="border-blue-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
              <svg className="w-9 h-9 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Berkas Anda Sedang Ditinjau Tim Kurasi
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
              Dokumen verifikasi (KTP, Selfie, dan Video Casting) telah berhasil kami terima dan sedang dalam antrean pemeriksaan oleh admin reviewer SHP Entertainment.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-blue-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              STATUS: DALAM PROSES KURASI
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dokumen KTP Fisik</h4>
                    <p className="text-[11px] text-slate-500">Berkas berhasil diunggah dan disimpan</p>
                  </div>
                </div>
                <Badge variant="warning">Sedang Ditinjau</Badge>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Foto Selfie Wajah</h4>
                    <p className="text-[11px] text-slate-500">Berkas berhasil diunggah</p>
                  </div>
                </div>
                <Badge variant="warning">Sedang Ditinjau</Badge>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Video Casting Perkenalan</h4>
                    <p className="text-[11px] text-slate-500">Berkas berhasil diunggah</p>
                  </div>
                </div>
                <Badge variant="warning">Sedang Ditinjau</Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
              <p className="leading-relaxed">
                ℹ️ Anda <b>tidak perlu mengunggah ulang berkas</b>. Begitu admin selesai melakukan review, notifikasi dan status akun Anda akan langsung berubah secara otomatis.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="md" className="font-bold shadow-xs">
                  ← Kembali ke Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. If status is DRAFT or REJECTED
  return (
    <VerificationForm
      lastRejectionNote={status === "REJECTED" ? latestVerif?.reviewNote : null}
    />
  );
}
