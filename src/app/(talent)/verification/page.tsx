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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Verifikasi Identitas & Video Casting
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Tahap kurasi kelayakan akun talent: KTP, foto selfie, dan video perkenalan diri.
        </p>
      </div>

      {/* Wizard Step Indicators */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        {[
          { num: 1, label: "Foto KTP" },
          { num: 2, label: "Foto Selfie" },
          { num: 3, label: "Video Casting" },
          { num: 4, label: "Review & Kirim" },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-2 cursor-pointer ${
              step === s.num
                ? "text-blue-600 font-bold"
                : step > s.num
                ? "text-emerald-600 font-medium"
                : "text-zinc-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === s.num
                  ? "bg-blue-600 text-white"
                  : step > s.num
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </div>
            <span className="hidden sm:inline text-xs">{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Step 1: KTP */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 1: Unggah Foto KTP Asli</CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              Pastikan seluruh bagian KTP terlihat jelas, tidak buram, dan tidak terpotong. Disimpan di bucket privat terenkripsi.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader
              label="Foto KTP Fisik"
              bucket={STORAGE_BUCKETS.KTP}
              onUploaded={(path) => setKtpPath(path)}
              helper="Hanya dapat diakses oleh admin reviewer untuk verifikasi identitas."
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
        <Card>
          <CardHeader>
            <CardTitle>Langkah 2: Foto Selfie Wajah (Close-Up)</CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              Ambil foto selfie tegak lurus ke kamera dengan pencahayaan yang cukup, tanpa kacamata hitam atau masker.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader
              label="Foto Selfie Pendaftar"
              bucket={STORAGE_BUCKETS.SELFIES}
              onUploaded={(path) => setSelfiePath(path)}
              helper="Akan dicocokkan otomatis oleh AI dengan foto pada KTP dan video casting."
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
        <Card>
          <CardHeader>
            <CardTitle>Langkah 3: Unggah Video Casting (±20 Detik)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                Lanjut ke Ringkasan →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation & Submission */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 4: Konfirmasi & Kirim Verifikasi</CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              Sistem akan menjalankan pengecekan wajah otomatis (AWS Rekognition) dan mengirim berkas ke antrean kurasi admin.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status Foto KTP:</span>
                <span className={ktpPath ? "text-emerald-600 font-semibold" : "text-rose-600"}>
                  {ktpPath ? "✓ Siap" : "Belum diunggah"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status Selfie:</span>
                <span className={selfiePath ? "text-emerald-600 font-semibold" : "text-rose-600"}>
                  {selfiePath ? "✓ Siap" : "Belum diunggah"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status Video Casting:</span>
                <span className={videoData ? "text-emerald-600 font-semibold" : "text-rose-600"}>
                  {videoData ? `✓ Siap (${videoData.durationSec}s, ${videoData.framePaths.length} frame)` : "Belum diunggah"}
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
              >
                Kirim Pengajuan Verifikasi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
