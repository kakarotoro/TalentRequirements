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

  // If mock path from legacy upload before storage bucket creation
  if (path.startsWith("mock/")) {
    const htmlError = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Berkas Fisik Belum Tersimpan</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: #fef2f2; color: #dc2626; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
    h2 { margin: 0 0 8px; font-size: 18px; color: #0f172a; }
    p { margin: 0 0 20px; font-size: 13px; line-height: 1.6; color: #64748b; }
    .badge { display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 8px; font-family: monospace; font-size: 12px; color: #334155; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h2>Berkas Fisik Belum Tersimpan di Server</h2>
    <p>Berkas ini berstatus path lokal (<code>${path}</code>) yang tersimpan sebelum sistem bucket storage Supabase diaktifkan. File fisik aslinya tidak tersimpan di server.</p>
    <div class="badge">Nama: ${filename}</div><br/>
    <p style="font-size: 12px; color: #475569;">Solusi: Silakan <b>Tolak (Reject)</b> pengajuan talent ini dengan catatan meminta unggah ulang foto KTP asli.</p>
    <a href="javascript:window.close()" class="btn">Tutup Jendela</a>
  </div>
</body>
</html>`;
    return new NextResponse(htmlError, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
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
    const htmlNotFound = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Berkas Tidak Ditemukan</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: #fff7ed; color: #ea580c; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
    h2 { margin: 0 0 8px; font-size: 18px; color: #0f172a; }
    p { margin: 0 0 20px; font-size: 13px; line-height: 1.6; color: #64748b; }
    .btn { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔍</div>
    <h2>Berkas Tidak Ditemukan di Storage</h2>
    <p>File <code>${path}</code> tidak ditemukan pada bucket <code>${bucket}</code> di server Supabase.</p>
    <a href="javascript:window.close()" class="btn">Tutup Jendela</a>
  </div>
</body>
</html>`;
    return new NextResponse(htmlNotFound, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
