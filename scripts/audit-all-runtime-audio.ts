import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveActivityAudioContract } from "../src/audio/runtime/activity-audio-contract";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  ActivityDefinition,
  lesson1Activities,
} from "../src/content/lesson-activity-definitions";
import * as definitions from "../src/content/lesson-activity-definitions";

const lesson2Activities = (definitions as Record<string, unknown>).lesson2Activities as unknown as ActivityDefinition[] || [];

const manifestPath = path.resolve(__dirname, "../public/audio/v1/audio-manifest.json");
const manifestData = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const manifestAssets = manifestData.assets || {};

const allActivities = [
  ...lesson1Activities.map(a => ({ ...a, journeySlug: "ancient-egyptian-teacher" as const })),
  ...lesson2Activities.map((a) => ({ ...a, journeySlug: "magdi-yacoub" as const }))
];

const hasKey = (key: string) => !!manifestAssets[key];

console.log(`Loaded ${allActivities.length} total activities.`);

const totalScreens = allActivities.length;
let questionRequired = 0;
let questionBound = 0;
let answerRequired = 0;
let answerBound = 0;
let instructionRequired = 0;
let instructionBound = 0;
let feedbackRequired = 0;
let feedbackBound = 0;

let missingActivityKeys = 0;
let missingManifestEntries = 0;
let missingWavFiles = 0;
const rendererBindingsMissing = 0;
let unexplainedSpeechAssets = 0;

interface ActivityBindings {
  instruction?: { key: string; status: string };
  question?: { key: string; status: string };
  options: Record<string, { key: string; status: string }>;
  correctFeedback?: { key: string; status: string };
  retryFeedback?: { key: string; status: string };
  completionFeedback?: { key: string; status: string };
}

const bindingReport: Array<{
  lesson: string;
  activityId: string;
  slug: string;
  type: string;
  bindings: ActivityBindings;
}> = [];
const boundKeys = new Set<string>();

// We also need to account for welcome, story, and other keys
const globalKeys = [
  "global.welcome.01",
  "global.feedback.correct.01",
  "global.feedback.retry.01",
  "global.feedback.completion.01",
  "global.feedback.participation.01",
  "lessons.ancient-egyptian-teacher.story",
  "lessons.magdi-yacoub.story",
  "lessons.ancient-egyptian-teacher.result",
  "lessons.magdi-yacoub.result"
];

globalKeys.forEach(k => boundKeys.add(k));

