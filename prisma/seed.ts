import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

interface StageData {
  slug: string;
  title: string;
  shortDescription: string;
  displayOrder: number;
}

interface JourneyData {
  slug: string;
  title: string;
  shortDescription: string;
  themeKey: string;
  achievementTitle: string;
  estimatedMinutes: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  displayOrder: number;
  stages: StageData[];
}

const seedJourneys: JourneyData[] = [
  {
    slug: "ancient-egyptian-teacher",
    title: "أسرار المعلم المصري القديم",
    shortDescription:
      "اكتشف أسرار الكتابة والتعليم في مصر القديمة ودور المعلم المصري.",
    themeKey: "ancient-egypt",
    achievementTitle: "مستكشف الحضارة",
    estimatedMinutes: 45,
    status: "PUBLISHED",
    displayOrder: 1,
    stages: [
      {
        slug: "prepare",
        title: "استعد",
        shortDescription: "تهيئة واستعداد للرحلة المشوقة.",
        displayOrder: 1,
      },
      {
        slug: "predict",
        title: "توقّع",
        shortDescription: "ماذا تتوقع أن تتعلم في هذه الرحلة؟",
        displayOrder: 2,
      },
      {
        slug: "listen",
        title: "استمع",
        shortDescription: "استمع إلى القصة أو المحتوى التعليمي بتركيز.",
        displayOrder: 3,
      },
      {
        slug: "understand",
        title: "افهم",
        shortDescription: "أنشطة وأسئلة لقياس فهمك للمحتوى.",
        displayOrder: 4,
      },
      {
        slug: "word-play",
        title: "العب بالكلمات",
        shortDescription: "تطوير المفردات اللغوية من خلال الألعاب.",
        displayOrder: 5,
      },
      {
        slug: "sequence-events",
        title: "رتّب الأحداث",
        shortDescription: "ترتيب الأحداث بطريقة منطقية وزمنية.",
        displayOrder: 6,
      },
      {
        slug: "think-and-create",
        title: "فكّر وأبدع",
        shortDescription: "نشاط تعبيري وإبداعي لتطبيق ما تعلمته.",
        displayOrder: 7,
      },
      {
        slug: "review-achievement",
        title: "راجع إنجازك",
        shortDescription: "تقييم ذاتي ومراجعة لما أنجزته.",
        displayOrder: 8,
      },
    ],
  },
  {
    slug: "king-of-hearts",
    title: "ملك القلوب",
    shortDescription:
      "رحلة ملهمة حول العطاء الإنساني وصناعة الأمل لمستقبل أفضل.",
    themeKey: "humanity",
    achievementTitle: "صانع الأمل",
    estimatedMinutes: 30,
    status: "PUBLISHED",
    displayOrder: 2,
    stages: [
      {
        slug: "prepare",
        title: "استعد",
        shortDescription: "تهيئة واستعداد للرحلة المشوقة.",
        displayOrder: 1,
      },
      {
        slug: "predict",
        title: "توقّع",
        shortDescription: "ماذا تتوقع أن تتعلم في هذه الرحلة؟",
        displayOrder: 2,
      },
      {
        slug: "listen",
        title: "استمع",
        shortDescription: "استمع إلى القصة أو المحتوى التعليمي بتركيز.",
        displayOrder: 3,
      },
      {
        slug: "understand",
        title: "افهم",
        shortDescription: "أنشطة وأسئلة لقياس فهمك للمحتوى.",
        displayOrder: 4,
      },
      {
        slug: "word-play",
        title: "العب بالكلمات",
        shortDescription: "تطوير المفردات اللغوية من خلال الألعاب.",
        displayOrder: 5,
      },
      {
        slug: "sequence-events",
        title: "رتّب الأحداث",
        shortDescription: "ترتيب الأحداث بطريقة منطقية وزمنية.",
        displayOrder: 6,
      },
      {
        slug: "think-and-create",
        title: "فكّر وأبدع",
        shortDescription: "نشاط تعبيري وإبداعي لتطبيق ما تعلمته.",
        displayOrder: 7,
      },
      {
        slug: "review-achievement",
        title: "راجع إنجازك",
        shortDescription: "تقييم ذاتي ومراجعة لما أنجزته.",
        displayOrder: 8,
      },
    ],
  },
  {
    slug: "my-body-is-a-trust",
    title: "جسدي أمانة",
    shortDescription: "تعلم كيفية حماية جسدك وفهم حدود الأمان الشخصي والجسدي.",
    themeKey: "safety",
    achievementTitle: "بطل الأمان",
    estimatedMinutes: 40,
    status: "PUBLISHED",
    displayOrder: 3,
    stages: [
      {
        slug: "prepare",
        title: "استعد",
        shortDescription: "تهيئة واستعداد للرحلة المشوقة.",
        displayOrder: 1,
      },
      {
        slug: "predict",
        title: "توقّع",
        shortDescription: "ماذا تتوقع أن تتعلم في هذه الرحلة؟",
        displayOrder: 2,
      },
      {
        slug: "listen",
        title: "استمع",
        shortDescription: "استمع إلى القصة أو المحتوى التعليمي بتركيز.",
        displayOrder: 3,
      },
      {
        slug: "understand",
        title: "افهم",
        shortDescription: "أنشطة وأسئلة لقياس فهمك للمحتوى.",
        displayOrder: 4,
      },
      {
        slug: "word-play",
        title: "العب بالكلمات",
        shortDescription: "تطوير المفردات اللغوية من خلال الألعاب.",
        displayOrder: 5,
      },
      {
        slug: "sequence-events",
        title: "رتّب الأحداث",
        shortDescription: "ترتيب الأحداث بطريقة منطقية وزمنية.",
        displayOrder: 6,
      },
      {
        slug: "think-and-create",
        title: "فكّر وأبدع",
        shortDescription: "نشاط تعبيري وإبداعي لتطبيق ما تعلمته.",
        displayOrder: 7,
      },
      {
        slug: "review-achievement",
        title: "راجع إنجازك",
        shortDescription: "تقييم ذاتي ومراجعة لما أنجزته.",
        displayOrder: 8,
      },
    ],
  },
];

