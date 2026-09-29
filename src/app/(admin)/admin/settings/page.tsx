import { requireRole } from "@/lib/auth";
import { getAppSetting } from "@/lib/settings";
import { updateSettingAction } from "@/server/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);

  const [threshold, radius, maxLate, maxReupload] = await Promise.all([
    getAppSetting<number>("faceMatchThreshold"),
    getAppSetting<number>("defaultGeofenceRadius"),
    getAppSetting<number>("maxLateMinutes"),
    getAppSetting<number>("maxReuploadPerDay"),
  ]);

  const handleSaveSettings = async (formData: FormData) => {
    "use server";
    const faceMatch = Number(formData.get("faceMatchThreshold"));
    const geofence = Number(formData.get("defaultGeofenceRadius"));
    const late = Number(formData.get("maxLateMinutes"));
    const reupload = Number(formData.get("maxReuploadPerDay"));

    await updateSettingAction("faceMatchThreshold", faceMatch);
    await updateSettingAction("defaultGeofenceRadius", geofence);
    await updateSettingAction("maxLateMinutes", late);
    await updateSettingAction("maxReuploadPerDay", reupload);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Pengaturan Parameter Sistem
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Konfigurasi threshold kecocokan AI Rekognition, radius default geofence, dan batas toleransi tanpa deploy ulang.
        </p>
      </div>

      <form action={handleSaveSettings}>
        <Card>
          <CardHeader>
            <CardTitle>Ambang Batas & Verifikasi AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Threshold AI Face Match Rekognition (%)
              </label>
              <input
                type="number"
                name="faceMatchThreshold"
                defaultValue={threshold || 85}
                min={50}
                max={99}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Nilai minimal kecocokan wajah (KTP vs selfie & selfie vs video) agar tidak diberi flag LOW_MATCH (Rekomendasi: 85-90%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Radius Default Geofence Lokasi (Meter)
              </label>
              <input
                type="number"
                name="defaultGeofenceRadius"
                defaultValue={radius || 100}
                min={20}
                max={1000}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Jarak toleransi GPS default saat pembuatan event baru (misalnya 100 meter di sekitar gedung acara).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Toleransi Keterlambatan Absensi (Menit)
              </label>
              <input
                type="number"
                name="maxLateMinutes"
                defaultValue={maxLate || 15}
                min={0}
                max={60}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Batas waktu keterlambatan sebelum absensi diberi flag LATE.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Maksimal Re-upload Berkas per Hari
              </label>
              <input
                type="number"
                name="maxReuploadPerDay"
                defaultValue={maxReupload || 3}
                min={1}
                max={10}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Mencegah spam upload berkas verifikasi identitas.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit">Simpan Pengaturan</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
