import fs from "fs";
import path from "path";
import { allActivities } from "../../../src/content/lesson-activity-definitions";

export type AudioScriptDefinition = {
  semanticKey: string;
  relativeBasePath: string;
  category:
    | "welcome"
    | "story"
    | "instruction"
    | "prompt"
    | "option"
    | "correct_feedback"
    | "retry_feedback"
    | "completion_feedback"
    | "participation_feedback"
    | "result";
  deliveryProfile: "formal_educational" | "warm_egyptian_feedback";
  lessonSlug?: string;
  screenId?: string;
  usedByComponent: string;
};

function getRelativeBasePath(key: string, lessonSlug?: string): string {
  if (key === "global.welcome.01") return "global/welcome/01";
  if (key.startsWith("global.feedback.correct.")) {
    const num = key.split(".").pop();
    return `global/feedback/correct/${num}`;
  }
  if (key.startsWith("global.feedback.retry.")) {
    const num = key.split(".").pop();
    return `global/feedback/retry/${num}`;
  }
  if (key.startsWith("global.feedback.completion.")) {
    const num = key.split(".").pop();
    return `global/feedback/completion/${num}`;
  }
  if (key.startsWith("global.feedback.participation.")) {
    const num = key.split(".").pop();
    return `global/feedback/participation/${num}`;
  }
  if (key === "lessons.ancient-egyptian-teacher.story")
    return "lessons/ancient-egyptian-teacher/story";
  if (key === "lessons.magdi-yacoub.story") return "lessons/magdi-yacoub/story";
  if (key === "lessons.ancient-egyptian-teacher.result")
    return "lessons/ancient-egyptian-teacher/result";
  if (key === "lessons.magdi-yacoub.result")
    return "lessons/magdi-yacoub/result";

  const lessonPart = key.startsWith("ancient-egyptian-teacher-")
    ? "ancient-egyptian-teacher"
    : "magdi-yacoub";

  const rest = key.startsWith("ancient-egyptian-teacher-")
    ? key.slice("ancient-egyptian-teacher-".length)
    : key.startsWith("magdi-yacoub-")
      ? key.slice("magdi-yacoub-".length)
      : key;

  if (rest.endsWith("-instruction")) {
    const actSlug = rest.slice(0, -"-instruction".length);
    return `lessons/${lessonPart}/${actSlug}/instruction`;
  }
  if (rest.endsWith("-prompt")) {
    const actSlug = rest.slice(0, -"-prompt".length);
    return `lessons/${lessonPart}/${actSlug}/prompt`;
  }
  if (rest.endsWith("-completion-feedback") || rest.endsWith("-completion")) {
    const suffix = rest.endsWith("-completion-feedback")
      ? "-completion-feedback"
      : "-completion";
    const actSlug = rest.slice(0, -suffix.length);
    return `lessons/${lessonPart}/${actSlug}/completion-feedback`;
  }
  if (rest.includes("-option-")) {
    const parts = rest.split("-option-");
    const actSlug = parts[0];
    const optionName = parts[1];
    return `lessons/${lessonPart}/${actSlug}/option-${optionName}`;
  }
  if (rest.includes("-opt")) {
    const parts = rest.split("-opt");
    const actSlug = parts[0];
    const optionName = "opt" + parts[1];
    return `lessons/${lessonPart}/${actSlug}/option-${optionName}`;
  }

  const actualLessonSlug = lessonSlug || lessonPart;
  return `lessons/${actualLessonSlug}/${key}`;
}

