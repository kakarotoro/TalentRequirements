import { getEventDetailAction } from "@/server/actions/events";
import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["TALENT", "ADMIN"]);
  const res = await getEventDetailAction(id);

  if (!res.success || !res.event) {
    notFound();
  }

  const { event, userApplication } = res;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Badge variant="info">{event.category}</Badge>
              <Badge variant={event.status === "OPEN" ? "success" : "neutral"}>
                {event.status === "OPEN" ? "Pendaftaran Terbuka" : event.status}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {event.title}
            </h1>
            <p className="text-sm font-semibold text-blue-700 mt-1">
              Klien Korporat: {event.clientName}
            </p>
          </div>

          {event.fee && (
            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-200 sm:border-0">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Honor (Fee)</span>
              <div className="text-2xl font-black text-emerald-700">
                Rp {event.fee.toLocaleString("id-ID")}
              </div>
            </div>
          )}
        </div>

        {/* Application Status Banner */}
        {userApplication && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-slate-600 font-medium">Status Pengajuan Anda:</span>
              <div className="font-bold text-sm text-blue-800 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                {userApplication.status}
              </div>
            </div>

            {userApplication.status === "CONFIRMED" && (
              <Link href={`/attendance/${userApplication.id}`}>
                <Button size="sm" className="font-semibold shadow-xs">
                  Buka Absensi Sekarang →
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Event Specifics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Lokasi Penugasan:</span>
            <p className="font-bold text-slate-900 mt-1 text-sm">
              {event.venueName}
            </p>
            <p className="text-slate-600 mt-0.5 leading-relaxed">{event.address}</p>
          </div>
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Waktu & Geofence GPS:</span>
            <p className="font-bold text-slate-900 mt-1 text-sm">
              {new Date(event.startsAt).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-slate-600 mt-0.5">
              Pukul {new Date(event.startsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
              {new Date(event.endsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </p>
            <p className="text-blue-700 font-semibold mt-1">
              📍 Radius Toleransi Absensi: {event.radiusMeters} meter
            </p>
          </div>
        </div>

        {/* Description & Requirements */}
        <div className="space-y-5 text-sm text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              Deskripsi Tugas
            </h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {event.description || "Tidak ada deskripsi khusus."}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              Kualifikasi & Persyaratan Khusus
            </h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {event.requirements || "Tinggi badan proporsional, ramah, komunikasi lancar, dan berpenampilan rapi."}
            </p>
          </div>
        </div>

        {/* Assignment Notice */}
        {!userApplication && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center leading-relaxed">
            Penugasan untuk event ini dikelola langsung oleh tim internal. Tim Admin akan menghubungi Anda secara langsung (japri via WhatsApp) bila profil Anda terpilih.
          </div>
        )}
      </div>
    </div>
  );
}
