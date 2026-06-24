import { NextResponse } from "next/server";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ journeyId: string }> },
) {
  try {
    const { journeyId } = await params;
    const sessionId = await getPlayerSessionId();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "جلسة غير صالحة." },
        { status: 401 },
      );
    }

    // Find the journey (checking by ID or slug)
    const journey = await prisma.journey.findFirst({
      where: {
        OR: [{ id: journeyId }, { slug: journeyId }],
      },
      include: {
        activities: true,
      },
    });

    if (!journey) {
      return NextResponse.json(
        { success: false, error: "الرحلة المطلوبة غير موجودة." },
        { status: 404 },
      );
    }

    const activityIds = journey.activities.map((a) => a.id);

    // Perform transactional delete of attempts and progress for this journey
    await prisma.$transaction(async (tx) => {
      // 1. Delete journey progress
      await tx.journeyProgress.deleteMany({
        where: {
          playerSessionId: sessionId,
          journeyId: journey.id,
        },
      });

      // 2. Delete activity progress records
      await tx.activityProgress.deleteMany({
        where: {
          playerSessionId: sessionId,
          activityId: { in: activityIds },
        },
      });

      // 3. Delete attempts
      await tx.activityAttempt.deleteMany({
        where: {
          playerSessionId: sessionId,
          activityId: { in: activityIds },
        },
      });
    });

    return NextResponse.json({ success: true, status: "journey_restarted" });
  } catch (error) {
    console.error("Error restarting journey progress:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إعادة تشغيل الرحلة." },
      { status: 500 },
    );
  }
}
