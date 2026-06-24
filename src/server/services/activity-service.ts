import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import {
  submissionSchema,
  StudentSubmissionInput,
} from "@/lib/validation/activity-schemas";

export interface StudentActivityPayload {
  id: string;
  journeyId: string;
  journeySlug: string;
  journeyTitle: string;
  stageId: string;
  stageSlug: string;
  stageTitle: string;
  slug: string;
  type: string;
  title: string;
  instruction: string;
  prompt: string | null;
  skillTags: string[];
  isGraded: boolean;
  isSensitive: boolean;
  storagePolicy: string;
  displayOrder: number;
  audioAsset: {
    assetKey: string;
    durationSeconds: number;
    locale: string;
  } | null;
  options: {
    optionKey: string;
    label: string;
    secondaryText: string | null;
    displayOrder: number;
  }[];
  activityNumber: number;
  totalActivities: number;
  previousActivitySlug: string | null;
  nextActivitySlug: string | null;
}

export interface SafeEvaluationResult {
  isCorrect: boolean;
  score: number;
  storagePolicy: string;
  modelAnswer: string | null;
  explanation: string | null;
  journeyStatus: string; // "IN_PROGRESS" | "COMPLETED"
}

// Arabic Text Normalization Helper for Graded Fill-in-the-Blanks
export function normalizeArabicText(text: string): string {
  if (!text) return "";
  return (
    text
      .trim()
      // Remove all Arabic diacritics (Fatha, Damma, Kasra, Shadda, Sukun, Tanween)
      .replace(/[\u064B-\u065F\u0670]/g, "")
      // Normalize Alefs (أ, إ, آ -> ا)
      .replace(/[أإآ]/g, "ا")
      // Normalize Teh Marbuta (ة -> ه)
      .replace(/ة/g, "ه")
      // Collapse multiple spaces
      .replace(/\s+/g, " ")
  );
}

