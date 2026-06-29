import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveActivityAudioContract } from "../../src/audio/runtime/activity-audio-contract";
import { lesson1Activities } from "../../src/content/lesson-activity-definitions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(__dirname, "../../public/audio/v1/audio-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const assets = manifest.assets || {};

const lessonSlug = "ancient-egyptian-teacher";
const activities = lesson1Activities.map(a => ({ ...a, journeySlug: lessonSlug }));

const hasKey = (key: string) => !!assets[key];

let totalQuestionKeysRequired = 0;
let totalQuestionKeysBound = 0;
let totalAnswerKeysRequired = 0;
let totalAnswerKeysBound = 0;
let totalInstructionKeysRequired = 0;
let totalInstructionKeysBound = 0;
let totalFeedbackKeysRequired = 0;
let totalFeedbackKeysBound = 0;

let missingActivityKeys = 0;
let missingManifestEntries = 0;
let missingWavFiles = 0;

for (const act of activities) {
  const contract = resolveActivityAudioContract(act, hasKey);

  // 1. Question
  if (act.prompt) {
    totalQuestionKeysRequired++;
    const key = contract.questionKey;
    if (!key) {
      missingActivityKeys++;
    } else {
      const exists = hasKey(key);
      if (!exists) {
        missingManifestEntries++;
        console.error(`[MISSING_MANIFEST_ENTRY] lesson=${lessonSlug} activity=${act.slug} event=question key=${key}`);
      } else {
        const wavExists = fs.existsSync(path.resolve(__dirname, "../../public", assets[key].src.replace(/^\//, "")));
        if (!wavExists) {
          missingWavFiles++;
          console.error(`[MISSING_WAV] lesson=${lessonSlug} activity=${act.slug} event=question key=${key} file=${assets[key].src}`);
        } else {
          totalQuestionKeysBound++;
        }
      }
    }
  }

  // 2. Instruction
  if (act.instruction) {
    totalInstructionKeysRequired++;
    const key = contract.instructionKey;
    if (!key) {
      missingActivityKeys++;
    } else {
      const exists = hasKey(key);
      if (!exists) {
        missingManifestEntries++;
        console.error(`[MISSING_MANIFEST_ENTRY] lesson=${lessonSlug} activity=${act.slug} event=instruction key=${key}`);
      } else {
        const wavExists = fs.existsSync(path.resolve(__dirname, "../../public", assets[key].src.replace(/^\//, "")));
        if (!wavExists) {
          missingWavFiles++;
          console.error(`[MISSING_WAV] lesson=${lessonSlug} activity=${act.slug} event=instruction key=${key} file=${assets[key].src}`);
        } else {
          totalInstructionKeysBound++;
        }
      }
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

  for (const opt of optionsToAudit) {
    totalAnswerKeysRequired++;
    const roundId = (act.type === "multi_round" && act.configuration?.rounds)
      ? (act.configuration.rounds as Array<{ id: string; options?: Array<{ optionKey: string }> }>).find(
          (r) => r.options?.some((o) => o.optionKey === opt.optionKey)
        )?.id
      : undefined;

    const roundContract = resolveActivityAudioContract(act, {
      hasKey,
      roundId,
    });

    const key = roundContract.answerKeys[opt.optionKey];
    if (!key) {
      missingActivityKeys++;
    } else {
      const exists = hasKey(key);
      if (!exists) {
        missingManifestEntries++;
        console.error(`[MISSING_MANIFEST_ENTRY] lesson=${lessonSlug} activity=${act.slug} event=answer key=${key}`);
      } else {
        const wavExists = fs.existsSync(path.resolve(__dirname, "../../public", assets[key].src.replace(/^\//, "")));
        if (!wavExists) {
          missingWavFiles++;
          console.error(`[MISSING_WAV] lesson=${lessonSlug} activity=${act.slug} event=answer key=${key} file=${assets[key].src}`);
        } else {
          totalAnswerKeysBound++;
        }
      }
    }
  }

  // 4. Feedback Keys
  const fbKeys = [
    { name: "correct", key: contract.correctFeedbackKey, isRequired: act.isGraded !== false },
    { name: "retry", key: contract.retryFeedbackKey, isRequired: act.isGraded !== false },
    { name: "participation", key: contract.participationFeedbackKey, isRequired: act.isGraded === false },
    { name: "completion", key: contract.completionFeedbackKey, isRequired: act.type === "self_assessment" }
  ];

  for (const fb of fbKeys) {
    if (fb.isRequired && fb.key) {
      totalFeedbackKeysRequired++;
      const exists = hasKey(fb.key);
      if (!exists) {
        missingManifestEntries++;
        console.error(`[MISSING_MANIFEST_ENTRY] lesson=${lessonSlug} activity=${act.slug} event=feedback key=${fb.key}`);
      } else {
        const wavExists = fs.existsSync(path.resolve(__dirname, "../../public", assets[fb.key].src.replace(/^\//, "")));
        if (!wavExists) {
          missingWavFiles++;
          console.error(`[MISSING_WAV] lesson=${lessonSlug} activity=${act.slug} event=feedback key=${fb.key} file=${assets[fb.key].src}`);
        } else {
          totalFeedbackKeysBound++;
        }
      }
    }
  }
}

console.log(`\n--- AUDIT RESULTS FOR ${lessonSlug.toUpperCase()} ---`);
console.log(`lesson = ${lessonSlug}`);
console.log(`activities = ${activities.length}`);
console.log(`screens = ${activities.length}`);
console.log(`renderer families = Choice, Matching, Ordering, Checklist, SelfAssessment, Reflection/free-text`);
console.log(`\nquestion keys required = ${totalQuestionKeysRequired}`);
console.log(`question keys bound = ${totalQuestionKeysBound}`);
console.log(`answer/item keys required = ${totalAnswerKeysRequired}`);
console.log(`answer/item keys bound = ${totalAnswerKeysBound}`);
console.log(`instruction keys required = ${totalInstructionKeysRequired}`);
console.log(`instruction keys bound = ${totalInstructionKeysBound}`);
console.log(`spoken-feedback keys required = ${totalFeedbackKeysRequired}`);
console.log(`spoken-feedback keys bound = ${totalFeedbackKeysBound}`);
console.log(`\nmissing activity keys = ${missingActivityKeys}`);
console.log(`missing manifest entries = ${missingManifestEntries}`);
console.log(`missing WAV files = ${missingWavFiles}`);

if (missingActivityKeys > 0 || missingManifestEntries > 0 || missingWavFiles > 0) {
  console.error("\n[AUDIT FAILED] Some required bindings are missing or invalid!");
  process.exit(1);
} else {
  console.log("\n[AUDIT PASSED] All bindings are 100% valid and verified!");
  process.exit(0);
}