function main() {
  const definitions: AudioScriptDefinition[] = [];

  // 1. Static base keys
  definitions.push({
    semanticKey: "global.welcome.01",
    relativeBasePath: "global/welcome/01",
    category: "welcome",
    deliveryProfile: "formal_educational",
    usedByComponent: "WelcomeAudioButton",
  });
  definitions.push({
    semanticKey: "global.feedback.correct.01",
    relativeBasePath: "global/feedback/correct/01",
    category: "correct_feedback",
    deliveryProfile: "warm_egyptian_feedback",
    usedByComponent: "ActivityPlayerClient",
  });
  definitions.push({
    semanticKey: "global.feedback.retry.01",
    relativeBasePath: "global/feedback/retry/01",
    category: "retry_feedback",
    deliveryProfile: "warm_egyptian_feedback",
    usedByComponent: "ActivityPlayerClient",
  });
  definitions.push({
    semanticKey: "global.feedback.completion.01",
    relativeBasePath: "global/feedback/completion/01",
    category: "completion_feedback",
    deliveryProfile: "warm_egyptian_feedback",
    usedByComponent: "ActivityPlayerClient",
  });
  definitions.push({
    semanticKey: "global.feedback.participation.01",
    relativeBasePath: "global/feedback/participation/01",
    category: "participation_feedback",
    deliveryProfile: "warm_egyptian_feedback",
    usedByComponent: "ActivityPlayerClient",
  });
  definitions.push({
    semanticKey: "lessons.ancient-egyptian-teacher.story",
    relativeBasePath: "lessons/ancient-egyptian-teacher/story",
    category: "story",
    deliveryProfile: "formal_educational",
    lessonSlug: "ancient-egyptian-teacher",
    usedByComponent: "LessonStoryAudioButton",
  });
  definitions.push({
    semanticKey: "lessons.magdi-yacoub.story",
    relativeBasePath: "lessons/magdi-yacoub/story",
    category: "story",
    deliveryProfile: "formal_educational",
    lessonSlug: "magdi-yacoub",
    usedByComponent: "LessonStoryAudioButton",
  });
  definitions.push({
    semanticKey: "lessons.ancient-egyptian-teacher.result",
    relativeBasePath: "lessons/ancient-egyptian-teacher/result",
    category: "result",
    deliveryProfile: "formal_educational",
    lessonSlug: "ancient-egyptian-teacher",
    usedByComponent: "ResultAudioButton",
  });
  definitions.push({
    semanticKey: "lessons.magdi-yacoub.result",
    relativeBasePath: "lessons/magdi-yacoub/result",
    category: "result",
    deliveryProfile: "formal_educational",
    lessonSlug: "magdi-yacoub",
    usedByComponent: "ResultAudioButton",
  });

  // 2. Loop activities
  for (const act of allActivities) {
    const lessonSlug =
      act.sourceLessonNumber === 1
        ? "ancient-egyptian-teacher"
        : "magdi-yacoub";
    const screenId = act.slug;

    if (act.instructionAudioKey && act.instruction) {
      definitions.push({
        semanticKey: act.instructionAudioKey,
        relativeBasePath: getRelativeBasePath(
          act.instructionAudioKey,
          lessonSlug,
        ),
        category: "instruction",
        deliveryProfile: "formal_educational",
        lessonSlug,
        screenId,
        usedByComponent: "ActivityPlayerClient",
      });
    }

    if (act.promptAudioKey && act.prompt) {
      definitions.push({
        semanticKey: act.promptAudioKey,
        relativeBasePath: getRelativeBasePath(act.promptAudioKey, lessonSlug),
        category: "prompt",
        deliveryProfile: "formal_educational",
        lessonSlug,
        screenId,
        usedByComponent: "ActivityPlayerClient",
      });
    }

    if (act.options) {
      for (const opt of act.options) {
        if (opt.narrationKey && opt.label) {
          definitions.push({
            semanticKey: opt.narrationKey,
            relativeBasePath: getRelativeBasePath(opt.narrationKey, lessonSlug),
            category: "option",
            deliveryProfile: "formal_educational",
            lessonSlug,
            screenId,
            usedByComponent:
              act.type === "self_assessment"
                ? "SelfAssessmentRenderer"
                : "ChoiceRenderer",
          });
        }
      }
    }

    if (act.type === "multi_round" && act.configuration?.rounds) {
      for (const round of act.configuration.rounds) {
        if (round.options) {
          for (const opt of round.options) {
            if (opt.narrationKey && opt.label) {
              definitions.push({
                semanticKey: opt.narrationKey,
                relativeBasePath: getRelativeBasePath(opt.narrationKey, lessonSlug),
                category: "option",
                deliveryProfile: "formal_educational",
                lessonSlug,
                screenId,
                usedByComponent: "MultiRoundRenderer",
              });
            }
          }
        }
      }
    }

    if (act.completionFeedbackAudioKey) {
      const isSelf = act.type === "self_assessment";
      definitions.push({
        semanticKey: act.completionFeedbackAudioKey,
        relativeBasePath: getRelativeBasePath(
          act.completionFeedbackAudioKey,
          lessonSlug,
        ),
        category: isSelf ? "participation_feedback" : "completion_feedback",
        deliveryProfile: "warm_egyptian_feedback",
        lessonSlug,
        screenId,
        usedByComponent: "ActivityPlayerClient",
      });
    }
  }

  // Deduplicate by semanticKey
  const seenKeys = new Set<string>();
  const uniqueDefinitions = definitions.filter((d) => {
    if (seenKeys.has(d.semanticKey)) return false;
    seenKeys.add(d.semanticKey);
    return true;
  });

  const outputContent = `// Canonical Audio Script Index for Student Experience
// Generated automatically from activity definitions.

export type AudioScriptDefinition = {
  semanticKey: string;
  relativeBasePath: string;
  category:
    | "welcome"
    | "story"
    | "instruction"
    | "prompt"
    | "option"
    | "correct_feedback"
    | "retry_feedback"
    | "completion_feedback"
    | "participation_feedback"
    | "result";
  deliveryProfile: "formal_educational" | "warm_egyptian_feedback";
  lessonSlug?: string;
  screenId?: string;
  usedByComponent: string;
};

export const audioScripts: AudioScriptDefinition[] = ${JSON.stringify(uniqueDefinitions, null, 2)};
`;

  const outputPath = path.resolve(
    process.cwd(),
    "src/audio/content/audio-script-index.ts",
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, outputContent, "utf-8");
  console.log(
    `✅ Generated script index with ${uniqueDefinitions.length} entries at: ${outputPath}`,
  );
}

main();
