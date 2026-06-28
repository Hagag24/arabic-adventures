/* eslint-disable */
import fs from "fs";
import path from "path";
import { allActivities } from "../../../src/content/lesson-activity-definitions";
import { audioScripts } from "../../../src/audio/content/audio-script-index";

const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");
const reportsDir = path.resolve(process.cwd(), "development/audio/reports");

type StudentAudioRequirement = {
  semanticKey: string;
  lessonSlug?: string;
  screenId?: string;
  elementId?: string;
  category:
    | "welcome"
    | "story"
    | "title"
    | "instruction"
    | "prompt"
    | "option"
    | "matching_left"
    | "matching_right"
    | "ordering_item"
    | "correct_feedback"
    | "retry_feedback"
    | "completion_feedback"
    | "participation_feedback"
    | "result";
  displayText: string;
  usedByComponent: string;
  expectedRelativeBasePath: string;
  required: boolean;
  status: "REUSABLE" | "NEEDS_GENERATION" | "MISSING_TEXT";
  txtPath?: string;
  txtExists?: boolean;
  wavPath?: string;
  wavExists?: boolean;
  manifestEntry?: boolean;
  autoPlayPolicy?:
    | "WELCOME_AFTER_UNLOCK"
    | "QUESTION_ON_SCREEN_ENTRY"
    | "ANSWER_ON_SELECTION"
    | "FEEDBACK_ON_RESULT"
    | "MANUAL_ONLY";
};

const items: StudentAudioRequirement[] = [
  {
    semanticKey: "global.welcome.01",
    category: "welcome",
    displayText: "أهلا بك يا بطل! هل أنت جاهز لنبدأ رحلتنا في اللغة العربية؟ هيا بنا!",
    usedByComponent: "WelcomeAudioButton",
    expectedRelativeBasePath: "global/welcome/01",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "global.feedback.correct.01",
    category: "correct_feedback",
    displayText: "أحسنت يا بطل! الإجابة صحيحة.",
    usedByComponent: "ActivityPlayerClient",
    expectedRelativeBasePath: "global/feedback/correct/01",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "global.feedback.retry.01",
    category: "retry_feedback",
    displayText: "ولا يهمّك، فكّر شوية وجرّب تاني.",
    usedByComponent: "ActivityPlayerClient",
    expectedRelativeBasePath: "global/feedback/retry/01",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "global.feedback.completion.01",
    category: "completion_feedback",
    displayText: "برافو يا بطل! خلّصت النشاط بنجاح.",
    usedByComponent: "ActivityPlayerClient",
    expectedRelativeBasePath: "global/feedback/completion/01",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "global.feedback.participation.01",
    category: "participation_feedback",
    displayText: "شكرًا لمشاركتك، تمّ حفظ إجابتك.",
    usedByComponent: "ActivityPlayerClient",
    expectedRelativeBasePath: "global/feedback/participation/01",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "lessons.ancient-egyptian-teacher.story",
    lessonSlug: "ancient-egyptian-teacher",
    category: "story",
    displayText:
      "بدأ المتحف المصري مشروعاً كبيراً لتطوير القاعة التي تعرض تاريخ التعليم والكتابة في مصر القديمة...",
    usedByComponent: "LessonStoryAudioButton",
    expectedRelativeBasePath: "lessons/ancient-egyptian-teacher/story",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "lessons.magdi-yacoub.story",
    lessonSlug: "magdi-yacoub",
    category: "story",
    displayText:
      "ولد الدكتور مجدي يعقوب في مصر، وكان والده طبيباً جراحاً ناجحاً...",
    usedByComponent: "LessonStoryAudioButton",
    expectedRelativeBasePath: "lessons/magdi-yacoub/story",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "lessons.ancient-egyptian-teacher.result",
    lessonSlug: "ancient-egyptian-teacher",
    category: "result",
    displayText:
      "لقد أنهيت درس المعلم المصري القديم بالكامل بنجاح وحصلت على وسام مستكشف الحضارة!",
    usedByComponent: "ResultAudioButton",
    expectedRelativeBasePath: "lessons/ancient-egyptian-teacher/result",
    required: true,
    status: "NEEDS_GENERATION",
  },
  {
    semanticKey: "lessons.magdi-yacoub.result",
    lessonSlug: "magdi-yacoub",
    category: "result",
    displayText:
      "لقد أنهيت درس حوار مع الدكتور مجدي يعقوب بالكامل بنجاح وحصلت على وسام صانع الأمل!",
    usedByComponent: "ResultAudioButton",
    expectedRelativeBasePath: "lessons/magdi-yacoub/result",
    required: true,
    status: "NEEDS_GENERATION",
  },
];