async function main() {
  console.log("Starting database seeding...");

  for (const journeyData of seedJourneys) {
    await prisma.$transaction(async (tx) => {
      // Upsert Journey
      const journey = await tx.journey.upsert({
        where: { slug: journeyData.slug },
        update: {
          title: journeyData.title,
          shortDescription: journeyData.shortDescription,
          themeKey: journeyData.themeKey,
          achievementTitle: journeyData.achievementTitle,
          estimatedMinutes: journeyData.estimatedMinutes,
          status: journeyData.status,
          displayOrder: journeyData.displayOrder,
        },
        create: {
          slug: journeyData.slug,
          title: journeyData.title,
          shortDescription: journeyData.shortDescription,
          themeKey: journeyData.themeKey,
          achievementTitle: journeyData.achievementTitle,
          estimatedMinutes: journeyData.estimatedMinutes,
          status: journeyData.status,
          displayOrder: journeyData.displayOrder,
        },
      });

      // Upsert current stages
      const activeStageIds: string[] = [];
      for (const stageData of journeyData.stages) {
        const stage = await tx.journeyStage.upsert({
          where: {
            journeyId_slug: {
              journeyId: journey.id,
              slug: stageData.slug,
            },
          },
          update: {
            title: stageData.title,
            shortDescription: stageData.shortDescription,
            displayOrder: stageData.displayOrder,
          },
          create: {
            journeyId: journey.id,
            slug: stageData.slug,
            title: stageData.title,
            shortDescription: stageData.shortDescription,
            displayOrder: stageData.displayOrder,
          },
        });
        activeStageIds.push(stage.id);
      }

      // Remove obsolete seeded stages that no longer belong to the approved structural list
      await tx.journeyStage.deleteMany({
        where: {
          journeyId: journey.id,
          id: {
            notIn: activeStageIds,
          },
        },
      });
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
