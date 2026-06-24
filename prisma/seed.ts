import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { buildSeedActivities } from "../src/content/activity-seed-builder";

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

const seedActivities = buildSeedActivities();

async function main() {
  console.log("Starting database seeding...");

  // 1. Seed/Upsert Journeys and Stages
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

      console.log(`Journey [${journey.slug}] upserted.`);

      // Upsert stages
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

      // Remove obsolete stages
      await tx.journeyStage.deleteMany({
        where: {
          journeyId: journey.id,
          id: { notIn: activeStageIds },
        },
      });
    });
  }

  // 2. Read manifest and seed AudioAsset records
  const manifestPath = path.resolve(
    "public/audio/approved/audio_manifest.json",
  );
  if (fs.existsSync(manifestPath)) {
    console.log("Found audio manifest. Seeding AudioAsset records...");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const key of Object.keys(manifest)) {
      const asset = manifest[key];
      await prisma.audioAsset.upsert({
        where: { assetKey: asset.assetKey },
        update: {
          provider: asset.provider,
          providerVoiceId: asset.providerVoiceId,
          locale: asset.locale,
          spokenText: asset.spokenText,
          durationSeconds: asset.durationSeconds,
          fileHash: asset.fileHash,
          generationVersion: asset.generationVersion,
          status: asset.status,
        },
        create: {
          assetKey: asset.assetKey,
          provider: asset.provider,
          providerVoiceId: asset.providerVoiceId,
          locale: asset.locale,
          spokenText: asset.spokenText,
          durationSeconds: asset.durationSeconds,
          fileHash: asset.fileHash,
          generationVersion: asset.generationVersion,
          status: asset.status,
        },
      });
      console.log(`AudioAsset [${asset.assetKey}] seeded.`);
    }
  } else {
    console.warn("Audio manifest not found. Skipping AudioAsset seeding.");
  }

  // Fetch all journeys and stages for fast reference
  const allJourneys = await prisma.journey.findMany({
    include: { stages: true },
  });
  const journeyMap = new Map(allJourneys.map((j) => [j.slug, j]));
  console.log(
    "Shifting existing displayOrders to prevent unique constraint conflicts...",
  );
  await prisma.activity.updateMany({
    data: {
      displayOrder: {
        decrement: 10000,
      },
    },
  });
  await prisma.activityOption.updateMany({
    data: {
      displayOrder: {
        decrement: 10000,
      },
    },
  });

  const stageActivityCounters = new Map<string, number>();

  console.log(`Seeding ${seedActivities.length} activities...`);

  // 3. Seed/Upsert Activities
  for (const act of seedActivities) {
    const journey = journeyMap.get(act.journeySlug);
    if (!journey) {
      throw new Error(`Journey [${act.journeySlug}] not found during seeding.`);
    }
    const stage = journey.stages.find((s) => s.slug === act.stageSlug);
    if (!stage) {
      throw new Error(
        `Stage [${act.stageSlug}] not found in Journey [${act.journeySlug}] during seeding.`,
      );
    }

    const currentCount = stageActivityCounters.get(stage.id) || 0;
    const displayOrder = currentCount + 1;
    stageActivityCounters.set(stage.id, displayOrder);

    // Use transaction for activity + options + answerKey upsert
    await prisma.$transaction(async (tx) => {
      // Upsert Activity
      const activity = await tx.activity.upsert({
        where: {
          journeyId_slug: {
            journeyId: journey.id,
            slug: act.slug,
          },
        },
        update: {
          stageId: stage.id,
          type: act.type,
          title: act.title,
          instruction: act.instruction,
          prompt: act.prompt || null,
          skillTags: act.skillTags,
          isGraded: act.isGraded,
          isSensitive: act.isSensitive,
          storagePolicy: act.storagePolicy,
          sourceItemKey: act.sourceItemKey,
          correctFeedback: act.correctFeedback || null,
          incorrectFeedback: act.incorrectFeedback || null,
          completionFeedback: act.completionFeedback || null,
          instructionNarrationKey: act.instructionNarrationKey || null,
          promptNarrationKey: act.promptNarrationKey || null,
          correctFeedbackNarrationKey: act.correctFeedbackNarrationKey || null,
          incorrectFeedbackNarrationKey:
            act.incorrectFeedbackNarrationKey || null,
          completionFeedbackNarrationKey:
            act.completionFeedbackNarrationKey || null,
          displayOrder,
        },
        create: {
          journeyId: journey.id,
          stageId: stage.id,
          slug: act.slug,
          type: act.type,
          title: act.title,
          instruction: act.instruction,
          prompt: act.prompt || null,
          skillTags: act.skillTags,
          isGraded: act.isGraded,
          isSensitive: act.isSensitive,
          storagePolicy: act.storagePolicy,
          sourceItemKey: act.sourceItemKey,
          correctFeedback: act.correctFeedback || null,
          incorrectFeedback: act.incorrectFeedback || null,
          completionFeedback: act.completionFeedback || null,
          instructionNarrationKey: act.instructionNarrationKey || null,
          promptNarrationKey: act.promptNarrationKey || null,
          correctFeedbackNarrationKey: act.correctFeedbackNarrationKey || null,
          incorrectFeedbackNarrationKey:
            act.incorrectFeedbackNarrationKey || null,
          completionFeedbackNarrationKey:
            act.completionFeedbackNarrationKey || null,
          displayOrder,
        },
      });

      // Upsert Options
      if (act.options && act.options.length > 0) {
        const activeOptionKeys: string[] = [];
        for (const opt of act.options) {
          await tx.activityOption.upsert({
            where: {
              activityId_optionKey: {
                activityId: activity.id,
                optionKey: opt.optionKey,
              },
            },
            update: {
              label: opt.label,
              secondaryText: opt.secondaryText || null,
              displayOrder: opt.displayOrder,
              narrationKey: opt.narrationKey || null,
            },
            create: {
              activityId: activity.id,
              optionKey: opt.optionKey,
              label: opt.label,
              secondaryText: opt.secondaryText || null,
              displayOrder: opt.displayOrder,
              narrationKey: opt.narrationKey || null,
            },
          });
          activeOptionKeys.push(opt.optionKey);
        }

        // Clean obsolete options
        await tx.activityOption.deleteMany({
          where: {
            activityId: activity.id,
            optionKey: { notIn: activeOptionKeys },
          },
        });
      } else {
        await tx.activityOption.deleteMany({
          where: { activityId: activity.id },
        });
      }

      // Upsert Answer Key
      if (act.answerKey) {
        await tx.activityAnswerKey.upsert({
          where: { activityId: activity.id },
          update: {
            answerData: act.answerKey.answerData,
            acceptedAlternatives:
              act.answerKey.acceptedAlternatives ?? undefined,
            modelAnswer: act.answerKey.modelAnswer ?? undefined,
            explanation: act.answerKey.explanation ?? undefined,
          },
          create: {
            activityId: activity.id,
            answerData: act.answerKey.answerData,
            acceptedAlternatives:
              act.answerKey.acceptedAlternatives ?? undefined,
            modelAnswer: act.answerKey.modelAnswer ?? undefined,
            explanation: act.answerKey.explanation ?? undefined,
          },
        });
      } else {
        await tx.activityAnswerKey.deleteMany({
          where: { activityId: activity.id },
        });
      }
    });
  }

  // Clean up any activities that were NOT seeded but exist in DB for these journeys
  const seededSlugs = seedActivities.map((sa) => sa.slug);
  await prisma.activity.deleteMany({
    where: {
      slug: { notIn: seededSlugs },
    },
  });

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
