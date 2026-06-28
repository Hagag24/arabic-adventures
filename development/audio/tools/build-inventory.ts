import fs from "fs";
import path from "path";
import { allActivities } from "../../../src/content/lesson-activity-definitions";
import { AudioInventoryItem } from "../../../src/audio/generation/generation-contracts";
import { normalizeForLexicalComparison } from "../../../src/audio/generation/arabic-normalization";

export function buildInventory(): AudioInventoryItem[] {
  const inventory: AudioInventoryItem[] = [];

  for (const act of allActivities) {
    const lessonSlug =
      act.sourceLessonNumber === 1
        ? "ancient-egyptian-teacher"
        : "magdi-yacoub";

    // 1. Instruction
    if (act.instructionAudioKey && act.instruction) {
      inventory.push({
        key: act.instructionAudioKey,
        lessonSlug,
        activitySlug: act.slug,
        roundId: null,
        purpose: "instruction",
        displayText: act.instruction,
        spokenText: act.instruction,
        fullyVocalizedText: act.instruction,
        normalizedComparisonText: normalizeForLexicalComparison(
          act.instruction,
        ),
        deliveryStyle: "educational_msa_egyptian",
        pronunciationOverrides: [],
        generationStatus: "READY_FOR_GENERATION",
        approvedVoice: null,
        notes: null,
      });
    }

    // 2. Prompt
    if (act.promptAudioKey && act.prompt) {
      inventory.push({
        key: act.promptAudioKey,
        lessonSlug,
        activitySlug: act.slug,
        roundId: null,
        purpose: "prompt",
        displayText: act.prompt,
        spokenText: act.prompt,
        fullyVocalizedText: act.prompt,
        normalizedComparisonText: normalizeForLexicalComparison(act.prompt),
        deliveryStyle: "educational_msa_egyptian",
        pronunciationOverrides: [],
        generationStatus: "READY_FOR_GENERATION",
        approvedVoice: null,
        notes: null,
      });
    }

    // 3. Completion Feedback
    if (act.completionFeedbackAudioKey) {
      let defaultFeedback =
        "شكرًا لمشاركتك وتقييمك الرائع! يمكنك الانتقال إلى النشاط التالي.";
      if (act.type !== "self_assessment") {
        defaultFeedback = "ممتاز! لقد أكملت هذا النشاط بنجاح.";
      }
      inventory.push({
        key: act.completionFeedbackAudioKey,
        lessonSlug,
        activitySlug: act.slug,
        roundId: null,
        purpose: "completion_feedback",
        displayText: defaultFeedback,
        spokenText: defaultFeedback,
        fullyVocalizedText: defaultFeedback,
        normalizedComparisonText:
          normalizeForLexicalComparison(defaultFeedback),
        deliveryStyle: "warm_egyptian_feedback",
        pronunciationOverrides: [],
        generationStatus: "READY_FOR_GENERATION",
        approvedVoice: null,
        notes: null,
      });
    }

    // 4. Options
    if (act.options) {
      for (const opt of act.options) {
        if (opt.narrationKey && opt.label) {
          inventory.push({
            key: opt.narrationKey,
            lessonSlug,
            activitySlug: act.slug,
            roundId: null,
            purpose: "option",
            displayText: opt.label,
            spokenText: opt.label,
            fullyVocalizedText: opt.label,
            normalizedComparisonText: normalizeForLexicalComparison(opt.label),
            deliveryStyle: "calm_option",
            pronunciationOverrides: [],
            generationStatus: "READY_FOR_GENERATION",
            approvedVoice: null,
            notes: null,
          });
        }
      }
    }
  }

  // Deduplicate items by key
  const seen = new Set<string>();
  return inventory.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

if (process.argv[1] && process.argv[1].endsWith("build-inventory.ts")) {
  const items = buildInventory();
  console.log(
    `Extracted ${items.length} unique semantic keys from activity definitions.`,
  );
  const outputPath = path.resolve(
    process.cwd(),
    "artifacts/audio/audio-inventory.json",
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), "utf-8");
  console.log(`Saved inventory to ${outputPath}`);
}
