import "server-only";
import { prisma } from "@/lib/db/prisma";
import { JourneyStatus } from "@/generated/prisma/enums";

export interface JourneyWithStages {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  themeKey: string;
  achievementTitle: string;
  estimatedMinutes: number;
  status: JourneyStatus;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  stages: Array<{
    id: string;
    journeyId: string;
    slug: string;
    title: string;
    shortDescription: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export async function getPublishedJourneys(): Promise<JourneyWithStages[]> {
  const journeys = await prisma.journey.findMany({
    where: {
      status: JourneyStatus.PUBLISHED,
    },
    orderBy: {
      displayOrder: "asc",
    },
    include: {
      stages: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  return journeys as JourneyWithStages[];
}

export async function getPublishedJourneyBySlug(
  slug: string,
): Promise<JourneyWithStages | null> {
  const journey = await prisma.journey.findUnique({
    where: {
      slug,
    },
    include: {
      stages: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!journey || journey.status !== JourneyStatus.PUBLISHED) {
    return null;
  }

  return journey as JourneyWithStages;
}
