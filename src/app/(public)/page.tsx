import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="space-y-16 py-6 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6 pb-2">


        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Get Verified. <span className="text-blue-700">Get Hired.</span>
        </h1>

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
              title: "Penugasan Langsung (Japri)",
              desc: "Admin akan langsung menghubungi Anda secara personal via WhatsApp saat ada event yang cocok.",
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
