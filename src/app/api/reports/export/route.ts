import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "xlsx";

    const attendances = await prisma.attendance.findMany({
      include: {
        application: {
          include: {
            event: true,
            talent: true,
          },
        },
      },
      orderBy: { serverTimestamp: "desc" },
    });

    const rows = attendances.map((a) => ({
      ID: a.id,
      Event: a.application.event.title,
      Klien: a.application.event.clientName,
      Venue: a.application.event.venueName,
      "Nama Talent": a.application.talent.fullName,
      "Telepon Talent": a.application.talent.phone,
      "Tipe Absen": a.type,
      "Waktu Server": a.serverTimestamp.toISOString(),
      "Jarak (Meter)": a.distanceMeters ?? "",
      "Face Match (%)": a.matchScore ? a.matchScore.toFixed(1) : "",
      "Terlambat": a.isLate ? "Ya" : "Tidak",
      Status: a.status,
      Flags: a.flags.join(", "),
      "Catatan Admin": a.adminNote || "",
    }));

    if (format === "csv") {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="rekap-absensi-${Date.now()}.csv"`,
        },
      });
    }

    // Default XLSX
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rekap-absensi-${Date.now()}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