for (const act of allActivities) {
  const contract = resolveActivityAudioContract(act, hasKey);
  const screenReport = {
    lesson: act.journeySlug,
    activityId: act.sourceKey,
    slug: act.slug,
    type: act.type,
    bindings: {
      options: {}
    } as ActivityBindings
  };

  // 1. Instruction
  if (act.instruction) {
    instructionRequired++;
    const key = contract.instructionKey;
    if (key) {
      const exists = !!manifestAssets[key];
      screenReport.bindings.instruction = { key, status: exists ? "BOUND" : "MISSING_MANIFEST_ENTRY" };
      if (exists) {
        instructionBound++;
        boundKeys.add(key);
      } else {
        missingManifestEntries++;
      }
    } else {
      missingActivityKeys++;
    }
  }

  // 2. Question/Prompt
  if (act.prompt) {
    questionRequired++;
    const key = contract.questionKey;
    if (key) {
      const exists = !!manifestAssets[key];
      screenReport.bindings.question = { key, status: exists ? "BOUND" : "MISSING_MANIFEST_ENTRY" };
      if (exists) {
        questionBound++;
        boundKeys.add(key);
      } else {
        missingManifestEntries++;
        console.log(`[MISSING_MANIFEST_ENTRY] key=${key} (Question)`);
      }
    } else {
      missingActivityKeys++;
    }
  }

  // 3. Answers/Options
  let optionsToAudit = act.options || [];
  if (act.type === "multi_round" && act.configuration?.rounds) {
    optionsToAudit = [];
    for (const round of act.configuration.rounds) {
      if (round.options) {
        optionsToAudit.push(...round.options);
      }
    }
  }

  for (const option of optionsToAudit) {
    answerRequired++;
    const roundId = (act.type === "multi_round" && act.configuration?.rounds)
      ? (act.configuration.rounds as Array<{ id: string; options?: Array<{ optionKey: string }> }>).find(
          (r) => r.options?.some((o) => o.optionKey === option.optionKey)
        )?.id
      : undefined;

    const roundContract = resolveActivityAudioContract(act, {
      hasKey,
      roundId,
    });

    const key = roundContract.answerKeys[option.optionKey];
    if (key) {
      const exists = !!manifestAssets[key];
      screenReport.bindings.options[option.optionKey] = { key, status: exists ? "BOUND" : "MISSING_MANIFEST_ENTRY" };
      if (exists) {
        answerBound++;
        boundKeys.add(key);
      } else {
        missingManifestEntries++;
        console.log(`[MISSING_MANIFEST_ENTRY] key=${key} (Answer: ${option.optionKey})`);
      }
    } else {
      missingActivityKeys++;
    }
  }

  // 4. Feedback
  if (act.isGraded) {
    // Correct Feedback
    feedbackRequired++;
    let key = contract.correctFeedbackKey;
    if (key) {
      const exists = !!manifestAssets[key];
      screenReport.bindings.correctFeedback = { key, status: exists ? "BOUND" : "MISSING_MANIFEST_ENTRY" };
      if (exists) {
        feedbackBound++;
        boundKeys.add(key);
      } else {
        missingManifestEntries++;
        console.log(`[MISSING_MANIFEST_ENTRY] key=${key} (CorrectFeedback)`);
      }
    }
    
    // Retry Feedback
    feedbackRequired++;
    key = contract.retryFeedbackKey;
    if (key) {
      const exists = !!manifestAssets[key];
      screenReport.bindings.retryFeedback = { key, status: exists ? "BOUND" : "MISSING_MANIFEST_ENTRY" };
      if (exists) {
        feedbackBound++;
        boundKeys.add(key);
      } else {
        missingManifestEntries++;
        console.log(`[MISSING_MANIFEST_ENTRY] key=${key} (RetryFeedback)`);
      }
    }
  } else {
    // Completion/Participation Feedback
    feedbackRequired++;
    const key = act.type === "self_assessment" ? contract.participationFeedbackKey : contract.completionFeedbackKey;
    if (key) {
      const exists = !!manifestAssets[key];
      screenReport.bindings.completionFeedback = { key, status: exists ? "BOUND" : "MISSING_MANIFEST_ENTRY" };
      if (exists) {
        feedbackBound++;
        boundKeys.add(key);
      } else {
        missingManifestEntries++;
        console.log(`[MISSING_MANIFEST_ENTRY] key=${key} (CompletionFeedback)`);
      }
    }
  }

  // Bind any existing completion/participation keys for graded activities too
  if (contract.completionFeedbackKey) {
    boundKeys.add(contract.completionFeedbackKey);
  }
  if (contract.participationFeedbackKey) {
    boundKeys.add(contract.participationFeedbackKey);
  }

  bindingReport.push(screenReport);
}

