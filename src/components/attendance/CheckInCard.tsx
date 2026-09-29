"use client";

import { useState, useEffect } from "react";
import { submitAttendanceAction } from "@/server/actions/attendance";
import { calculateHaversineDistance } from "@/lib/geo";
import { STORAGE_BUCKETS } from "@/lib/storage";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CheckInCardProps {
  applicationId: string;
  type: "CHECK_IN" | "CHECK_OUT";
  event: {
    title: string;
    venueName: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    startsAt: string;
    endsAt: string;
  };
  existingAttendance?: any;
}

export function CheckInCard({
  applicationId,
  type,
  event,
  existingAttendance,
}: CheckInCardProps) {
  const [gps, setGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(existingAttendance || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCoordinates = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung Geolocation GPS.");
      return;
    }

    setLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoadingGps(false);
      },
      (err) => {
        setGpsError(`Gagal mengambil GPS: ${err.message}. Pastikan izin lokasi aktif.`);
        setLoadingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!existingAttendance) {
      getCoordinates();
    }
  }, [existingAttendance]);

  const currentDistance =
    gps && event.latitude
      ? calculateHaversineDistance(
          gps.latitude,
          gps.longitude,
          event.latitude,
          event.longitude
        )
      : null;

  const isInside =
    currentDistance !== null ? currentDistance <= event.radiusMeters : null;

  const handleSubmit = async () => {
    if (!gps) {
      setErrorMessage("Silakan dapatkan lokasi GPS terlebih dahulu.");
      return;
    }
    if (!selfiePath) {
      setErrorMessage("Silakan ambil dan unggah foto selfie absensi di lokasi.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await submitAttendanceAction({
      applicationId,
      type,
      latitude: gps.latitude,
      longitude: gps.longitude,
      accuracyMeters: gps.accuracy,
      selfiePath,
    });

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mengirim absensi");
    } else {
      setResult(res.attendance);
    }
    setSubmitting(false);
  };

  const isDone = !!result;

  return (
    <Card className="max-w-lg mx-auto border-slate-200/90 shadow-2xs">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${type === "CHECK_IN" ? "bg-blue-600" : "bg-indigo-600"}`}>
              {type === "CHECK_IN" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Absensi {type === "CHECK_IN" ? "Masuk (Check-In)" : "Pulang (Check-Out)"}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {event.title} • {event.venueName}
              </p>
            </div>
          </div>
          {isDone && (
            <Badge
              variant={
                result.status === "VALID"
                  ? "success"
                  : result.status === "NEEDS_REVIEW"
                  ? "warning"
                  : "danger"
              }
            >
              {result.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {isDone ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Absensi Berhasil Tercatat
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Waktu Server</span>
                <p className="font-semibold text-slate-900">
                  {new Date(result.serverTimestamp).toLocaleTimeString("id-ID")} WIB
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Jarak ke Venue</span>
                <p className="font-semibold text-slate-900">
                  {result.distanceMeters ?? 0} meter
                </p>
              </div>
            </div>
            {result.flags && result.flags.length > 0 && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs">
                <strong>Catatan Verifikasi:</strong> {result.flags.join(", ")}
              </div>
            )}
            {result.adminNote && (
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 text-xs">
                <strong>Catatan Admin:</strong> {result.adminNote}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* GPS Status */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lokasi GPS Anda
                </span>
                <button
                  type="button"
                  onClick={getCoordinates}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                  disabled={loadingGps}
                >
                  {loadingGps ? "Mencari GPS..." : "Perbarui Lokasi"}
                </button>
              </div>

              {gpsError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                  {gpsError}
                </p>
              )}

              {gps && (
                <div className="text-xs space-y-1.5 text-slate-600 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span>Jarak ke Titik Venue:</span>
                    <strong className="text-slate-900">{currentDistance} meter</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Radius Toleransi:</span>
                    <span className="text-slate-700">{event.radiusMeters} meter</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>Status Geofence:</span>
                    {isInside ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Di dalam area event
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Di luar radius venue
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Akurasi perangkat GPS: ±{Math.round(gps.accuracy)}m
                  </p>
                </div>
              )}
            </div>

            {/* Selfie Upload */}
            <ImageUploader
              label="Foto Selfie di Lokasi Event"
              helper="Ambil selfie langsung di area venue. Wajah harus jelas dan pencahayaan terang."
              bucket={STORAGE_BUCKETS.ATTENDANCE}
              onUploaded={(path) => setSelfiePath(path)}
            />

            <Button
              type="button"
              className="w-full font-bold shadow-xs"
              size="lg"
              isLoading={submitting}
              disabled={!gps || !selfiePath}
              onClick={handleSubmit}
            >
              Kirim Absensi {type === "CHECK_IN" ? "Masuk" : "Pulang"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
