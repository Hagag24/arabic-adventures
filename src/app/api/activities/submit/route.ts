import { NextResponse } from "next/server";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import { evaluateSubmission } from "@/server/services/activity-service";
import { submissionSchema } from "@/lib/validation/activity-schemas";

export async function POST(request: Request) {
  try {
    // 1. Validate the anonymous session
    const sessionId = await getPlayerSessionId();
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "جلسة اللاعب غير صالحة. يرجى إعادة تحميل الصفحة الرئيسية.",
        },
        { status: 401 },
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate payload with Zod
    const validation = submissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "بيانات الإرسال غير صالحة." },
        { status: 400 },
      );
    }

    // 4. Evaluate submission and perform transactional updates
    const result = await evaluateSubmission(sessionId, validation.data);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    // Avoid leaking stack traces to the student, return safe error in Arabic
    console.error("Submission evaluation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ غير متوقع أثناء معالجة إجابتك. يرجى المحاولة مرة أخرى.",
      },
      { status: 500 },
    );
  }
}
