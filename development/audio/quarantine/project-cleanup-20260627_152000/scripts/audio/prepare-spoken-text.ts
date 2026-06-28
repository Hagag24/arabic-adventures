import fs from "fs";
import path from "path";
import { AudioInventoryItem } from "../../src/audio/generation/generation-contracts";
import { expandNumbersInArabicText } from "../../src/audio/generation/spoken-text-preparation-service";
import { pronunciationDictionary } from "../../src/audio/pronunciation-dictionary";

const INVENTORY_PATH = path.resolve(
  process.cwd(),
  "artifacts/audio/audio-inventory.json",
);

export function prepareSpokenText(): void {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(
      `Inventory file not found at: ${INVENTORY_PATH}. Run build-inventory first.`,
    );
    return;
  }

  const items: AudioInventoryItem[] = JSON.parse(
    fs.readFileSync(INVENTORY_PATH, "utf-8"),
  );

  const updatedItems = items.map((item) => {
    // 1. Expand numbers in display text
    const spokenText = expandNumbersInArabicText(item.displayText);

    // 2. Apply pronunciation dictionary overrides to get fullyVocalizedText
    let fullyVocalizedText = spokenText;
    for (const [key, diacritized] of Object.entries(pronunciationDictionary)) {
      // Replace case-insensitively/diacritic-insensitively where appropriate
      const regex = new RegExp(key, "g");
      fullyVocalizedText = fullyVocalizedText.replace(regex, diacritized);
    }

    return {
      ...item,
      spokenText,
      fullyVocalizedText,
      generationStatus: "READY_FOR_GENERATION" as const,
    };
  });

  fs.writeFileSync(
    INVENTORY_PATH,
    JSON.stringify(updatedItems, null, 2),
    "utf-8",
  );
  console.log(
    `Processed spoken text and fully vocalized text for ${updatedItems.length} items.`,
  );
}

if (process.argv[1] && process.argv[1].endsWith("prepare-spoken-text.ts")) {
  prepareSpokenText();
}
