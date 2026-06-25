import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";
import { allActivities } from "../src/content/lesson-activity-definitions";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

const seedLessons = [
  {
    slug: "ancient-egyptian-teacher",
    title: "خبر عن المعلم المصري القديم",
    shortDescription: "اكتشف أسرار الكتابة والتعليم في مصر القديمة ودور المعلم المصري.",
    themeKey: "ancient-egypt",
    achievementTitle: "مستكشف الحضارة",
    estimatedMinutes: 45,
    status: "PUBLISHED" as const,
    displayOrder: 1,
  },
  {
    slug: "magdi-yacoub",
    title: "حوار مع د. مجدي يعقوب",
    shortDescription: "رحلة ملهمة حول العطاء الإنساني وصناعة الأمل لمستقبل أفضل.",
    themeKey: "humanity",
    achievementTitle: "صانع الأمل",
    estimatedMinutes: 30,
    status: "PUBLISHED" as const,
    displayOrder: 2,
  }
];

async function main() {
  console.log("Starting safe two-lesson database seeding...");

  await prisma.$transaction(async (tx) => {
    // 1. Delete all obsolete lessons/journeys that are not in the new seedLessons (e.g. "my-body-is-a-trust" or "king-of-hearts")
    const activeSlugs = seedLessons.map(l => l.slug);
    
    // Find obsolete journeys
    const obsoleteJourneys = await tx.journey.findMany({
      where: { slug: { notIn: activeSlugs } }
    });
    
    for (const oj of obsoleteJourneys) {
      console.log(`Deleting obsolete journey [${oj.slug}] and all cascaded records...`);
      await tx.journey.delete({ where: { id: oj.id } });
    }

    // 2. Upsert the 2 active journeys (lessons) and their single internal default stage
    const journeyMap = new Map<string, { id: string; stageId: string }>();

    for (const l of seedLessons) {
      const journey = await tx.journey.upsert({
        where: { slug: l.slug },
        update: {
          title: l.title,
          shortDescription: l.shortDescription,
          themeKey: l.themeKey,
          achievementTitle: l.achievementTitle,
          estimatedMinutes: l.estimatedMinutes,
          status: l.status,
          displayOrder: l.displayOrder,
        },
        create: {
          slug: l.slug,
          title: l.title,
          shortDescription: l.shortDescription,
          themeKey: l.themeKey,
          achievementTitle: l.achievementTitle,
          estimatedMinutes: l.estimatedMinutes,
          status: l.status,
          displayOrder: l.displayOrder,
        }
      });

      // Remove any other stages for this journey FIRST to avoid displayOrder unique constraint conflicts
      await tx.journeyStage.deleteMany({
        where: {
          journeyId: journey.id,
          slug: { not: "main" }
        }
      });

      // Upsert exactly ONE internal stage for this journey
      const stage = await tx.journeyStage.upsert({
        where: {
          journeyId_slug: {
            journeyId: journey.id,
            slug: "main"
          }
        },
        update: {
          title: "مراحل الدرس",
          shortDescription: "مراحل وتحديات الدرس",
          displayOrder: 1,
        },
        create: {
          journeyId: journey.id,
          slug: "main",
          title: "مراحل الدرس",
          shortDescription: "مراحل وتحديات الدرس",
          displayOrder: 1,
        }
      });

      journeyMap.set(l.slug, { id: journey.id, stageId: stage.id });
      console.log(`Journey [${journey.slug}] and default stage upserted.`);
    }

    // 3. Upsert the 47 activities
    // Shift displayOrder to avoid unique constraint violations on displayOrder during updates
    await tx.activity.updateMany({
      data: { displayOrder: { decrement: 10000 } }
    });
    await tx.activityOption.updateMany({
      data: { displayOrder: { decrement: 10000 } }
    });

    const activeActivityIds = new Set<string>();

    for (const act of allActivities) {
      const journeySlug = act.sourceLessonNumber === 1 ? "ancient-egyptian-teacher" : "magdi-yacoub";
      const ids = journeyMap.get(journeySlug);
      if (!ids) {
        throw new Error(`Journey mapping not found for slug ${journeySlug}`);
      }

      // Upsert activity
      const activity = await tx.activity.upsert({
        where: {
          journeyId_slug: {
            journeyId: ids.id,
            slug: act.slug
          }
        },
        update: {
          stageId: ids.stageId,
          type: act.type,
          title: act.title,
          instruction: act.instruction,
          prompt: act.prompt,
          skillTags: act.skillTags,
          isGraded: act.isGraded,
          isSensitive: act.isSensitive,
          storagePolicy: act.storagePolicy,
          displayOrder: act.sourceActivityNumber,
          sourceItemKey: act.sourceKey, // Keep old sourceItemKey populated for now
          // Populate new source fields
          sourceLessonNumber: act.sourceLessonNumber,
          sourceActivityNumber: act.sourceActivityNumber,
          sourceKey: act.sourceKey,
          instructionNarrationKey: act.instructionAudioKey,
          promptNarrationKey: act.promptAudioKey,
          correctFeedbackNarrationKey: act.correctFeedbackAudioKey,
          incorrectFeedbackNarrationKey: act.incorrectFeedbackAudioKey,
          completionFeedbackNarrationKey: act.completionFeedbackAudioKey,
          configuration: act.configuration ? act.configuration : null,
        },
        create: {
          journeyId: ids.id,
          stageId: ids.stageId,
          slug: act.slug,
          type: act.type,
          title: act.title,
          instruction: act.instruction,
          prompt: act.prompt,
          skillTags: act.skillTags,
          isGraded: act.isGraded,
          isSensitive: act.isSensitive,
          storagePolicy: act.storagePolicy,
          displayOrder: act.sourceActivityNumber,
          sourceItemKey: act.sourceKey,
          // Populate new source fields
          sourceLessonNumber: act.sourceLessonNumber,
          sourceActivityNumber: act.sourceActivityNumber,
          sourceKey: act.sourceKey,
          instructionNarrationKey: act.instructionAudioKey,
          promptNarrationKey: act.promptAudioKey,
          correctFeedbackNarrationKey: act.correctFeedbackAudioKey,
          incorrectFeedbackNarrationKey: act.incorrectFeedbackAudioKey,
          completionFeedbackNarrationKey: act.completionFeedbackAudioKey,
          configuration: act.configuration ? act.configuration : null,
        }
      });

      activeActivityIds.add(activity.id);

      // Seed options
      if (act.options && act.options.length > 0) {
        const optionKeys = act.options.map(o => o.optionKey);
        for (const opt of act.options) {
          await tx.activityOption.upsert({
            where: {
              activityId_optionKey: {
                activityId: activity.id,
                optionKey: opt.optionKey
              }
            },
            update: {
              label: opt.label,
              secondaryText: opt.secondaryText || null,
              displayOrder: opt.displayOrder,
              narrationKey: opt.narrationKey || null
            },
            create: {
              activityId: activity.id,
              optionKey: opt.optionKey,
              label: opt.label,
              secondaryText: opt.secondaryText || null,
              displayOrder: opt.displayOrder,
              narrationKey: opt.narrationKey || null
            }
          });
        }
        // Delete obsolete options
        await tx.activityOption.deleteMany({
          where: {
            activityId: activity.id,
            optionKey: { notIn: optionKeys }
          }
        });
      } else {
        await tx.activityOption.deleteMany({
          where: { activityId: activity.id }
        });
      }

      // Seed answer keys
      if (act.answerKey) {
        await tx.activityAnswerKey.upsert({
          where: { activityId: activity.id },
          update: {
            answerData: act.answerKey.answerData,
            acceptedAlternatives: act.answerKey.acceptedAlternatives || null,
            modelAnswer: act.answerKey.modelAnswer || null,
            explanation: act.answerKey.explanation || null
          },
          create: {
            activityId: activity.id,
            answerData: act.answerKey.answerData,
            acceptedAlternatives: act.answerKey.acceptedAlternatives || null,
            modelAnswer: act.answerKey.modelAnswer || null,
            explanation: act.answerKey.explanation || null
          }
        });
      } else {
        await tx.activityAnswerKey.deleteMany({
          where: { activityId: activity.id }
        });
      }
    }

    // Delete any activities not in the new 47 list for these journeys
    await tx.activity.deleteMany({
      where: {
        id: { notIn: Array.from(activeActivityIds) }
      }
    });

    console.log("Seeding completed successfully.");
  });
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
