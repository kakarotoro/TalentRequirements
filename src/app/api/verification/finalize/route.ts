import { NextRequest, NextResponse } from "next/server";
import { submitVerificationAction } from "@/server/actions/verification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitVerificationAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
