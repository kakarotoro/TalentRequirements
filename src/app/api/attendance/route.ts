import { NextRequest, NextResponse } from "next/server";
import { submitAttendanceAction } from "@/server/actions/attendance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitAttendanceAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
