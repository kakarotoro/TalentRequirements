"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewVerificationAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStoragePublicUrl } from "@/lib/storage";

interface ReviewPanelProps {
  verification: {
    id: string;
    talentId: string;
    attemptNo: number;
    ktpPath: string;
    selfiePath: string;
    nikValid: boolean;
    ocrMatch: boolean | null;
    matchKtpSelfie: number | null;
    matchVideoSelfie: number | null;
    flags: string[];
    decision: string;
    reviewNote: string | null;
    submittedAt: string;
    talent: {
      fullName: string;
      birthPlace: string;
      birthDate: string;
      gender: string;
      phone: string;
      city: string;
      category: string;
      heightCm: number;
      weightKg: number;
      experience: string | null;
      user: { email: string };
    };
    video?: {
      storagePath: string;
      framePaths: string[];
      durationSec: number;
      width: number;
      height: number;
      validation: string;
      validationFlags: string[];
    } | null;
  };
}

export function ReviewPanel({ verification }: ReviewPanelProps) {
  const router = useRouter();
  const [note, setNote] = useState(verification.reviewNote || "");
  const [submitting, setSubmitting] = useState(false);
  const [currentDecision, setCurrentDecision] = useState(verification.decision);

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    setSubmitting(true);
    const res = await reviewVerificationAction({
      verificationId: verification.id,
      decision,
      reviewNote: note,
    });

    if (res.success) {
      setCurrentDecision(decision);
      router.refresh();
    } else {
      alert(res.error || "Gagal memproses review");
    }
    setSubmitting(false);
  };

  const { talent, video } = verification;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-lg shrink-0">
            {talent.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                {talent.fullName}
              </h1>
              <Badge
                variant={
                  currentDecision === "APPROVED"
                    ? "success"
                    : currentDecision === "REJECTED"
                    ? "danger"
                    : "warning"
                }
              >
                {currentDecision}
              </Badge>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Percobaan #{verification.attemptNo}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {talent.user.email} • {talent.phone} • Domisili: <strong className="text-slate-700">{talent.city}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {verification.flags.length > 0 ? (
            verification.flags.map((f, i) => (
              <Badge key={i} variant="warning">
                ⚠️ {f}
              </Badge>
            ))
          ) : (
            <Badge variant="success">
              ✓ Rekognition Bersih
            </Badge>
          )}
        </div>
      </div>

      {/* Side-by-side Evidence Photos & AI Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KTP */}
        <Card className="border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <CardHeader className="py-3.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                1. Dokumen KTP
              </div>
              <Badge variant={verification.nikValid ? "success" : "danger"}>
                {verification.nikValid ? "NIK Valid (16 Digits)" : "NIK Invalid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 text-center relative group">
              {verification.ktpPath && !verification.ktpPath.startsWith("mock/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getStoragePublicUrl("ktp", verification.ktpPath)}
                  alt="KTP Talent"
                  className="w-full h-full object-contain bg-slate-900/5"
                />
              ) : (
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    Berkas Fisik Belum Tersimpan
                  </span>
                  <span className="text-[10px] text-amber-700 mt-1 leading-snug">
                    Terunggah sebelum sistem storage aktif. Silakan tolak (reject) agar talent mengunggah ulang.
                  </span>
                </div>
              )}
            </div>

            {verification.ktpPath.startsWith("mock/") ? (
              <div className="mt-3 p-2 rounded-xl text-center text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                ⚠️ File fisik tidak tersedia di server
              </div>
            ) : (
              <a
                href={`/api/admin/download?bucket=ktp&path=${encodeURIComponent(verification.ktpPath)}&filename=KTP_${talent.fullName.replace(/\s+/g, '_')}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Dokumen KTP
              </a>
            )}
          </CardContent>
        </Card>

        {/* Selfie */}
        <Card className="border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <CardHeader className="py-3.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                2. Foto Selfie Pendaftar
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Match: {verification.matchKtpSelfie ? `${verification.matchKtpSelfie.toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 text-center relative group">
              {verification.selfiePath && !verification.selfiePath.startsWith("mock/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getStoragePublicUrl("selfies", verification.selfiePath)}
                  alt="Foto Selfie Talent"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    Foto Selfie Belum Tersimpan
                  </span>
                  <span className="text-[10px] text-amber-700 mt-1 leading-snug">
                    Terunggah sebelum sistem storage aktif.
                  </span>
                </div>
              )}
            </div>

            {verification.selfiePath.startsWith("mock/") ? (
              <div className="mt-3 p-2 rounded-xl text-center text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                ⚠️ File fisik tidak tersedia di server
              </div>
            ) : (
              <a
                href={`/api/admin/download?bucket=selfies&path=${encodeURIComponent(verification.selfiePath)}&filename=Foto_${talent.fullName.replace(/\s+/g, '_')}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Foto Selfie
              </a>
            )}
          </CardContent>
        </Card>

        {/* Video Casting Frame */}
        <Card className="border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <CardHeader className="py-3.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                3. Video Casting (Liveness)
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Match: {verification.matchVideoSelfie ? `${verification.matchVideoSelfie.toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 text-center relative group p-4">
              <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-mono text-slate-600">
                {video ? `${video.durationSec}s • ${video.width}x${video.height}px` : "Belum diunggah"}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Liveness Video Verification</span>
            </div>

            {video?.storagePath && (
              <a
                href={`/api/admin/download?bucket=videos&path=${encodeURIComponent(video.storagePath)}&filename=Video_${talent.fullName.replace(/\s+/g, '_')}.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Talent Specification */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
            Spesifikasi Fisik & Pengalaman Talent
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kategori Talent:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {talent.category}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tinggi / Berat:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {talent.heightCm} cm / {talent.weightKg} kg
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kelahiran:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {talent.birthPlace},{" "}
                {new Date(talent.birthDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pengalaman:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">
                {talent.experience || "Fresh Talent"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Box */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
            Keputusan Kurasi Verifikasi (Human Reviewer)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan Review Administrator (dikirimkan otomatis via notifikasi email)
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              rows={3}
              placeholder="Contoh: Seluruh berkas KTP, selfie, dan video perkenalan telah diverifikasi dan memenuhi standar agensi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {/* Quick Note Templates */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Template Cepat:</span>
              <button
                type="button"
                onClick={() => setNote("Berkas identitas dan perkenalan video telah diverifikasi valid dan memenuhi kriteria.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                ✓ Verifikasi Valid
              </button>
              <button
                type="button"
                onClick={() => setNote("Foto KTP buram / tidak terbaca dengan jelas. Silakan unggah ulang KTP asli berorientasi horizontal.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                ⚠️ KTP Buram
              </button>
              <button
                type="button"
                onClick={() => setNote("Kemiripan wajah pada selfie tidak sesuai dengan KTP. Harap unggah foto selfie terbaru tanpa filter.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                ⚠️ Wajah Tidak Cocok
              </button>
              <button
                type="button"
                onClick={() => setNote("Berkas fisik KTP belum tersimpan di server karena kendala sistem saat Anda submit. Mohon unggah ulang foto KTP asli Anda.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-colors"
              >
                ⚠️ Minta Upload Ulang KTP
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="danger"
              size="md"
              className="font-bold shadow-xs"
              isLoading={submitting}
              onClick={() => handleDecision("REJECTED")}
            >
              ✕ Tolak Pengajuan (Reject)
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="font-bold shadow-xs"
              isLoading={submitting}
              onClick={() => handleDecision("APPROVED")}
            >
              ✓ Setujui (Approve) & Aktivasi Akun
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
