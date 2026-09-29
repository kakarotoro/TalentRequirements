import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="space-y-20 py-6 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/90 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Platform Resmi Rekrutmen & Absensi Digital SPG / Usher
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Penyaluran Talent Profesional dengan <span className="text-blue-700">Verifikasi Terpercaya</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Solusi terpadu bagi agensi dan brand untuk kurasi talent SPG & Usher dengan keamanan data standar UU PDP, face match otomatis, dan absensi geofence di lokasi penugasan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-md">
              Daftar Sebagai Talent Sekarang
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Masuk ke Portal
            </Button>
          </Link>
        </div>
      </section>

      {/* Corporate Highlights Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div className="text-center border-r border-slate-100 last:border-none p-3">
          <div className="text-2xl sm:text-3xl font-black text-blue-700">AES-256</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Enkripsi NIK & Data Diri</p>
        </div>
        <div className="text-center border-r border-slate-100 last:border-none p-3">
          <div className="text-2xl sm:text-3xl font-black text-blue-700">AWS Rekognition</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Pencocokan Wajah Otomatis</p>
        </div>
        <div className="text-center border-r border-slate-100 last:border-none p-3">
          <div className="text-2xl sm:text-3xl font-black text-blue-700">Geofence GPS</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Validasi Radius Venue Acara</p>
        </div>
        <div className="text-center p-3">
          <div className="text-2xl sm:text-3xl font-black text-blue-700">UU PDP</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Persetujuan & Audit Immutable</p>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover-lift space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            Keamanan Data & Privasi Resmi
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Data NIK dan berkas identitas Anda dienkripsi tingkat bank. Foto KTP hanya dapat dibuka dengan URL berumur 60 detik oleh admin terverifikasi dan setiap akses tercatat di log audit.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover-lift space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            Kurasi Cerdas & Video Casting
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Proses kurasi modern tanpa tes fisik melelahkan. Klien mengekstrak frame dari video casting langsung di browser untuk mencocokkan wajah dengan KTP secara otomatis.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover-lift space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            Absensi Presisi & Anti-Kecurangan
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Check-in dan check-out menggunakan verifikasi jarak koordinat Haversine, inspeksi EXIF waktu kamera, dan selfie wajah memastikan talent hadir tepat waktu di venue.
          </p>
        </div>
      </section>

      {/* Onboarding Steps */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 space-y-8 shadow-xs">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
            Alur Kerja Sistem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            4 Langkah Mudah Memulai Tugas Event
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
          {[
            {
              step: "01",
              title: "Registrasi Akun",
              desc: "Daftar dengan email dan setujui ketentuan perlindungan data UU PDP.",
            },
            {
              step: "02",
              title: "Lengkapi Data Diri",
              desc: "Isi data fisik, ukuran baju, pengalaman kerja, serta unggah KTP & selfie.",
            },
            {
              step: "03",
              title: "Video Perkenalan",
              desc: "Unggah video casting singkat untuk verifikasi otomatis AI Rekognition.",
            },
            {
              step: "04",
              title: "Lamar & Absensi",
              desc: "Pilih event brand ternama, dapatkan konfirmasi, dan lakukan absensi live.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover-lift space-y-2"
            >
              <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-700 text-white">
                {item.step}
              </span>
              <h4 className="font-bold text-sm text-slate-900 pt-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
