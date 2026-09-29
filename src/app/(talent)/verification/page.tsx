"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { VideoCastingUploader, VideoCastingData } from "@/components/upload/VideoCastingUploader";
import { submitVerificationAction } from "@/server/actions/verification";
import { STORAGE_BUCKETS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [ktpPath, setKtpPath] = useState<string | null>(null);
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoCastingData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!ktpPath || !selfiePath || !videoData) {
      setError("Semua berkas (KTP, Selfie, dan Video Casting) wajib diunggah.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await submitVerificationAction({
      ktpPath,
      selfiePath,
      video: videoData,
    });

    if (!res.success) {
      setError(res.error || "Gagal mengirim berkas verifikasi");
      setSubmitting(false);
    } else {
      setDone(true);
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Verifikasi Identitas & Video Casting
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tahapan verifikasi kepatuhan identitas resmi dan kecocokan wajah berbasis AI Rekognition.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Foto KTP" },
            { num: 2, label: "Foto Selfie" },
            { num: 3, label: "Video Casting" },
            { num: 4, label: "Kirim Verifikasi" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                step === s.num
                  ? "bg-blue-50 text-blue-800 font-bold border border-blue-200/80"
                  : step > s.num
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? "bg-blue-700 text-white"
                    : step > s.num
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className="hidden sm:inline text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Step 1: KTP */}
      {step === 1 && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle>Langkah 1: Unggah Foto KTP Asli</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Foto KTP disimpan dalam bucket privat terenkripsi dan hanya dapat diakses oleh admin reviewer resmi.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <ImageUploader
              label="Foto KTP Fisik"
              bucket={STORAGE_BUCKETS.KTP}
              onUploaded={(path) => setKtpPath(path)}
              helper="Pastikan seluruh sudut KTP dan teks nama/NIK dapat terbaca jelas."
            />
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                disabled={!ktpPath}
                onClick={() => setStep(2)}
              >
                Lanjut ke Foto Selfie →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Selfie */}
      {step === 2 && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle>Langkah 2: Foto Selfie Wajah (Close-Up)</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Ambil selfie tegak lurus dengan pencahayaan terang untuk dicocokkan otomatis oleh AI dengan KTP.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <ImageUploader
              label="Foto Selfie Pendaftar"
              bucket={STORAGE_BUCKETS.SELFIES}
              onUploaded={(path) => setSelfiePath(path)}
              helper="Tanpa kacamata hitam atau penutup wajah."
            />
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                ← Kembali
              </Button>
              <Button
                type="button"
                disabled={!selfiePath}
                onClick={() => setStep(3)}
              >
                Lanjut ke Video Casting →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Video Casting */}
      {step === 3 && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle>Langkah 3: Unggah Video Casting (±20 Detik)</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Browser akan mengekstrak frame secara otomatis untuk face match instan tanpa membebani kuota Anda.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <VideoCastingUploader
              onUploaded={(data) => setVideoData(data)}
            />
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                ← Kembali
              </Button>
              <Button
                type="button"
                disabled={!videoData}
                onClick={() => setStep(4)}
              >
                Lanjut ke Konfirmasi →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation & Submission */}
      {step === 4 && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="bg-slate-50/50">
            <CardTitle>Langkah 4: Konfirmasi Berkas & Kirim</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Periksa kelengkapan dokumen sebelum diserahkan ke antrean verifikasi reviewer.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs border border-slate-100">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">1. Berkas Foto KTP:</span>
                <span className={ktpPath ? "text-emerald-700 font-bold" : "text-rose-600"}>
                  {ktpPath ? "✓ Berhasil Terunggah" : "Belum diunggah"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">2. Foto Selfie Wajah:</span>
                <span className={selfiePath ? "text-emerald-700 font-bold" : "text-rose-600"}>
                  {selfiePath ? "✓ Berhasil Terunggah" : "Belum diunggah"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 font-medium">3. Video Casting & Frame:</span>
                <span className={videoData ? "text-emerald-700 font-bold" : "text-rose-600"}>
                  {videoData ? `✓ Siap (${videoData.durationSec}s, ${videoData.framePaths.length} frame JPEG)` : "Belum diunggah"}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
              >
                ← Kembali
              </Button>
              <Button
                type="button"
                isLoading={submitting}
                disabled={!ktpPath || !selfiePath || !videoData}
                onClick={handleSubmit}
                className="shadow-md"
              >
                Kirim Pengajuan Verifikasi Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