export async function getActivityPayload(
  journeySlug: string,
  activitySlug: string,
): Promise<StudentActivityPayload | null> {
  const activity = await prisma.activity.findFirst({
    where: {
      slug: activitySlug,
      journey: { slug: journeySlug },
      isPublished: true,
    },
    include: {
      journey: true,
      stage: true,
      audioAsset: true,
      options: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!activity) return null;

  // Fetch all published activities in the same journey to compute navigation metadata
  const journeyActivities = await prisma.activity.findMany({
    where: {
      journeyId: activity.journeyId,
      isPublished: true,
    },
    include: {
      stage: true,
    },
  });

  // Sort by stage displayOrder first, then activity displayOrder
  journeyActivities.sort((a, b) => {
    if (a.stage.displayOrder !== b.stage.displayOrder) {
      return a.stage.displayOrder - b.stage.displayOrder;
    }
    return a.displayOrder - b.displayOrder;
  });

  const currentIndex = journeyActivities.findIndex((a) => a.id === activity.id);
  const activityNumber = currentIndex + 1;
  const totalActivities = journeyActivities.length;

  const previousActivitySlug =
    currentIndex > 0 ? journeyActivities[currentIndex - 1].slug : null;
  const nextActivitySlug =
    currentIndex < journeyActivities.length - 1
      ? journeyActivities[currentIndex + 1].slug
      : null;

  // Map to safe payload, omitting answerKey information
  return {
    id: activity.id,
    journeyId: activity.journeyId,
    journeySlug: activity.journey.slug,
    journeyTitle: activity.journey.title,
    stageId: activity.stageId,
    stageSlug: activity.stage.slug,
    stageTitle: activity.stage.title,
    slug: activity.slug,
    type: activity.type,
    title: activity.title,
    instruction: activity.instruction,
    prompt: activity.prompt,
    skillTags: activity.skillTags as string[],
    isGraded: activity.isGraded,
    isSensitive: activity.isSensitive,
    storagePolicy: activity.storagePolicy,
    displayOrder: activity.displayOrder,
    audioAsset: activity.audioAsset
      ? {
          assetKey: activity.audioAsset.assetKey,
          durationSeconds: activity.audioAsset.durationSeconds,
          locale: activity.audioAsset.locale,
        }
      : null,
    options: activity.options.map((opt) => ({
      optionKey: opt.optionKey,
      label: opt.label,
      secondaryText: opt.secondaryText,
      displayOrder: opt.displayOrder,
    })),
    activityNumber,
    totalActivities,
    previousActivitySlug,
    nextActivitySlug,
  };
}

export async function evaluateSubmission(
  playerSessionId: string,
  input: StudentSubmissionInput,
): Promise<SafeEvaluationResult> {
  const parsed = submissionSchema.parse(input);
  const { activityId, responseData } = parsed;

  function normalizeJsonValue(rawValue: unknown): Prisma.InputJsonValue | null {
    if (rawValue === null || rawValue === undefined) {
      return null;
    }

    if (
      typeof rawValue === "string" ||
      typeof rawValue === "number" ||
      typeof rawValue === "boolean"
    ) {
      return rawValue;
    }

    if (Array.isArray(rawValue)) {
      return rawValue.map((item) => normalizeJsonValue(item)) as
        | Prisma.InputJsonValue[]
        | null;
    }

    if (typeof rawValue === "object") {
      const normalizedObject: Record<string, Prisma.InputJsonValue | null> = {};
      for (const [key, value] of Object.entries(rawValue)) {
        normalizedObject[key] = normalizeJsonValue(value);
      }
      return normalizedObject as Prisma.InputJsonValue;
    }

    throw new Error("البيانات المرسلة غير صالحة للمعالجة");
  }

  const normalizedResponseData = normalizeJsonValue(responseData);

  // Retrieve activity and its answer key
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      answerKey: true,
      journey: true,
    },
  });

  if (!activity) {
    throw new Error("النشاط المطلوب غير موجود");
  }

  let isCorrect = true;
  let score = 1.0;

  if (activity.isGraded && activity.answerKey) {
    const answerKey = activity.answerKey;
    const answerData = answerKey.answerData as Record<string, unknown>;

    if (activity.type === "single_choice") {
      const submitted = responseData?.selectedOption;
      const correct = answerData?.correctOption;
      isCorrect = submitted === correct;
      score = isCorrect ? 1.0 : 0.0;
    } else if (activity.type === "checklist") {
      const submitted = (responseData?.selectedOptions as string[]) || [];
      const correct = (answerData?.correctOptions as string[]) || [];
      // Grade matching elements
      const matchesAll =
        submitted.length === correct.length &&
        submitted.every((val) => correct.includes(val));
      isCorrect = matchesAll;
      score = isCorrect ? 1.0 : 0.0;
    } else if (activity.type === "matching") {
      const submittedPairs =
        (responseData?.pairs as Record<string, string>) || {};
      const correctPairs = (answerData?.pairs as Record<string, string>) || {};
      const keys = Object.keys(correctPairs);
      let matches = 0;
      for (const k of keys) {
        if (submittedPairs[k] === correctPairs[k]) {
          matches++;
        }
      }
      isCorrect = matches === keys.length;
      score = keys.length > 0 ? matches / keys.length : 1.0;
    } else if (activity.type === "ordering") {
      const submittedOrder = (responseData?.order as string[]) || [];
      const correctOrder = (answerData?.order as string[]) || [];
      const matchesAll =
        submittedOrder.length === correctOrder.length &&
        submittedOrder.every((val, index) => val === correctOrder[index]);
      isCorrect = matchesAll;
      score = isCorrect ? 1.0 : 0.0;
    } else if (
      activity.type === "fill_in_the_blank" ||
      activity.type === "word_bank"
    ) {
      // responseData is expected to be { blanks: { blank1: "value", blank2: "value" } }
      const submittedBlanks =
        (responseData?.blanks as Record<string, string>) || {};
      const correctBlanks = (answerData as Record<string, string[]>) || {};
      const blankKeys = Object.keys(correctBlanks);
      let matches = 0;
      for (const key of blankKeys) {
        const submittedVal = normalizeArabicText(submittedBlanks[key] || "");
        const acceptedList = (correctBlanks[key] || []).map(
          normalizeArabicText,
        );
        if (acceptedList.includes(submittedVal)) {
          matches++;
        }
      }
      isCorrect = matches === blankKeys.length;
      score = blankKeys.length > 0 ? matches / blankKeys.length : 1.0;
    } else {
      // Fallback for open or unhandled graded tasks
      isCorrect = true;
      score = 1.0;
    }
  } else {
    // Ungraded activities are automatically considered correct/completed upon submission
    isCorrect = true;
    score = 1.0;
  }

  // Enforce storage policy inside a database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch current activity progress or initialize it
    let progress = await tx.activityProgress.findUnique({
      where: {
        playerSessionId_activityId: {
          playerSessionId,
          activityId,
        },
      },
    });

    const nextAttemptNumber = (progress?.attemptsCount || 0) + 1;

    // 2. Create activity attempt record based on policy rules
    let savedResponseData: Prisma.InputJsonValue | null = null;
    let savedResponseHash: string | null = null;
    let savedIsCorrect: boolean | null = isCorrect;
    let savedScore: number | null = score;

    if (activity.storagePolicy === "FULL_RESPONSE") {
      savedResponseData = normalizedResponseData;
      // MD5 or SHA256 of response data to detect duplicates
      savedResponseHash = normalizedResponseData
        ? crypto
            .createHash("sha256")
            .update(JSON.stringify(normalizedResponseData))
            .digest("hex")
        : null;
    } else if (activity.storagePolicy === "OBJECTIVE_RESULT_ONLY") {
      savedResponseData = null; // Do not save sensitive textual answers
      savedResponseHash = null;
      savedIsCorrect = isCorrect;
      savedScore = score;
    } else if (activity.storagePolicy === "COMPLETION_ONLY") {
      savedResponseData = null;
      savedResponseHash = null;
      savedIsCorrect = null; // Mark completed, but do not save score/grading details
      savedScore = null;
    }

    if (activity.storagePolicy !== "NO_PERSISTENCE") {
      await tx.activityAttempt.create({
        data: {
          playerSessionId,
          activityId,
          attemptNumber: nextAttemptNumber,
          responseData: savedResponseData ?? undefined,
          responseHash: savedResponseHash,
          isCorrect: savedIsCorrect,
          score: savedScore,
          storagePolicy: activity.storagePolicy,
        },
      });
    }

    // 3. Update ActivityProgress
    const newBestScore =
      progress?.bestScore === null || progress?.bestScore === undefined
        ? score
        : Math.max(progress.bestScore, score);

    progress = await tx.activityProgress.upsert({
      where: {
        playerSessionId_activityId: {
          playerSessionId,
          activityId,
        },
      },
      update: {
        status: "COMPLETED",
        attemptsCount: nextAttemptNumber,
        bestScore: newBestScore,
        completedAt: progress?.completedAt || new Date(),
      },
      create: {
        playerSessionId,
        activityId,
        status: "COMPLETED",
        attemptsCount: 1,
        bestScore: score,
        completedAt: new Date(),
      },
    });

    // 4. Update overall JourneyProgress
    // Fetch all stage activities for this journey to count progress
    const journeyActivities = await tx.activity.findMany({
      where: { journeyId: activity.journeyId, isPublished: true },
      select: { id: true, isGraded: true },
    });

    const activityIds = journeyActivities.map((a) => a.id);

    // Fetch all completed activities in this journey
    const completedProgresses = await tx.activityProgress.findMany({
      where: {
        playerSessionId,
        activityId: { in: activityIds },
        status: "COMPLETED",
      },
      select: {
        activityId: true,
        bestScore: true,
      },
    });

    const completedIds = completedProgresses.map((p) => p.activityId);

    // Calculate objective total and correct
    const gradedActivities = journeyActivities.filter((a) => a.isGraded);
    const objectiveTotal = gradedActivities.length;

    let objectiveCorrect = 0;
    for (const graded of gradedActivities) {
      const completed = completedProgresses.find(
        (p) => p.activityId === graded.id,
      );
      if (
        completed &&
        completed.bestScore !== null &&
        completed.bestScore >= 0.8
      ) {
        objectiveCorrect++;
      }
    }

    const allCompleted = journeyActivities.every((a) =>
      completedIds.includes(a.id),
    );
    const journeyStatus = allCompleted ? "COMPLETED" : "IN_PROGRESS";

    await tx.journeyProgress.upsert({
      where: {
        playerSessionId_journeyId: {
          playerSessionId,
          journeyId: activity.journeyId,
        },
      },
      update: {
        status: journeyStatus,
        lastActivityId: activity.id,
        objectiveCorrect,
        objectiveTotal,
        completedAt: journeyStatus === "COMPLETED" ? new Date() : null,
      },
      create: {
        playerSessionId,
        journeyId: activity.journeyId,
        status: journeyStatus,
        lastActivityId: activity.id,
        objectiveCorrect,
        objectiveTotal,
        startedAt: new Date(),
        completedAt: journeyStatus === "COMPLETED" ? new Date() : null,
      },
    });

    return { journeyStatus };
  });

  return {
    isCorrect,
    score,
    storagePolicy: activity.storagePolicy,
    modelAnswer: activity.answerKey?.modelAnswer || null,
    explanation: activity.answerKey?.explanation || null,
    journeyStatus: result.journeyStatus,
  };
}
