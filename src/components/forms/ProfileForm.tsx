"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTalentProfileAction } from "@/server/actions/talent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileFormProps {
  initialData?: any;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    nik: initialData?.nik || "",
    birthPlace: initialData?.birthPlace || "",
    birthDate: initialData?.birthDate
      ? new Date(initialData.birthDate).toISOString().split("T")[0]
      : "",
    gender: (initialData?.gender || "FEMALE") as "MALE" | "FEMALE",
    phone: initialData?.phone || "",
    city: initialData?.city || "",
    instagram: initialData?.instagram || "",
    category: (initialData?.category || "SPG") as "SPG" | "USHER" | "BOTH",
    heightCm: initialData?.heightCm || 165,
    weightKg: initialData?.weightKg || 50,
    clothingSize: initialData?.clothingSize || "S",
    shoeSize: initialData?.shoeSize || 38,
    experience: initialData?.experience || "",
    languages: initialData?.languages?.join(", ") || "Bahasa Indonesia, English",
    specialNotes: initialData?.specialNotes || "",
    consent: !!initialData?.consentAt,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.consent) {
      setError("Anda wajib mencentang persetujuan pemrosesan data pribadi (UU PDP).");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      heightCm: Number(formData.heightCm),
      weightKg: Number(formData.weightKg),
      shoeSize: formData.shoeSize ? Number(formData.shoeSize) : undefined,
      languages: formData.languages
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      consent: true as const,
    };

    const res = await saveTalentProfileAction(payload);

    if (!res.success) {
      setError(res.error || "Gagal menyimpan data diri");
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          Data diri berhasil disimpan! Lanjutkan ke tahap verifikasi foto & video casting.
        </div>
      )}

      {/* 1. Identitas Pribadi */}
      <Card>
        <CardHeader>
          <CardTitle>1. Identitas Pribadi (UU PDP Protected)</CardTitle>
          <p className="text-xs text-zinc-500 mt-1">
            NIK Anda akan disimpan terenkripsi dengan standar AES-256-GCM dan tidak dapat dilihat oleh publik.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap (sesuai KTP)"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Nomor Induk Kependudukan (NIK 16 Digit)"
              value={formData.nik}
              maxLength={16}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "") })}
              placeholder="3171xxxxxxxxxxxx"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tempat Lahir"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              required
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Jenis Kelamin
              </label>
              <select
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "MALE" | "FEMALE",
                  })
                }
              >
                <option value="FEMALE">Wanita</option>
                <option value="MALE">Pria</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="No. WhatsApp / Telepon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              required
            />
            <Input
              label="Kota Domisili"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Jakarta Barat"
              required
            />
            <Input
              label="Akun Instagram (Opsional)"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@username"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Kategori & Fisik */}
      <Card>
        <CardHeader>
          <CardTitle>2. Kategori Talent & Karakteristik Fisik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori Pekerjaan
              </label>
              <select
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as "SPG" | "USHER" | "BOTH",
                  })
                }
              >
                <option value="SPG">SPG (Sales Promotion Girl)</option>
                <option value="USHER">Usher / Penerima Tamu</option>
                <option value="BOTH">Keduanya (SPG & Usher)</option>
              </select>
            </div>

            <Input
              label="Tinggi Badan (cm)"
              type="number"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
              required
            />
            <Input
              label="Berat Badan (kg)"
              type="number"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ukuran Baju (S / M / L / XL)"
              value={formData.clothingSize}
              onChange={(e) => setFormData({ ...formData, clothingSize: e.target.value })}
            />
            <Input
              label="Ukuran Sepatu (36-45)"
              type="number"
              value={formData.shoeSize}
              onChange={(e) => setFormData({ ...formData, shoeSize: Number(e.target.value) })}
            />
            <Input
              label="Bahasa (pisahkan koma)"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="Indonesia, English, Mandarin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Pengalaman Kerja / Event Sebelumnya
            </label>
            <textarea
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Contoh: Usher GIIAS 2024 Booth Toyota, SPG Pekan Raya Jakarta 2023..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Persetujuan UU PDP */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <label htmlFor="consent" className="text-xs text-zinc-600 dark:text-zinc-400">
              Saya secara sadar dan sukarela menyetujui pemrosesan data pribadi (termasuk NIK, foto KTP, foto selfie, dan video perkenalan) untuk keperluan verifikasi identitas, pencocokan wajah otomatis, dan penyaluran pekerjaan event sesuai dengan ketentuan Undang-Undang Perlindungan Data Pribadi (UU PDP).
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={loading} size="lg">
          Simpan Profil Data Diri
        </Button>
      </div>
    </form>
  );
}
