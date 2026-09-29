"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEventAction } from "@/server/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    description: "",
    venueName: "",
    address: "",
    latitude: -6.2088,
    longitude: 106.8456,
    radiusMeters: 100,
    startsAt: "",
    endsAt: "",
    checkInOpensMinutesBefore: 60,
    requiredCount: 4,
    category: "SPG" as "SPG" | "USHER" | "BOTH",
    fee: 750000,
    requirements: "Usia 18-27 tahun, tinggi min. 165 cm, berpenampilan rapi.",
    status: "OPEN" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createEventAction(formData);

    if (!res.success) {
      setError(res.error || "Gagal membuat event");
      setLoading(false);
    } else {
      router.push("/admin/events");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Kelola Event
        </Link>
      </div>

      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Buat Lowongan Penugasan Baru
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Tentukan parameter lowongan, honor, jadwal, dan batas radius geofence absensi di lokasi penugasan.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold">1</span>
              Informasi Umum Penugasan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama / Judul Event"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Booth VIP Launching Brand Otomotif"
                required
              />
              <Input
                label="Nama Klien / Perusahaan"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="PT Klien Maju Bersama"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Deskripsi Pekerjaan
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                rows={3}
                placeholder="Jelaskan ruang lingkup pekerjaan dan tanggung jawab talent di booth..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kategori Talent
                </label>
                <select
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as "SPG" | "USHER" | "BOTH",
                    })
                  }
                >
                  <option value="SPG">SPG (Sales Promotion Girl)</option>
                  <option value="USHER">Usher (Penerima Tamu VIP)</option>
                  <option value="BOTH">Keduanya (SPG & Usher)</option>
                </select>
              </div>

              <Input
                label="Kebutuhan Talent (orang)"
                type="number"
                value={formData.requiredCount}
                onChange={(e) => setFormData({ ...formData, requiredCount: Number(e.target.value) })}
                required
              />

              <Input
                label="Honor (Fee) per Talent (Rp)"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Lokasi & Geofence */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold">2</span>
              Lokasi Venue & Geofence Absensi
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Titik koordinat divalidasi dengan server menggunakan rumus Haversine saat talent mengirim absensi selfie.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Venue / Tempat"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                placeholder="Contoh: Jakarta International Expo (JIExpo)"
                required
              />
              <Input
                label="Alamat Lengkap"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. H. Benyamin Sueb, Kemayoran, Jakarta Pusat"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Latitude Venue"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                required
              />
              <Input
                label="Longitude Venue"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                required
              />
              <Input
                label="Radius Geofence (Meter)"
                type="number"
                value={formData.radiusMeters}
                onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                helperText="Toleransi jarak absensi (default 100m)"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Waktu & Durasi */}
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold">3</span>
              Jadwal Waktu & Persyaratan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Waktu Mulai Event"
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                required
              />
              <Input
                label="Waktu Selesai Event"
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                required
              />
              <Input
                label="Absen Dibuka (Menit Sebelumnya)"
                type="number"
                value={formData.checkInOpensMinutesBefore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    checkInOpensMinutesBefore: Number(e.target.value),
                  })
                }
                helperText="Absen dibuka X menit sebelum mulai"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kualifikasi & Persyaratan Khusus Talent
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                rows={2}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="lg" className="font-bold shadow-xs" isLoading={loading}>
            ✓ Simpan & Publikasikan Event
          </Button>
        </div>
      </form>
    </div>
  );
}
