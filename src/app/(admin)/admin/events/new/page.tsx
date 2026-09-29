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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/events" className="text-xs text-blue-600 hover:underline">
          ← Kembali ke Kelola Event
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Buat Lowongan Event Baru
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Tentukan parameter lowongan, honor, jadwal, dan batas radius geofence absensi.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Informasi Umum Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Deskripsi Pekerjaan
              </label>
              <textarea
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Kategori Talent
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
                  <option value="SPG">SPG (Sales Promotion)</option>
                  <option value="USHER">Usher (Penerima Tamu)</option>
                  <option value="BOTH">Keduanya</option>
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
        <Card>
          <CardHeader>
            <CardTitle>2. Lokasi Venue & Geofence Absensi</CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              Koordinat ini digunakan server untuk memvalidasi jarak saat talent melakukan selfie absensi (Haversine distance).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
        <Card>
          <CardHeader>
            <CardTitle>3. Jadwal Waktu & Absensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Persyaratan Kualifikasi Talent
              </label>
              <textarea
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                rows={2}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" size="lg" isLoading={loading}>
            Simpan & Publikasikan Event
          </Button>
        </div>
      </form>
    </div>
  );
}
