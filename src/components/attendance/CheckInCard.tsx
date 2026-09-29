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
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Absensi {type === "CHECK_IN" ? "Masuk (Check-In)" : "Pulang (Check-Out)"}
          </CardTitle>
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
        <p className="text-xs text-zinc-500 mt-1">
          {event.title} • {event.venueName}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {isDone ? (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-2 text-xs">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Absensi Berhasil Tercatat
            </p>
            <p>
              <strong>Waktu Server:</strong>{" "}
              {new Date(result.serverTimestamp).toLocaleTimeString("id-ID")}
            </p>
            <p>
              <strong>Jarak ke Venue:</strong> {result.distanceMeters ?? 0} meter
            </p>
            {result.flags && result.flags.length > 0 && (
              <p className="text-amber-600">
                <strong>Catatan Verifikasi:</strong> {result.flags.join(", ")}
              </p>
            )}
            {result.adminNote && (
              <p className="text-blue-600">
                <strong>Catatan Admin:</strong> {result.adminNote}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* GPS Status */}
            <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Lokasi GPS Anda
                </span>
                <button
                  type="button"
                  onClick={getCoordinates}
                  className="text-xs text-blue-600 hover:underline"
                  disabled={loadingGps}
                >
                  {loadingGps ? "Mencari GPS..." : "Perbarui GPS"}
                </button>
              </div>

              {gpsError && <p className="text-xs text-rose-600">{gpsError}</p>}

              {gps && (
                <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                  <p>
                    Jarak ke Venue: <strong>{currentDistance} meter</strong> (Radius batas: {event.radiusMeters} m)
                  </p>
                  <p>
                    Status Geofence:{" "}
                    {isInside ? (
                      <span className="text-emerald-600 font-semibold">✓ Di dalam area event</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        Di luar radius venue (perlu review admin)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Akurasi GPS HP: ±{Math.round(gps.accuracy)}m
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
              className="w-full"
              size="lg"
              isLoading={submitting}
              disabled={!gps || !selfiePath}
              onClick={handleSubmit}
            >
              Kirim Absensi {type}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
