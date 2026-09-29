import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSignedUploadUrl, STORAGE_BUCKETS, StorageBucket } from "@/lib/storage";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bucket, fileExt, sizeBytes } = body;

    const validBuckets = Object.values(STORAGE_BUCKETS);
    if (!validBuckets.includes(bucket as StorageBucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const fileId = crypto.randomUUID();
    const cleanExt = (fileExt || "jpg").replace(/^\./, "").toLowerCase();
    const path = `${session.id}/${fileId}.${cleanExt}`;

    const signed = await createSignedUploadUrl(bucket, path);
    return NextResponse.json(signed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
