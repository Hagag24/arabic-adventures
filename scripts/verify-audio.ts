import fs from "fs";
import path from "path";
import crypto from "crypto";

const MANIFEST_PATH = path.resolve("public/audio/approved/audio_manifest.json");
const AUDIO_DIR = path.resolve("public/audio/approved");

interface AudioManifestEntry {
  provider: string;
  providerVoiceId: string;
  locale: string;
  spokenText: string;
  durationSeconds: number;
  fileHash: string;
  generationVersion: string;
  status: string;
  filePath: string;
}

function computeHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

export function verifyAudioAssets() {
  console.log("Starting Audio Assets Verification...");

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Error: Audio manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifestContent = fs.readFileSync(MANIFEST_PATH, "utf8");
  let manifest: Record<string, AudioManifestEntry>;
  try {
    manifest = JSON.parse(manifestContent) as Record<
      string,
      AudioManifestEntry
    >;
  } catch (e) {
    console.error(
      `Error: Failed to parse audio manifest. ${(e as Error).message}`,
    );
    process.exit(1);
  }

  const keys = Object.keys(manifest);
  if (keys.length === 0) {
    console.error("Error: Audio manifest is empty.");
    process.exit(1);
  }

  let failed = false;

  for (const key of keys) {
    const asset = manifest[key];
    console.log(`Checking Audio Asset: [${key}]`);

    // Verify metadata presence
    type AudioManifestField = keyof AudioManifestEntry;
    const requiredMetadata: AudioManifestField[] = [
      "provider",
      "providerVoiceId",
      "locale",
      "spokenText",
      "durationSeconds",
      "fileHash",
      "generationVersion",
      "status",
      "filePath",
    ];

    for (const field of requiredMetadata) {
      const value = asset[field];
      if (value === undefined || value === null) {
        console.error(`  - Error: Missing required field [${field}]`);
        failed = true;
      }
    }

    if (asset.durationSeconds <= 0) {
      console.error(
        `  - Error: Duration is zero or negative: ${asset.durationSeconds}`,
      );
      failed = true;
    }

    if (asset.status !== "APPROVED") {
      console.error(
        `  - Error: Audio asset status is not APPROVED: ${asset.status}`,
      );
      failed = true;
    }

    // Verify file existence
    const fileName = path.basename(asset.filePath);
    const localFilePath = path.join(AUDIO_DIR, fileName);

    if (!fs.existsSync(localFilePath)) {
      console.error(
        `  - Error: Physical audio file not found at: ${localFilePath}`,
      );
      failed = true;
      continue;
    }

    // Verify file hash
    const actualHash = computeHash(localFilePath);
    if (actualHash !== asset.fileHash) {
      console.error(`  - Error: File hash mismatch!`);
      console.error(`    Expected: ${asset.fileHash}`);
      console.error(`    Got:      ${actualHash}`);
      failed = true;
    } else {
      console.log(
        `  - Success: File exists and SHA-256 hash matches: ${actualHash}`,
      );
    }
  }

  if (failed) {
    console.error("Audio assets verification FAILED.");
    process.exit(1);
  }

  console.log("Audio assets verification PASSED successfully!");
}

// Execute if run directly
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("scripts/verify-audio.ts")
) {
  verifyAudioAssets();
}
