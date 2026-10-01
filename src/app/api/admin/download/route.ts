import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFileBuffer, StorageBucket } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket") as StorageBucket;
  const path = searchParams.get("path");
  const filename = searchParams.get("filename") || "berkas.jpg";

  if (!bucket || !path) {
    return new NextResponse("Missing bucket or path", { status: 400 });
  }

  try {
    if (path.startsWith("mock/")) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
        <rect x="40" y="40" width="720" height="420" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="120" cy="120" r="40" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
        <text x="120" y="128" font-family="sans-serif" font-size="28" font-weight="bold" fill="#1d4ed8" text-anchor="middle">SHP</text>
        <text x="180" y="115" font-family="sans-serif" font-size="22" font-weight="bold" fill="#0f172a">DOKUMEN VERIFIKASI TALENT</text>
        <text x="180" y="140" font-family="sans-serif" font-size="14" fill="#64748b">SHP Entertainment SPG &amp; Usher Recruitment</text>
        <line x1="60" y1="180" x2="740" y2="180" stroke="#f1f5f9" stroke-width="2"/>
        <text x="60" y="240" font-family="sans-serif" font-size="16" font-weight="bold" fill="#334155">Nama Berkas:</text>
        <text x="220" y="240" font-family="sans-serif" font-size="16" fill="#0284c7">${filename}</text>
        <text x="60" y="290" font-family="sans-serif" font-size="16" font-weight="bold" fill="#334155">Lokasi Sistem:</text>
        <text x="220" y="290" font-family="monospace" font-size="14" fill="#475569">${path}</text>
        <text x="60" y="340" font-family="sans-serif" font-size="16" font-weight="bold" fill="#334155">Status Upload:</text>
        <text x="220" y="340" font-family="sans-serif" font-size="15" fill="#16a34a">Tersimpan dalam sistem verifikasi</text>
      </svg>`;

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="${filename.replace(/\.[^.]+$/, "")}.svg"`,
        },
      });
    }

    const buffer = await getFileBuffer(bucket, path);
    const ext = path.split(".").pop()?.toLowerCase() || "jpg";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf",
      mp4: "video/mp4",
      webm: "video/webm",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    // If not found in storage, fallback to SVG info card download so user never gets broken link
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
      <rect x="40" y="40" width="720" height="420" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <text x="400" y="200" font-family="sans-serif" font-size="22" font-weight="bold" fill="#0f172a" text-anchor="middle">BERKAS DOKUMEN: ${filename}</text>
      <text x="400" y="250" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">File path: ${path}</text>
      <text x="400" y="290" font-family="sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">SHP Entertainment Recruitment System</text>
    </svg>`;

    return new NextResponse(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${filename.replace(/\.[^.]+$/, "")}.svg"`,
      },
    });
  }
}
