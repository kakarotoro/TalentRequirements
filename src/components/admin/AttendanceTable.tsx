"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { correctAttendanceAction } from "@/server/actions/attendance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  id: string;
  type: string;
  serverTimestamp: string;
  distanceMeters: number | null;
  matchScore: number | null;
  isLate: boolean;
  status: "VALID" | "NEEDS_REVIEW" | "REJECTED";
  flags: string[];
  adminNote: string | null;
  application: {
    talent: {
      fullName: string;
      phone: string;
      category: string;
    };
  };
}

interface AttendanceTableProps {
  attendances: AttendanceRecord[];
}

export function AttendanceTable({ attendances }: AttendanceTableProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<AttendanceRecord | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCorrect = async (status: "VALID" | "REJECTED") => {
    if (!selectedItem) return;
    setSubmitting(true);
    const res = await correctAttendanceAction({
      attendanceId: selectedItem.id,
      status,
      adminNote,
    });

    if (res.success) {
      setSelectedItem(null);
      setAdminNote("");
      router.refresh();
    } else {
      alert(res.error || "Gagal mengoreksi absensi");
    }
    setSubmitting(false);
  };

  return (
    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
      <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
        <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-4 py-3">Talent</th>
            <th className="px-4 py-3">Tipe</th>
            <th className="px-4 py-3">Waktu Server</th>
            <th className="px-4 py-3">Jarak</th>
            <th className="px-4 py-3">Face Match</th>
            <th className="px-4 py-3">Keterlambatan</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Flags</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {attendances.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                Belum ada absensi yang tercatat untuk event ini.
              </td>
            </tr>
          ) : (
            attendances.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {item.application.talent.fullName}
                  <div className="text-[10px] text-zinc-500">{item.application.talent.phone}</div>
                </td>
                <td className="px-4 py-3 font-semibold">{item.type}</td>
                <td className="px-4 py-3">
                  {new Date(item.serverTimestamp).toLocaleTimeString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  {item.distanceMeters !== null ? `${item.distanceMeters} m` : "-"}
                </td>
                <td className="px-4 py-3">
                  {item.matchScore ? `${item.matchScore.toFixed(1)}%` : "-"}
                </td>
                <td className="px-4 py-3">
                  {item.isLate ? (
                    <span className="text-rose-600 font-semibold">Terlambat</span>
                  ) : (
                    <span className="text-emerald-600">Tepat Waktu</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      item.status === "VALID"
                        ? "success"
                        : item.status === "NEEDS_REVIEW"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {item.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {item.flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((f, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setAdminNote(item.adminNote || "");
                    }}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Koreksi
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Correction Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Koreksi Absensi: {selectedItem.application.talent.fullName} ({selectedItem.type})
            </h4>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Catatan Koreksi Admin
              </label>
              <textarea
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Contoh: Terkonfirmasi oleh PIC lapangan bahwa talent sudah di lokasi..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={submitting}
                onClick={() => handleCorrect("REJECTED")}
              >
                Tolak (Reject)
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={submitting}
                onClick={() => handleCorrect("VALID")}
              >
                Jadikan Valid
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
