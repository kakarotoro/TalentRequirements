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
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          ✓ Data diri profil berhasil diperbarui! Lanjutkan ke tahap verifikasi foto & video perkenalan.
        </div>
      )}

      {/* 1. Identitas Resmi (UU PDP) */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <CardTitle>Identitas Pribadi Resmi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Sesuai KTP"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Contoh: Jessica Anggraini"
              required
            />
            <Input
              label="Nomor Induk Kependudukan (16 Digit NIK)"
              value={formData.nik}
              maxLength={16}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "") })}
              placeholder="3171xxxxxxxxxxxx"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Kota Kelahiran"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              placeholder="Jakarta"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Jenis Kelamin
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all duration-150 cursor-pointer"
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
              label="WhatsApp / No. Telepon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              required
            />
            <Input
              label="Kota Domisili Saat Ini"
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

      {/* 2. Kategori & Karakteristik Fisik */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            <CardTitle>Kategori Pekerjaan & Karakteristik Fisik</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori Pekerjaan
              </label>
              <select
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all duration-150 cursor-pointer"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as "SPG" | "USHER" | "BOTH",
                  })
                }
              >
                <option value="SPG">SPG (Sales Promotion Girl)</option>
                <option value="USHER">Usher / Penerima Tamu VIP</option>
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
              label="Ukuran Busana (S / M / L)"
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
              label="Bahasa Dikuasai"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="Indonesia, English"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Riwayat Pengalaman Event
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all duration-150"
              rows={3}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Sebutkan brand atau event yang pernah Anda ikuti (mis. GIIAS 2024, IIMS, PRJ)..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Pernyataan Persetujuan UU PDP */}
      <Card className="border-blue-200 bg-blue-50/40 shadow-2xs">
        <CardContent className="p-5">
          <div className="flex items-start gap-3.5">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
              required
            />
            <label htmlFor="consent" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
              <strong>Persetujuan Resmi Perlindungan Data Pribadi (UU PDP):</strong> Saya secara sadar memberikan izin pemrosesan data identitas (NIK, foto KTP, foto selfie, dan video perkenalan) secara terenkripsi untuk kebutuhan verifikasi kurasi AI, rekrutmen penempatan kerja, dan validasi absensi GPS oleh tim manajemen.
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={loading} size="lg" className="shadow-md">
          Simpan Data Profil Talent
        </Button>
      </div>
    </form>
  );
}
