import fs from "fs";
import path from "path";
import { buildSeedActivities } from "../../src/content/activity-seed-builder.js";
import { workbookActivityInventory } from "../../src/content/workbook-activity-inventory.js";

// Mapping of Lesson 1 active sourceKeys to sequential displayOrder / activityNumber
const j1Mapping = [
  { key: "j1-18", slug: "arabic-feelings-j1" },
  { key: "j1-19", slug: "arabic-self-assessment" },
  { key: "j1-01", slug: "titles-generation" },
  { key: "j1-02", slug: "student-questions" },
  { key: "j1-11", slug: "best-title-choice" },
  { key: "j1-03", slug: "main-idea-choice" },
  { key: "j1-07", slug: "tomb-location" },
  { key: "j1-08", slug: "tomb-importance" },
  { key: "j1-09", slug: "teacher-status-discovery" },
  { key: "j1-13", slug: "synonym-matching" },
  { key: "j1-14", slug: "antonyms-detailed" },
  { key: "j1-04", slug: "event-meaning-matching" },
  { key: "j1-15", slug: "event-ordering" },
  { key: "j1-17", slug: "what-if-reflection" },
  { key: "j1-10", slug: "discovery-results" },
  { key: "j1-05", slug: "character-event-identification" },
  { key: "j1-20", slug: "mental-visualization" },
  { key: "j1-21", slug: "new-words-usage" },
  { key: "j1-22", slug: "classroom-attention" }
];

// Mapping of Lesson 2 active sourceKeys to sequential displayOrder / activityNumber
const j2Mapping = [
  { key: "j2-47", slug: "yacoub-praise-assessment" },
  { key: "j2-48", slug: "yacoub-score-motivation" },
  { key: "j2-24", slug: "yacoub-title-prediction" },
  { key: "j2-26", slug: "yacoub-stages-ordering" },
  { key: "j2-28", slug: "yacoub-return-year" },
  { key: "j2-30", slug: "yacoub-surgeon-calmness" },
  { key: "j2-31", slug: "yacoub-alternative-solution" },
  { key: "j2-38", slug: "yacoub-insist-reason-open" },
  { key: "j2-39", slug: "yacoub-biggest-challenge" },
  { key: "j2-44", slug: "yacoub-new-word" },
  { key: "j2-32", slug: "yacoub-arabic-practical-use" },
  { key: "j2-27", slug: "yacoub-life-ordering" },
  { key: "j2-33", slug: "yacoub-problem-solutions" },
  { key: "j2-36", slug: "yacoub-funding-alternatives" },
  { key: "j2-34", slug: "yacoub-character-opinion" },
  { key: "j2-25", slug: "yacoub-interview-questions" },
  { key: "j2-37", slug: "yacoub-story-retell" },
  { key: "j2-41", slug: "yacoub-humanitarian-project" },
  { key: "j2-43", slug: "yacoub-student-problem" },
  { key: "j2-23", slug: "yacoub-story-titles" },
  { key: "j2-29", slug: "yacoub-target-community" },
  { key: "j2-40", slug: "yacoub-alternative-ending" },
  { key: "j2-42", slug: "yacoub-different-ending" },
  { key: "j2-45", slug: "yacoub-agree-disagree" },
  { key: "j2-49", slug: "yacoub-listening-behavior" },
  { key: "j2-50", slug: "yacoub-improvement-checklist" },
  { key: "j2-51", slug: "yacoub-competitions-assessment" },
  { key: "j2-52", slug: "yacoub-encouragement-assessment" }
];

const seedActivities = buildSeedActivities();

function getDefinition(key) {
  const sa = seedActivities.find(a => a.sourceItemKey === key);
  if (!sa) {
    throw new Error(`Definition not found for key: ${key}`);
  }
  return sa;
}