// Scan activities
for (const act of allActivities) {
  const lessonSlug =
    act.sourceLessonNumber === 1 ? "ancient-egyptian-teacher" : "magdi-yacoub";
  const screenId = act.slug;

  // Find relativeBasePath helper
  const getRelPath = (key: string): string => {
    const found = audioScripts.find((s) => s.semanticKey === key);
    return found ? found.relativeBasePath : "";
  };

  // Instruction
  if (act.instructionAudioKey && act.instruction) {
    items.push({
      semanticKey: act.instructionAudioKey,
      lessonSlug,
      screenId,
      elementId: "instruction",
      category: "instruction",
      displayText: act.instruction,
      usedByComponent: "ActivityPlayerClient",
      expectedRelativeBasePath: getRelPath(act.instructionAudioKey),
      required: true,
      status: "NEEDS_GENERATION",
    });
  }

  // Prompt
  if (act.promptAudioKey && act.prompt) {
    items.push({
      semanticKey: act.promptAudioKey,
      lessonSlug,
      screenId,
      elementId: "prompt",
      category: "prompt",
      displayText: act.prompt,
      usedByComponent: "ActivityPlayerClient",
      expectedRelativeBasePath: getRelPath(act.promptAudioKey),
      required: true,
      status: "NEEDS_GENERATION",
    });
  }

  // Options
  if (act.options) {
    for (const opt of act.options) {
      if (opt.narrationKey && opt.label) {
        let category: any = "option";
        let usedByComponent = "ChoiceRenderer";
        if (act.type === "matching") {
          const isLeft =
            opt.optionKey.startsWith("word") ||
            opt.optionKey.startsWith("evt") ||
            opt.optionKey.startsWith("elm");
          category = isLeft ? "matching_left" : "matching_right";
          usedByComponent = "MatchingRenderer";
        } else if (act.type === "ordering") {
          category = "ordering_item";
          usedByComponent = "OrderingRenderer";
        } else if (act.type === "self_assessment") {
          usedByComponent = "SelfAssessmentRenderer";
        } else if (act.type === "checklist") {
          usedByComponent = "ChecklistRenderer";
        }

        items.push({
          semanticKey: opt.narrationKey,
          lessonSlug,
          screenId,
          elementId: opt.optionKey,
          category,
          displayText: opt.label,
          usedByComponent,
          expectedRelativeBasePath: getRelPath(opt.narrationKey),
          required: true,
          status: "NEEDS_GENERATION",
        });
      }
    }
  }

  // Completion Feedback
  if (act.completionFeedbackAudioKey) {
    const isSelf = act.type === "self_assessment";
    items.push({
      semanticKey: act.completionFeedbackAudioKey,
      lessonSlug,
      screenId,
      elementId: "completion-feedback",
      category: isSelf ? "participation_feedback" : "completion_feedback",
      displayText: isSelf
        ? "شكرًا لمشاركتك، تمّ حفظ إجابتك."
        : "برافو يا بطل! خلّصت النشاط بنجاح.",
      usedByComponent: "ActivityPlayerClient",
      expectedRelativeBasePath: getRelPath(act.completionFeedbackAudioKey),
      required: true,
      status: "NEEDS_GENERATION",
    });
  }
}

