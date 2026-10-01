"use client";

import { useState } from "react";
import { requestUploadUrlAction } from "@/server/actions/verification";
import { StorageBucket } from "@/lib/storage";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  label: string;
  bucket: StorageBucket;
  onUploaded: (storagePath: string) => void;
  helper?: string;
}

export function ImageUploader({
  label,
  bucket,
  onUploaded,
  helper,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Hanya format JPG, PNG, atau WEBP yang diizinkan");
      return;
    }

    // Validate size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB");
      return;
    }

    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploadedPath(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const res = await requestUploadUrlAction({
        bucket,
        fileExt: ext,
        sizeBytes: file.size,
      });

      if (!res.success || !res.signedUrl || !res.path) {
        throw new Error(res.error || "Gagal mendapatkan izin upload");
      }

      // Upload directly to Supabase storage signed URL
      const uploadRes = await fetch(res.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Gagal menyimpan file ke server (Status: ${uploadRes.status}). Silakan coba lagi.`);
      }

      setUploadedPath(res.path);
      onUploaded(res.path);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Gagal mengunggah foto ke server. Pastikan koneksi internet stabil dan coba lagi.");
      setUploadedPath(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
        {label}
      </div>
      {helper && <p className="text-xs text-zinc-500 mb-3">{helper}</p>}

      {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}

      {preview ? (
        <div className="space-y-3">
          <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center gap-3">
            {!uploadedPath ? (
              <Button
                type="button"
                size="sm"
                isLoading={uploading}
                onClick={handleUpload}
              >
                Unggah Foto
              </Button>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                ✓ Berhasil Diunggah
              </span>
            )}

            <button
              type="button"
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              onClick={() => {
                setFile(null);
                setPreview(null);
                setUploadedPath(null);
              }}
            >
              Ganti Foto
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
          <svg
            className="w-8 h-8 text-zinc-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            Pilih Foto (JPG/PNG max 5MB)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
