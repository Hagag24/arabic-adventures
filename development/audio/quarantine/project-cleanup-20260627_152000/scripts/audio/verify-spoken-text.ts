import fs from "fs";
import path from "path";
import { AudioInventoryItem } from "../../src/audio/generation/generation-contracts";
import { validateSpokenTextIntegrity } from "../../src/audio/generation/spoken-text-preparation-service";

const INVENTORY_PATH = path.resolve(
  process.cwd(),
  "artifacts/audio/audio-inventory.json",
);
const REPORT_PATH = path.resolve(
  process.cwd(),
  "artifacts/audio/reports/spoken-text-integrity.json",
);

export function verifySpokenText(): void {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`Inventory file not found at: ${INVENTORY_PATH}`);
    return;
  }

  const items: AudioInventoryItem[] = JSON.parse(
    fs.readFileSync(INVENTORY_PATH, "utf-8"),
  );
  const report: Record<
    string,
    {
      isValid: boolean;
      mismatchReason?: string;
      displayText: string;
      spokenText: string;
    }
  > = {};

  let failCount = 0;

  for (const item of items) {
    const result = validateSpokenTextIntegrity(
      item.displayText,
      item.spokenText,
    );
    report[item.key] = {
      isValid: result.isValid,
      mismatchReason: result.mismatchReason,
      displayText: item.displayText,
      spokenText: item.spokenText,
    };

    if (!result.isValid) {
      failCount++;
      console.warn(
        `[INTEGRITY FAILURE] Key: ${item.key}\n  Display: ${item.displayText}\n  Spoken: ${item.spokenText}\n  Reason: ${result.mismatchReason}`,
      );
    }
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

  console.log(
    `Spoken text integrity check completed. Total items: ${items.length}, Failures: ${failCount}`,
  );
  if (failCount > 0) {
    console.error(
      `Integrity verification failed with ${failCount} mismatches. Check artifacts/audio/reports/spoken-text-integrity.json for details.`,
    );
  } else {
    console.log("All spoken text integrity checks passed successfully!");
  }
}

if (process.argv[1] && process.argv[1].endsWith("verify-spoken-text.ts")) {
  verifySpokenText();
}