// Deduplicate
const uniqueMap = new Map<string, StudentAudioRequirement>();
for (const item of items) {
  if (uniqueMap.has(item.semanticKey)) {
    const existing = uniqueMap.get(item.semanticKey)!;
    if (!existing.screenId && item.screenId) {
      uniqueMap.set(item.semanticKey, item);
    }
  } else {
    uniqueMap.set(item.semanticKey, item);
  }
}

const finalItems = Array.from(uniqueMap.values());

// Audit existing files
const manifestPath = path.join(publicAudioDir, "audio-manifest.json");
let manifest: any = { assets: {} };
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

for (const item of finalItems) {
  const wavPath = path.join(
    publicAudioDir,
    `${item.expectedRelativeBasePath}.wav`,
  );
  const txtPath = path.join(
    publicAudioDir,
    `${item.expectedRelativeBasePath}.txt`,
  );
  
  item.wavPath = wavPath.replace(process.cwd() + path.sep, "").replace(/\\/g, "/");
  item.wavExists = fs.existsSync(wavPath) && fs.statSync(wavPath).size > 44;
  item.txtPath = txtPath.replace(process.cwd() + path.sep, "").replace(/\\/g, "/");
  item.txtExists = fs.existsSync(txtPath);
  item.manifestEntry = !!(manifest.assets && manifest.assets[item.semanticKey]);

  // Determine auto-play policy
  if (item.category === "welcome") {
    item.autoPlayPolicy = "WELCOME_AFTER_UNLOCK";
  } else if (item.category === "story" || item.category === "instruction") {
    item.autoPlayPolicy = "MANUAL_ONLY";
  } else if (item.category === "prompt") {
    item.autoPlayPolicy = "QUESTION_ON_SCREEN_ENTRY";
  } else if (
    item.category.includes("feedback") ||
    item.category === "result"
  ) {
    item.autoPlayPolicy = "FEEDBACK_ON_RESULT";
  } else {
    item.autoPlayPolicy = "ANSWER_ON_SELECTION";
  }

  if (item.wavExists) {
    item.status = "REUSABLE";
  } else {
    item.status = "NEEDS_GENERATION";
  }

  if (!item.displayText || item.displayText.trim() === "") {
    item.status = "MISSING_TEXT";
  }
}

// Write JSON Report
const reportJsonPath = path.join(reportsDir, "student-audio-coverage.json");
fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, JSON.stringify(finalItems, null, 2), "utf-8");
console.log(`Saved student-audio-coverage.json to ${reportJsonPath}`);

// Write MD Report
const reportMdPath = path.join(reportsDir, "student-audio-coverage.md");
const mdContent = [
  "# Student Audio Coverage Audit Report",
  "",
  `Total semantic keys required: **${finalItems.length}**`,
  `Reusable assets (valid WAV exists): **${finalItems.filter((i) => i.status === "REUSABLE").length}**`,
  `Needs generation: **${finalItems.filter((i) => i.status === "NEEDS_GENERATION").length}**`,
  `Missing display text: **${finalItems.filter((i) => i.status === "MISSING_TEXT").length}**`,
  "",
  "## Required Audio Keys Table",
  "",
  "| Semantic Key | Type | Auto-Play Policy | TXT Exists | WAV Exists | Manifest | Status |",
  "|---|---|---|---|---|---|---|",
  ...finalItems.map(
    (i) =>
      `| \`${i.semanticKey}\` | \`${i.category}\` | \`${i.autoPlayPolicy}\` | ${i.txtExists ? "✔" : "✘"} | ${i.wavExists ? "✔" : "✘"} | ${i.manifestEntry ? "✔" : "✘"} | **${i.status}** |`,
  ),
].join("\n");
fs.writeFileSync(reportMdPath, mdContent, "utf-8");
console.log(`Saved student-audio-coverage.md to ${reportMdPath}`);
