"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewVerificationAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
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
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {talent.user.email} • {talent.phone} • Domisili: {talent.city} • Percobaan ke-
            {verification.attemptNo}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {verification.flags.map((f, i) => (
            <Badge key={i} variant="warning">
              {f}
            </Badge>
          ))}
        </div>
      </div>

      {/* Side-by-side Evidence Photos & AI Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KTP */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">1. Foto KTP</span>
              <Badge variant={verification.nikValid ? "success" : "danger"}>
                {verification.nikValid ? "NIK Valid" : "Format NIK Invalid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-xs text-zinc-400">
                [KTP Path: {verification.ktpPath}]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Selfie */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">2. Foto Selfie Pendaftar</span>
              <span className="text-xs font-bold text-blue-600">
                Match KTP: {verification.matchKtpSelfie ? `${verification.matchKtpSelfie.toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-xs text-zinc-400">
                [Selfie Path: {verification.selfiePath}]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Video Casting Frame */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">3. Frame Video Casting</span>
              <span className="text-xs font-bold text-emerald-600">
                Match Selfie: {verification.matchVideoSelfie ? `${verification.matchVideoSelfie.toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-xs text-zinc-400">
                {video ? `[Video: ${video.durationSec}s | ${video.width}x${video.height}]` : "Tidak ada video"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Talent Specification */}
      <Card>
        <CardHeader>
          <CardTitle>Spesifikasi & Pengalaman Talent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-500">Kategori:</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {talent.category}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Tinggi / Berat:</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {talent.heightCm} cm / {talent.weightKg} kg
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Tempat, Tanggal Lahir:</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {talent.birthPlace},{" "}
                {new Date(talent.birthDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Pengalaman:</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {talent.experience || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Box */}
      <Card>
        <CardHeader>
          <CardTitle>Keputusan Verifikasi (Human Reviewer)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Catatan Review (akan dikirimkan ke email talent)
            </label>
            <textarea
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Contoh: KTP sedikit buram namun wajah cocok dengan video perkenalan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="danger"
              size="md"
              isLoading={submitting}
              onClick={() => handleDecision("REJECTED")}
            >
              Tolak (Reject)
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={submitting}
              onClick={() => handleDecision("APPROVED")}
            >
              Setujui (Approve) & Kirim Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
