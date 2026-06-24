import "server-only";
import {
  getPublishedJourneys,
  getPublishedJourneyBySlug,
} from "@/server/repositories/journey-repository";
import { journeySlugSchema } from "@/lib/validation/journey-schemas";

export interface StageViewModel {
  slug: string;
  title: string;
  shortDescription: string;
  displayOrder: number;
}

export interface JourneyViewModel {
  slug: string;
  title: string;
  shortDescription: string;
  themeKey: string;
  achievementTitle: string;
  estimatedMinutes: number;
  stages: StageViewModel[];
}

export async function fetchPublishedJourneys(): Promise<JourneyViewModel[]> {
  try {
    const journeys = await getPublishedJourneys();
    return journeys.map((journey) => ({
      slug: journey.slug,
      title: journey.title,
      shortDescription: journey.shortDescription,
      themeKey: journey.themeKey,
      achievementTitle: journey.achievementTitle,
      estimatedMinutes: journey.estimatedMinutes,
      stages: journey.stages.map((stage) => ({
        slug: stage.slug,
        title: stage.title,
        shortDescription: stage.shortDescription,
        displayOrder: stage.displayOrder,
      })),
    }));
  } catch (error) {
    console.error("Error fetching journeys from service layer:", error);
    throw new Error("حدث خطأ أثناء تحميل رحلات التعلم.");
  }
}

export async function fetchJourneyBySlug(
  slug: string,
): Promise<JourneyViewModel | null> {
  const validationResult = journeySlugSchema.safeParse(slug);
  if (!validationResult.success) {
    return null;
  }

  try {
    const journey = await getPublishedJourneyBySlug(validationResult.data);
    if (!journey) {
      return null;
    }

    return {
      slug: journey.slug,
      title: journey.title,
      shortDescription: journey.shortDescription,
      themeKey: journey.themeKey,
      achievementTitle: journey.achievementTitle,
      estimatedMinutes: journey.estimatedMinutes,
      stages: journey.stages.map((stage) => ({
        slug: stage.slug,
        title: stage.title,
        shortDescription: stage.shortDescription,
        displayOrder: stage.displayOrder,
      })),
    };
  } catch (error) {
    console.error(
      `Error fetching journey by slug '${slug}' from service layer:`,
      error,
    );
    throw new Error("حدث خطأ أثناء تحميل تفاصيل رحلة التعلم.");
  }
}
