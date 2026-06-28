import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveActivityAudioContract } from "../src/audio/runtime/activity-audio-contract";
import { lesson1Activities } from "../src/content/lesson-activity-definitions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(__dirname, "../public/audio/v1/audio-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const assets = manifest.assets || {};

const lessonSlug = "ancient-egyptian-teacher";
const activities = lesson1Activities.map(a => ({ ...a, journeySlug: lessonSlug }));

const hasKey = (key: string) => !!assets[key];

interface BindingDetail {
  key: string | null;
  status: string;
  src: string | null;
}

interface AnswerBindingDetail {
  optionKey: string;
  label: string;
  key: string | null;
  status: string;
  src: string | null;
}

interface ScreenReport {
  lessonSlug: string;
  activityId: string;
  screenId: string;
  rendererType: string;
  visibleQuestion: string;
  bindings: {
    question: BindingDetail | null;
    instruction: BindingDetail | null;
    answers: AnswerBindingDetail[];
    feedback: {
      correct: BindingDetail | null;
      retry: BindingDetail | null;
      participation: BindingDetail | null;
      completion: BindingDetail | null;
      [key: string]: BindingDetail | null;
    };
  };
}

const screensReport: ScreenReport[] = [];

let totalQuestionKeysRequired = 0;
let totalQuestionKeysBound = 0;
let totalAnswerKeysRequired = 0;
let totalAnswerKeysBound = 0;
let totalInstructionKeysRequired = 0;
let totalInstructionKeysBound = 0;
let totalFeedbackKeysRequired = 0;
let totalFeedbackKeysBound = 0;

let missingManifestEntries = 0;
let missingWavFiles = 0;

