import fs from "fs";
import path from "path";
import { lesson1Activities } from "../../src/content/lesson-activity-definitions";

interface InventoryItem {
  key: string;
  text: string;
  purpose: string;
}

export function buildInventory(): InventoryItem[] {
  const inventory: InventoryItem[] = [];

  // Iterate lesson 1 activities
  for (const act of lesson1Activities) {
    if (act.instructionAudioKey && act.instruction) {
      inventory.push({
        key: act.instructionAudioKey,
        text: act.instruction,
        purpose: "instruction",
      });
    }
    if (act.promptAudioKey && act.prompt) {
      inventory.push({
        key: act.promptAudioKey,
        text: act.prompt,
        purpose: "prompt",
      });
    }
    if (act.completionFeedbackAudioKey && act.type === "self_assessment") {
      inventory.push({
        key: act.completionFeedbackAudioKey,
        text: "شكرًا لمشاركتك وتقييمك الرائع! يمكنك الانتقال إلى النشاط التالي.",
        purpose: "completionFeedback",
      });
    }
    if (act.options) {
      for (const opt of act.options) {
        if (opt.narrationKey && opt.label) {
          inventory.push({
            key: opt.narrationKey,
            text: opt.label,
            purpose: "option",
          });
        }
      }
    }
  }

  // Deduplicate items
  const seen = new Set<string>();
  return inventory.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

// If executed directly
if (
  import.meta.url
    .replace(/\\/g, "/")
    .endsWith(process.argv[1].replace(/\\/g, "/"))
) {
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
