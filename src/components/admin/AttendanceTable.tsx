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
    <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3.5">Talent</th>
            <th className="px-4 py-3.5">Tipe</th>
            <th className="px-4 py-3.5">Waktu Server</th>
            <th className="px-4 py-3.5">Jarak Venue</th>
            <th className="px-4 py-3.5">Face Match</th>
            <th className="px-4 py-3.5">Ketepatan</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5">Flags</th>
            <th className="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {attendances.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-5 py-10 text-center text-slate-400">
                Belum ada absensi yang tercatat untuk event ini.
              </td>
            </tr>
          ) : (
            attendances.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">
                  {item.application.talent.fullName}
                  <div className="text-[11px] text-slate-400 font-normal">{item.application.talent.phone}</div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${item.type === "CHECK_IN" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-700 font-medium">
                  {new Date(item.serverTimestamp).toLocaleTimeString("id-ID")} WIB
                </td>
                <td className="px-4 py-3.5 text-slate-700">
                  {item.distanceMeters !== null ? `${item.distanceMeters} m` : "-"}
                </td>
                <td className="px-4 py-3.5 font-medium">
                  {item.matchScore ? (
                    <span className="text-blue-700 font-bold">{item.matchScore.toFixed(1)}%</span>
                  ) : "-"}
                </td>
                <td className="px-4 py-3.5">
                  {item.isLate ? (
                    <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-bold">Terlambat</span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">Tepat Waktu</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
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
                <td className="px-4 py-3.5">
                  {item.flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((f, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-50 border border-amber-200 text-amber-800"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setAdminNote(item.adminNote || "");
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-fade-in">
            <div>
              <h4 className="font-bold text-base text-slate-900">
                Koreksi Manual Absensi
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedItem.application.talent.fullName} • Presensi {selectedItem.type}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Justifikasi Reviewer
              </label>
              <textarea
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Contoh: Terkonfirmasi oleh PIC lapangan bahwa talent sudah di lokasi..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                className="font-bold"
                isLoading={submitting}
                onClick={() => handleCorrect("REJECTED")}
              >
                Tolak (Reject)
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="font-bold shadow-xs"
                isLoading={submitting}
                onClick={() => handleCorrect("VALID")}
              >
                Setujui (Valid)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
