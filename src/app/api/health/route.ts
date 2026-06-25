import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Query SQLite safely to check connectivity
    await prisma.$queryRaw`SELECT 1`;
    const publishedLessons = await prisma.journey.count({ where: { status: "PUBLISHED" } });
    
    const lesson1Activities = await prisma.activity.count({
      where: {
        isPublished: true,
        journey: { slug: "ancient-egyptian-teacher" }
      }
    });

    const lesson2Activities = await prisma.activity.count({
      where: {
        isPublished: true,
        journey: { slug: "magdi-yacoub" }
      }
    });

    const totalPublicActivities = await prisma.activity.count({
      where: { isPublished: true }
    });

    const countsValid =
      publishedLessons === 2 &&
      lesson1Activities === 19 &&
      lesson2Activities === 28 &&
      totalPublicActivities === 47;

    if (!countsValid) {
      console.error("Health check invalid database counts:", {
        publishedLessons,
        lesson1Activities,
        lesson2Activities,
        totalPublicActivities
      });
      return NextResponse.json(
        {
          status: "error",
          error: "invalid-database-state",
          publishedLessons,
          lesson1Activities,
          lesson2Activities,
          totalPublicActivities
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      experience: "two-lessons",
      publishedLessons,
      lesson1Activities,
      lesson2Activities,
      totalPublicActivities
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
