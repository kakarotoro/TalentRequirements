import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          ✨ Platform Rekrutmen & Absensi Cerdas SPG / Usher
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Karier Profesional SPG & Usher dengan Keamanan Terjamin
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Temukan lowongan event terbaik dari brand ternama, proses verifikasi KTP & video casting cepat bertenaga AI, serta sistem absensi geofence yang akurat dan transparan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Daftar Sebagai Talent
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Masuk ke Akun
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Perlindungan Data UU PDP
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            NIK Anda dienkripsi menggunakan AES-256-GCM. Seluruh foto KTP dan video casting disimpan dalam bucket privat dengan akses signed URL berumur pendek.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            🤖
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Verifikasi Wajah AI Otomatis
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pencocokan foto KTP, selfie, dan frame video casting menggunakan AWS Rekognition untuk validasi instan sebelum review akhir oleh admin kurasi.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
            📍
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Absensi Geofence & Anti-Spoof
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Check-in dan check-out berbasis GPS real-time, validasi jarak radius venue (Haversine), timestamp server, dan selfie wajah di tempat bertugas.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-zinc-100 dark:bg-zinc-900/50 p-8 sm:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100">
          4 Langkah Mudah Memulai
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-2xl font-black text-blue-600">01</span>
            <h4 className="font-bold text-sm mt-2">Daftar Akun</h4>
            <p className="text-xs text-zinc-500 mt-1">Registrasi dengan email & persetujuan UU PDP.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-2xl font-black text-blue-600">02</span>
            <h4 className="font-bold text-sm mt-2">Isi Data & KTP</h4>
            <p className="text-xs text-zinc-500 mt-1">Lengkapi profil fisik, ukuran, dan unggah KTP + selfie.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-2xl font-black text-blue-600">03</span>
            <h4 className="font-bold text-sm mt-2">Video Casting</h4>
            <p className="text-xs text-zinc-500 mt-1">Unggah video perkenalan 20 detik untuk kurasi AI.</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-2xl font-black text-blue-600">04</span>
            <h4 className="font-bold text-sm mt-2">Lamar Event</h4>
            <p className="text-xs text-zinc-500 mt-1">Setelah diverifikasi, langsung lamar event dan lakukan absensi live.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