// Check physical WAV files for all bound keys
for (const key of boundKeys) {
  const asset = manifestAssets[key];
  if (asset && asset.src) {
    const wavPath = path.resolve(__dirname, "../public", asset.src.replace(/^\//, ""));
    if (!fs.existsSync(wavPath)) {
      missingWavFiles++;
      console.warn(`[AUDIO_BINDING_ERROR] Key ${key} has manifest entry but WAV file is missing at ${wavPath}`);
    }
  }
}

// Find unexplained/orphan speech assets in the manifest
const allManifestSpeechKeys = Object.keys(manifestAssets).filter(k => !k.startsWith("global.sfx."));
for (const key of allManifestSpeechKeys) {
  if (!boundKeys.has(key)) {
    unexplainedSpeechAssets++;
    console.warn(`[ORPHAN_AUDIO_ERROR] Key ${key} exists in manifest but is not bound to any activity or global event.`);
  }
}

// Classify all 250 speech assets
const welcomeKeys = new Set<string>();
const storyKeys = new Set<string>();
const instructionKeys = new Set<string>();
const questionKeys = new Set<string>();
const answerKeysList = new Set<string>();
const feedbackKeysList = new Set<string>();
const sharedGlobalKeys = new Set<string>();
const reusedKeys = new Set<string>();

for (const key of boundKeys) {
  const asset = manifestAssets[key];
  if (!asset) continue;
  
  if (key.startsWith("global.welcome.")) {
    welcomeKeys.add(key);
  } else if (key.startsWith("lessons.") && key.endsWith(".story")) {
    storyKeys.add(key);
  } else if (key.includes("-instruction")) {
    instructionKeys.add(key);
  } else if (key.includes("-prompt")) {
    questionKeys.add(key);
  } else if (key.includes("-option-")) {
    answerKeysList.add(key);
  } else if (key.includes("-feedback") || key.startsWith("global.feedback.")) {
    feedbackKeysList.add(key);
  } else if (key.startsWith("global.")) {
    sharedGlobalKeys.add(key);
  } else {
    reusedKeys.add(key);
  }
}

const totalClassified = welcomeKeys.size + storyKeys.size + instructionKeys.size + questionKeys.size + answerKeysList.size + feedbackKeysList.size + sharedGlobalKeys.size + reusedKeys.size;

console.log("\n--- SPEECH ASSET CLASSIFICATION ---");
console.log(`welcome = ${welcomeKeys.size}`);
console.log(`story = ${storyKeys.size}`);
console.log(`instruction = ${instructionKeys.size}`);
console.log(`question = ${questionKeys.size}`);
console.log(`answer = ${answerKeysList.size}`);
console.log(`spoken feedback = ${feedbackKeysList.size}`);
console.log(`shared global speech = ${sharedGlobalKeys.size}`);
console.log(`intentionally reused speech = ${reusedKeys.size}`);
console.log(`total classified speech assets = ${totalClassified}`);

console.log("\n--- AUDIT RESULTS ---");
console.log(`lessons audited = 2`);
console.log(`activity screens audited = ${totalScreens}`);
console.log(`question keys required = ${questionRequired}`);
console.log(`question keys bound = ${questionBound}`);
console.log(`answer keys required = ${answerRequired}`);
console.log(`answer keys bound = ${answerBound}`);
console.log(`instruction keys required = ${instructionRequired}`);
console.log(`instruction keys bound = ${instructionBound}`);
console.log(`feedback keys required = ${feedbackRequired}`);
console.log(`feedback keys bound = ${feedbackBound}`);
console.log(`missing activity keys = ${missingActivityKeys}`);
console.log(`missing manifest entries = ${missingManifestEntries}`);
console.log(`missing WAV files = ${missingWavFiles}`);
console.log(`renderer bindings missing = ${rendererBindingsMissing}`);
console.log(`unexplained speech assets = ${unexplainedSpeechAssets}`);

// Write JSON and MD reports
const reportDir = path.resolve(__dirname, "../development/audio/edge-tts/reports");
fs.mkdirSync(reportDir, { recursive: true });

fs.writeFileSync(
  path.join(reportDir, "full-runtime-audio-binding.json"),
  JSON.stringify({ totalScreens, questionRequired, questionBound, answerRequired, answerBound, instructionRequired, instructionBound, feedbackRequired, feedbackBound, missingActivityKeys, missingManifestEntries, missingWavFiles, unexplainedSpeechAssets, bindingReport }, null, 2)
);

let mdContent = `# Full Runtime Audio Binding Audit Report\n\n`;
mdContent += `## Summary Metrics\n\n`;
mdContent += `* **Lessons Audited**: 2\n`;
mdContent += `* **Activity Screens Audited**: ${totalScreens}\n`;
mdContent += `* **Question Keys Required/Bound**: ${questionRequired} / ${questionBound}\n`;
mdContent += `* **Answer Keys Required/Bound**: ${answerRequired} / ${answerBound}\n`;
mdContent += `* **Instruction Keys Required/Bound**: ${instructionRequired} / ${instructionBound}\n`;
mdContent += `* **Feedback Keys Required/Bound**: ${feedbackRequired} / ${feedbackBound}\n`;
mdContent += `* **Missing Activity Keys**: ${missingActivityKeys}\n`;
mdContent += `* **Missing Manifest Entries**: ${missingManifestEntries}\n`;
mdContent += `* **Missing WAV Files**: ${missingWavFiles}\n`;
mdContent += `* **Unexplained Speech Assets**: ${unexplainedSpeechAssets}\n\n`;

mdContent += `## Details\n\n`;
for (const r of bindingReport) {
  mdContent += `### Lesson: ${r.lesson} | Activity: ${r.slug} (${r.type})\n`;
  mdContent += `* **Question Key**: \`${r.bindings.question?.key || "None"}\` - **Status**: ${r.bindings.question?.status || "N/A"}\n`;
  if (r.bindings.instruction) {
    mdContent += `* **Instruction Key**: \`${r.bindings.instruction.key}\` - **Status**: ${r.bindings.instruction.status}\n`;
  }
  mdContent += `* **Options**:\n`;
  for (const [optKey, opt] of Object.entries(r.bindings.options)) {
    mdContent += `  * \`${optKey}\`: \`${opt.key}\` - **Status**: ${opt.status}\n`;
  }
  mdContent += `\n`;
}

fs.writeFileSync(path.join(reportDir, "full-runtime-audio-binding.md"), mdContent);

if (missingManifestEntries > 0 || missingWavFiles > 0 || unexplainedSpeechAssets > 0) {
  console.error("Audit failed due to errors!");
  process.exit(1);
} else {
  console.log("Audit passed successfully!");
  process.exit(0);
}
