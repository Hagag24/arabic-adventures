import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Query SQLite safely to check connectivity
    await prisma.$queryRaw`SELECT 1`;
    const journeysCount = await prisma.journey.count({ where: { status: "PUBLISHED" } });
    const sourceItemsCount = await prisma.activitySourceMapping.count();
    const publishedActivitiesCount = await prisma.activity.count({ where: { isPublished: true } });

    return NextResponse.json({
      status: "ok",
      database: "connected",
      contentVersion: "workbook-activities-v1",
      journeys: journeysCount,
      sourceItems: sourceItemsCount,
      publishedActivities: publishedActivitiesCount,
    });
  } catch (error) {
    console.error("Health check database error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 503 },
    );
  }
}