for (const act of activities) {
  const contract = resolveActivityAudioContract(act, hasKey);
  const screenId = act.sourceKey;
  
  const screenReport: ScreenReport = {
    lessonSlug,
    activityId: act.sourceKey,
    screenId,
    rendererType: act.type,
    visibleQuestion: act.prompt || "",
    bindings: {
      question: null,
      instruction: null,
      answers: [],
      feedback: {
        correct: null,
        retry: null,
        participation: null,
        completion: null
      }
    }
  };

  // 1. Question
  if (act.prompt) {
    totalQuestionKeysRequired++;
    const key = contract.questionKey;
    const exists = hasKey(key);
    const wavExists = exists && fs.existsSync(path.resolve(__dirname, "../public", assets[key].src.replace(/^\//, "")));
    
    let status = "READY_TO_BIND";
    if (!key) status = "MISSING_ACTIVITY_KEY";
    else if (!exists) {
      status = "MISSING_MANIFEST_ENTRY";
      missingManifestEntries++;
    } else if (!wavExists) {
      status = "MISSING_WAV";
      missingWavFiles++;
    }

    if (status === "READY_TO_BIND") totalQuestionKeysBound++;

    screenReport.bindings.question = {
      key,
      status,
      src: exists ? assets[key].src : null
    };
  }

  // 2. Instruction
  if (act.instruction) {
    totalInstructionKeysRequired++;
    const key = contract.instructionKey;
    if (key) {
      const exists = hasKey(key);
      const wavExists = exists && fs.existsSync(path.resolve(__dirname, "../public", assets[key].src.replace(/^\//, "")));
      
      let status = "READY_TO_BIND";
      if (!exists) {
        status = "MISSING_MANIFEST_ENTRY";
        missingManifestEntries++;
      } else if (!wavExists) {
        status = "MISSING_WAV";
        missingWavFiles++;
      }

      if (status === "READY_TO_BIND") totalInstructionKeysBound++;

      screenReport.bindings.instruction = {
        key,
        status,
        src: exists ? assets[key].src : null
      };
    } else {
      screenReport.bindings.instruction = {
        key: null,
        status: "MISSING_ACTIVITY_KEY",
        src: null
      };
    }
  }

  // 3. Answers/Options
  for (const opt of act.options) {
    totalAnswerKeysRequired++;
    const key = contract.answerKeys[opt.optionKey];
    if (key) {
      const exists = hasKey(key);
      const wavExists = exists && fs.existsSync(path.resolve(__dirname, "../public", assets[key].src.replace(/^\//, "")));
      
      let status = "READY_TO_BIND";
      if (!exists) {
        status = "MISSING_MANIFEST_ENTRY";
        missingManifestEntries++;
      } else if (!wavExists) {
        status = "MISSING_WAV";
        missingWavFiles++;
      }

      if (status === "READY_TO_BIND") totalAnswerKeysBound++;

      screenReport.bindings.answers.push({
        optionKey: opt.optionKey,
        label: opt.label,
        key,
        status,
        src: exists ? assets[key].src : null
      });
    } else {
      screenReport.bindings.answers.push({
        optionKey: opt.optionKey,
        label: opt.label,
        key: null,
        status: "MISSING_ACTIVITY_KEY",
        src: null
      });
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
    if (fb.key) {
      if (fb.isRequired) totalFeedbackKeysRequired++;
      const exists = hasKey(fb.key);
      const wavExists = exists && fs.existsSync(path.resolve(__dirname, "../public", assets[fb.key].src.replace(/^\//, "")));
      
      let status = "READY_TO_BIND";
      if (!exists) {
        status = "MISSING_MANIFEST_ENTRY";
        missingManifestEntries++;
      } else if (!wavExists) {
        status = "MISSING_WAV";
        missingWavFiles++;
      }

      if (status === "READY_TO_BIND" && fb.isRequired) totalFeedbackKeysBound++;

      screenReport.bindings.feedback[fb.name] = {
        key: fb.key,
        status,
        src: exists ? assets[fb.key].src : null
      };
    }
  }

  screensReport.push(screenReport);
}

const reportsDir = path.resolve(__dirname, "../development/audio/edge-tts/reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Write JSON report
fs.writeFileSync(
  path.join(reportsDir, "ancient-egyptian-teacher-audio-binding.json"),
  JSON.stringify({
    lessonSlug,
    totalActivities: activities.length,
    totalScreens: activities.length,
    stats: {
      questionKeysRequired: totalQuestionKeysRequired,
      questionKeysBound: totalQuestionKeysBound,
      answerKeysRequired: totalAnswerKeysRequired,
      answerKeysBound: totalAnswerKeysBound,
      instructionKeysRequired: totalInstructionKeysRequired,
      instructionKeysBound: totalInstructionKeysBound,
      feedbackKeysRequired: totalFeedbackKeysRequired,
      feedbackKeysBound: totalFeedbackKeysBound,
      missingManifestEntries,
      missingWavFiles
    },
    screens: screensReport
  }, null, 2)
);

// Write Markdown report
let md = `# Lesson Audio Binding Report: Ancient Egyptian Teacher\n\n`;
md += `* **Lesson Slug**: \`ancient-egyptian-teacher\`\n`;
md += `* **Total Activities**: ${activities.length}\n`;
md += `* **Total Screens**: ${activities.length}\n\n`;

md += `## Audio Binding Statistics\n\n`;
md += `| Category | Required Keys | Bound Keys | Status |\n`;
md += `| :--- | :---: | :---: | :--- |\n`;
md += `| **Questions** | ${totalQuestionKeysRequired} | ${totalQuestionKeysBound} | ${totalQuestionKeysRequired === totalQuestionKeysBound ? "🟢 100% Bound" : "🔴 Missing Bindings"} |\n`;
md += `| **Answers/Items** | ${totalAnswerKeysRequired} | ${totalAnswerKeysBound} | ${totalAnswerKeysRequired === totalAnswerKeysBound ? "🟢 100% Bound" : "🔴 Missing Bindings"} |\n`;
md += `| **Instructions** | ${totalInstructionKeysRequired} | ${totalInstructionKeysBound} | ${totalInstructionKeysRequired === totalInstructionKeysBound ? "🟢 100% Bound" : "🔴 Missing Bindings"} |\n`;
md += `| **Spoken Feedback** | ${totalFeedbackKeysRequired} | ${totalFeedbackKeysBound} | ${totalFeedbackKeysRequired === totalFeedbackKeysBound ? "🟢 100% Bound" : "🔴 Missing Bindings"} |\n\n`;

md += `## Screen by Screen Audio Binding Inventory\n\n`;

for (const s of screensReport) {
  md += `### Screen ID: \`${s.screenId}\` (${s.rendererType})\n`;
  md += `* **Visible Question/Prompt**: "${s.visibleQuestion}"\n`;
  if (s.bindings.question) {
    md += `* **Question Audio**: \`${s.bindings.question.key}\` - **Status**: \`${s.bindings.question.status}\` (${s.bindings.question.src || "N/A"})\n`;
  }
  if (s.bindings.instruction) {
    md += `* **Instruction Audio**: \`${s.bindings.instruction.key}\` - **Status**: \`${s.bindings.instruction.status}\` (${s.bindings.instruction.src || "N/A"})\n`;
  }
  md += `* **Answers/Options**:\n`;
  for (const ans of s.bindings.answers) {
    md += `  * Option \`${ans.optionKey}\` ("${ans.label}"): \`${ans.key}\` - **Status**: \`${ans.status}\` (${ans.src || "N/A"})\n`;
  }
  md += `* **Feedback Audios**:\n`;
  if (s.bindings.feedback.correct) {
    md += `  * Correct: \`${s.bindings.feedback.correct.key}\` - **Status**: \`${s.bindings.feedback.correct.status}\`\n`;
  }
  if (s.bindings.feedback.retry) {
    md += `  * Retry: \`${s.bindings.feedback.retry.key}\` - **Status**: \`${s.bindings.feedback.retry.status}\`\n`;
  }
  if (s.bindings.feedback.participation) {
    md += `  * Participation: \`${s.bindings.feedback.participation.key}\` - **Status**: \`${s.bindings.feedback.participation.status}\`\n`;
  }
  if (s.bindings.feedback.completion) {
    md += `  * Completion: \`${s.bindings.feedback.completion.key}\` - **Status**: \`${s.bindings.feedback.completion.status}\`\n`;
  }
  md += `\n---\n\n`;
}

fs.writeFileSync(
  path.join(reportsDir, "ancient-egyptian-teacher-audio-binding.md"),
  md
);

console.log("Successfully generated lesson 1 audio binding reports.");
