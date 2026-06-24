import { NextResponse } from "next/server";
import { ensurePlayerSession } from "@/lib/session/session-manager";

export async function POST() {
  try {
    await ensurePlayerSession();
    return NextResponse.json({ success: true, status: "session_active" });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تهيئة الجلسة." },
      { status: 500 },
    );
  }
}