const finalJ1 = j1Mapping.map((m, idx) => {
  const def = getDefinition(m.key);
  const inv = workbookActivityInventory.find(i => i.sourceItemKey === m.key);
  
  // Custom multi-round round config for j1-15 (ordering A + B)
  let configuration = null;
  if (m.key === "j1-15") {
    // Merge j1-16 ordering into j1-15
    const def16 = getDefinition("j1-16");
    configuration = {
      rounds: [
        {
          id: "round-a",
          type: "ordering",
          title: def.title,
          instruction: def.instruction,
          prompt: def.prompt,
          options: def.options,
          answerKey: def.answerKey
        },
        {
          id: "round-b",
          type: "ordering",
          title: def16.title,
          instruction: def16.instruction,
          prompt: def16.prompt,
          options: def16.options,
          answerKey: def16.answerKey
        }
      ]
    };
  }

  return {
    sourceKey: m.key,
    sourceLessonNumber: 1,
    sourceActivityNumber: idx + 1,
    slug: def.slug,
    type: configuration ? "multi_round" : def.type,
    title: def.title,
    instruction: def.instruction,
    prompt: def.prompt,
    skillTags: def.skillTags,
    isGraded: def.isGraded,
    isSensitive: false,
    storagePolicy: inv.storagePolicy,
    options: def.options || [],
    answerKey: def.answerKey || null,
    configuration,
    instructionAudioKey: `${def.journeySlug}-${def.slug}-instruction`,
    promptAudioKey: def.prompt ? `${def.journeySlug}-${def.slug}-prompt` : null,
    correctFeedbackAudioKey: def.isGraded ? `${def.journeySlug}-${def.slug}-correct-feedback` : null,
    incorrectFeedbackAudioKey: def.isGraded ? `${def.journeySlug}-${def.slug}-incorrect-feedback` : null,
    completionFeedbackAudioKey: `${def.journeySlug}-${def.slug}-completion-feedback`
  };
});

const finalJ2 = j2Mapping.map((m, idx) => {
  const def = getDefinition(m.key);
  const inv = workbookActivityInventory.find(i => i.sourceItemKey === m.key);

  return {
    sourceKey: m.key,
    sourceLessonNumber: 2,
    sourceActivityNumber: idx + 1,
    slug: def.slug,
    type: def.type,
    title: def.title,
    instruction: def.instruction,
    prompt: def.prompt,
    skillTags: def.skillTags,
    isGraded: def.isGraded,
    isSensitive: false,
    storagePolicy: inv.storagePolicy,
    options: def.options || [],
    answerKey: def.answerKey || null,
    configuration: null,
    instructionAudioKey: `${def.journeySlug}-${def.slug}-instruction`,
    promptAudioKey: def.prompt ? `${def.journeySlug}-${def.slug}-prompt` : null,
    correctFeedbackAudioKey: def.isGraded ? `${def.journeySlug}-${def.slug}-correct-feedback` : null,
    incorrectFeedbackAudioKey: def.isGraded ? `${def.journeySlug}-${def.slug}-incorrect-feedback` : null,
    completionFeedbackAudioKey: `${def.journeySlug}-${def.slug}-completion-feedback`
  };
});

const fileContent = `// Authoritative Two-Lesson Activity Definitions
// Generated automatically from legacy seed data.

export interface ActivityDefinition {
  sourceKey: string;
  sourceLessonNumber: number;
  sourceActivityNumber: number;
  slug: string;
  type: string;
  title: string;
  instruction: string;
  prompt: string | null;
  skillTags: string[];
  isGraded: boolean;
  isSensitive: boolean;
  storagePolicy: "FULL_RESPONSE" | "OBJECTIVE_RESULT_ONLY" | "COMPLETION_ONLY" | "NO_PERSISTENCE";
  options: Array<{
    optionKey: string;
    label: string;
    secondaryText?: string | null;
    displayOrder: number;
    narrationKey?: string | null;
  }>;
  answerKey: {
    answerData: any;
    acceptedAlternatives?: any;
    modelAnswer?: string | null;
    explanation?: string | null;
  } | null;
  configuration: any | null;
  instructionAudioKey: string;
  promptAudioKey: string | null;
  correctFeedbackAudioKey: string | null;
  incorrectFeedbackAudioKey: string | null;
  completionFeedbackAudioKey: string;
}

export const lesson1Activities: ActivityDefinition[] = ${JSON.stringify(finalJ1, null, 2)};

export const lesson2Activities: ActivityDefinition[] = ${JSON.stringify(finalJ2, null, 2)};

export const allActivities: ActivityDefinition[] = [...lesson1Activities, ...lesson2Activities];
`;

fs.writeFileSync(path.resolve("src/content/lesson-activity-definitions.ts"), fileContent, "utf8");
console.log("Successfully generated src/content/lesson-activity-definitions.ts");
