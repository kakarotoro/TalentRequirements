import { getEventDetailAction } from "@/server/actions/events";
import { applyEventAction } from "@/server/actions/applications";
import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(["TALENT", "ADMIN"]);
  const res = await getEventDetailAction(id);

  if (!res.success || !res.event) {
    notFound();
  }

  const { event, userApplication } = res;

  const handleApply = async () => {
    "use server";
    await applyEventAction(id);
    redirect(`/events/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/events" className="text-xs text-blue-600 hover:underline">
          ← Kembali ke Daftar Lowongan
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">{event.category}</Badge>
              <Badge variant={event.status === "OPEN" ? "success" : "neutral"}>
                {event.status}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {event.title}
            </h1>
            <p className="text-sm font-semibold text-blue-600 mt-1">
              Klien: {event.clientName}
            </p>
          </div>

          {event.fee && (
            <div className="sm:text-right">
              <span className="text-xs text-zinc-500">Honor (Fee)</span>
              <div className="text-xl font-bold text-emerald-600">
                Rp {event.fee.toLocaleString("id-ID")}
              </div>
            </div>
          )}
        </div>

        {/* Application Status Banner */}
        {userApplication && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Status Lamaran Anda:</span>
              <div className="font-bold text-sm text-blue-800 dark:text-blue-300 mt-0.5">
                {userApplication.status}
              </div>
            </div>

            {userApplication.status === "CONFIRMED" && (
              <Link href={`/attendance/${userApplication.id}`}>
                <Button size="sm">Buka Halaman Absensi</Button>
              </Link>
            )}
          </div>
        )}

        {/* Event Specifics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-xs">
          <div>
            <span className="text-zinc-500">Lokasi Venue:</span>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {event.venueName}
            </p>
            <p className="text-zinc-500 mt-0.5">{event.address}</p>
          </div>
          <div>
            <span className="text-zinc-500">Jadwal & Geofence:</span>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {new Date(event.startsAt).toLocaleString("id-ID")} -{" "}
              {new Date(event.endsAt).toLocaleTimeString("id-ID")}
            </p>
            <p className="text-zinc-500 mt-0.5">
              Radius Geofence Absensi: {event.radiusMeters} meter
            </p>
          </div>
        </div>

        {/* Description & Requirements */}
        <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Deskripsi Pekerjaan
            </h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {event.description || "Tidak ada deskripsi khusus."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Kualifikasi & Persyaratan Khusus
            </h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {event.requirements || "Tinggi proporsional, ramah, dan profesional."}
            </p>
          </div>
        </div>

        {/* Apply Action */}
        {!userApplication && (
          <form action={handleApply} className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={user.status !== "VERIFIED" || event.status !== "OPEN"}
            >
              {user.status !== "VERIFIED"
                ? "Verifikasi Akun Diperlukan untuk Melamar"
                : "Kirim Lamaran Sekarang"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
