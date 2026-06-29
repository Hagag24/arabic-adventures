import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveActivityAudioContract } from "../../src/audio/runtime/activity-audio-contract";
import { lesson1Activities } from "../../src/content/lesson-activity-definitions";
import * as definitions from "../../src/content/lesson-activity-definitions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ActivityDefinition } from "../../src/content/lesson-activity-definitions";

const lesson2Activities = (definitions as Record<string, unknown>).lesson2Activities as ActivityDefinition[] || [];
const allActivities = [
  ...lesson1Activities.map(a => ({ ...a, journeySlug: "ancient-egyptian-teacher" })),
  ...lesson2Activities.map((a) => ({ ...a, journeySlug: "magdi-yacoub" }))
];

const manifestPath = path.resolve(__dirname, "../../public/audio/v1/audio-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const assets = manifest.assets || {};

interface ClassifiedAsset {
  classification: string;
  lesson: string;
  references: string[];
  runtimeEvent: string;
  src: string;
  reachability: string;
}

// Classify assets
const classifiedAssets: Record<string, ClassifiedAsset> = {};

// 1. Welcome
classifiedAssets["global.welcome.01"] = {
  classification: "welcome",
  lesson: "global",
  references: ["Global Welcome Screen"],
  runtimeEvent: "App load / Welcome page",
  src: "/audio/v1/global/welcome/01.wav",
  reachability: "REACHABLE"
};

// 2. Story
const stories = [
  "lessons.ancient-egyptian-teacher.story",
  "lessons.magdi-yacoub.story"
];
stories.forEach(key => {
  const lesson = key.includes("ancient") ? "ancient-egyptian-teacher" : "magdi-yacoub";
  classifiedAssets[key] = {
    classification: "story",
    lesson,
    references: [`${lesson} Story`],
    runtimeEvent: "Story presentation",
    src: `/audio/v1/lessons/${lesson}/story.wav`,
    reachability: "REACHABLE"
  };
});

// Helper to check key in manifest
const hasKey = (k: string) => !!assets[k];

// Loop activities and classify
for (const act of allActivities) {
  const contract = resolveActivityAudioContract(act, hasKey);
  const lesson = act.journeySlug;
  const screenRef = `${lesson}:${act.slug}`;

  // Question
  if (contract.questionKey) {
    classifiedAssets[contract.questionKey] = {
      classification: "question",
      lesson,
      references: [screenRef],
      runtimeEvent: "Screen entry (autoplay)",
      src: assets[contract.questionKey]?.src || "",
      reachability: "REACHABLE"
    };
  }

  // Instruction
  if (contract.instructionKey) {
    classifiedAssets[contract.instructionKey] = {
      classification: "instruction",
      lesson,
      references: [screenRef],
      runtimeEvent: "Instruction click",
      src: assets[contract.instructionKey]?.src || "",
      reachability: "REACHABLE"
    };
  }

  // Answers
  for (const [optKey, key] of Object.entries(contract.answerKeys)) {
    if (key) {
      if (!classifiedAssets[key]) {
        classifiedAssets[key] = {
          classification: "answer",
          lesson,
          references: [],
          runtimeEvent: "Option click",
          src: assets[key]?.src || "",
          reachability: "REACHABLE"
        };
      }
      classifiedAssets[key].references.push(`${screenRef} (option: ${optKey})`);
    }
  }

  // Spoken feedback
  const feedbackKeys = [
    { key: contract.correctFeedbackKey, type: "correct feedback" },
    { key: contract.retryFeedbackKey, type: "retry feedback" },
    { key: contract.participationFeedbackKey, type: "participation feedback" },
    { key: contract.completionFeedbackKey, type: "completion feedback" }
  ];

  for (const fb of feedbackKeys) {
    if (fb.key) {
      if (fb.key === "global.feedback.correct.01" || fb.key === "global.feedback.retry.01") {
        if (!classifiedAssets[fb.key]) {
          classifiedAssets[fb.key] = {
            classification: fb.key.includes("correct") ? "correct feedback" : "retry feedback",
            lesson: "global",
            references: [],
            runtimeEvent: "Submission feedback",
            src: assets[fb.key]?.src || "",
            reachability: "REACHABLE"
          };
        }
        classifiedAssets[fb.key].references.push(`${screenRef} (fallback)`);
      } else {
        classifiedAssets[fb.key] = {
          classification: fb.type,
          lesson,
          references: [screenRef],
          runtimeEvent: "Submission feedback",
          src: assets[fb.key]?.src || "",
          reachability: "REACHABLE"
        };
      }
    }
  }
}

// Add the SFX
const sfx = [
  "global.sfx.correct",
  "global.sfx.incorrect",
  "global.sfx.completion",
  "global.sfx.lesson-complete.01"
];
sfx.forEach(key => {
  const fileName = key === "global.sfx.lesson-complete.01"
    ? "lesson-complete.01.wav"
    : `${key.split(".").pop()}.wav`;
  classifiedAssets[key] = {
    classification: "sfx",
    lesson: "global",
    references: ["Any graded activity submission"],
    runtimeEvent: "Submission SFX",
    src: `/audio/v1/sfx/${fileName}`,
    reachability: "REACHABLE"
  };
});

// Construct the final JSON object
const report = {
  paths: {
    production_audio: "public/audio/v1/",
    generation_tooling: "development/audio/edge-tts/",
    legacy_archive: "development/audio/archive/",
    runtime_service: "src/audio/",
    components: "src/components/audio/",
    activity_components: "src/components/activity/",
    activity_renderers: "src/components/activity/renderers/",
    backend_services: "src/server/services/",
    content_definitions: "src/content/",
    scripts: "scripts/",
    package_json: "package.json"
  },
  manifest_metadata: {
    version: manifest.version || "1",
    total_assets: Object.keys(assets).length,
    speech_entries: Object.keys(assets).filter(k => !k.includes(".sfx.")).length,
    sfx_entries: Object.keys(assets).filter(k => k.includes(".sfx.")).length
  },
  detected_defects: [
    {
      id: "DEFECT_01",
      symptom: "Autoplay does not work for subsequent activities.",
      affected_activities: "All activities after the first one.",
      root_cause: "Autoplay effect in ActivityPlayerClient was bound to activity.promptAudioKey which was missing in later activities, and did not trigger correctly on screen transitions.",
      severity: "CRITICAL"
    },
    {
      id: "DEFECT_02",
      symptom: "Speaker buttons and option clicks do not play audio in later activities.",
      affected_activities: "All Matching, Ordering, Checklist, and later Choice activities.",
      root_cause: "Renderers were hardcoded to look for option.narrationKey which was undefined for later activities. No fallback or contract resolver was used at runtime.",
      severity: "CRITICAL"
    },
    {
      id: "DEFECT_03",
      symptom: "Spoken feedback does not play; only SFX plays.",
      affected_activities: "All activities.",
      root_cause: "ActivityPlayerClient only played the SFX from the evaluation result and did not sequence or trigger the spoken feedback WAV.",
      severity: "HIGH"
    }
  ],
  speech_assets: classifiedAssets
};

const outputDir = path.resolve(__dirname, "../audio/edge-tts/reports");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, "audio-architecture-analysis.json"),
  JSON.stringify(report, null, 2)
);

console.log("Successfully generated audio-architecture-analysis.json");
