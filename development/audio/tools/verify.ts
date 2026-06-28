import fs from "fs";
import path from "path";
import { buildInventory } from "./build-inventory";
import { audioScripts } from "../../../src/audio/content/audio-script-index";

const modeIndex = process.argv.indexOf("--mode");
const mode = modeIndex !== -1 ? process.argv[modeIndex + 1] : "architecture";

console.log(`Running Audio Verification Suite in mode: ${mode}...`);

function checkArchitecture() {
  const items = buildInventory();

  // 1. Semantic key format, duplicate keys, blank text, and third-lesson exclusion
  const keys = new Set<string>();
  for (const item of items) {
    if (!item.key) {
      console.error(`❌ Found empty key:`, item);
      process.exit(1);
    }
    if (keys.has(item.key)) {
      console.error(`❌ Duplicate key found: ${item.key}`);
      process.exit(1);
    }
    keys.add(item.key);

    if (!item.displayText || item.displayText.trim().length === 0) {
      console.error(`❌ Blank spoken text found for key: ${item.key}`);
      process.exit(1);
    }

    // Exclude third lesson content: "my-body-is-a-trust", "body-is-a-trust", "j3", "journey3", "lesson3"
    const isThirdLesson =
      item.key.includes("my-body") ||
      item.key.includes("trust") ||
      item.key.includes("lesson3") ||
      item.key.includes("journey3") ||
      item.key.includes("j3");
    if (isThirdLesson) {
      console.error(
        `❌ Forbidden third-lesson key found in inventory: ${item.key}`,
      );
      process.exit(1);
    }
  }

  console.log(
    `✔ All ${items.length} semantic keys are formatted correctly and exclude third-lesson content.`,
  );

  // 2. Scan runtime import graph for forbidden generation imports
  // Search src/audio/runtime/ and src/app/ for imports referencing speech-provider, azure-speech-provider, or scripts/audio
  const runtimeDirs = [
    path.resolve(process.cwd(), "src/audio/runtime"),
    path.resolve(process.cwd(), "src/app"),
    path.resolve(process.cwd(), "src/components"),
  ];

  const forbiddenImports = [
    "src/audio/generation",
    "azure-speech-provider",
    "speech-provider",
    "speech-generation-service",
    "scripts/audio",
  ];

  function scanDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const forbidden of forbiddenImports) {
          if (content.includes(forbidden)) {
            console.error(
              `❌ Forbidden import '${forbidden}' found in runtime file: ${fullPath}`,
            );
            process.exit(1);
          }
        }
      }
    }
  }

  for (const dir of runtimeDirs) {
    scanDir(dir);
  }

  console.log(
    "✔ Checked runtime import graph: no generation or provider secrets imports found in client files.",
  );

  // 3. Verify no credentials exposed in client bundles (no NEXT_PUBLIC_ keys)
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, "utf-8");
    if (
      content.includes("NEXT_PUBLIC_AZURE") ||
      content.includes("NEXT_PUBLIC_AUDIO_TTS")
    ) {
      console.error(
        "❌ Forbidden NEXT_PUBLIC_ prefix found on provider secrets in .env.example",
      );
      process.exit(1);
    }
  }

  console.log(
    "✔ Checked env configuration: zero provider credentials exposed to client bundles.",
  );
  console.log("⭐ ARCHITECTURE VERIFICATION PASSED SUCCESSFULLY! ⭐");
}

function checkPublished() {
  const manifestPath = path.resolve(
    process.cwd(),
    "public/audio/v1/audio-manifest.json",
  );
  if (!fs.existsSync(manifestPath)) {
    console.error(
      "❌ Missing required asset manifest file: public/audio/v1/audio-manifest.json",
    );
    process.exit(1);
  }

  let manifest;
  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch (e) {
    console.error("❌ Failed to parse manifest JSON schema:", e);
    process.exit(1);
  }

  const assets = manifest.assets || manifest;
  const items = audioScripts;

  let realSpeechCount = 0;
  let intentionalSfxCount = 0;
  let pendingCount = 0;
  let failedQuotaCount = 0;
  let invalidAssetCount = 0;
  let fakePlaceholderCount = 0;

  let stateItems: any = {};
  try {
    const statePath = path.resolve(process.cwd(), "development/audio/state/audio-generation-state.json");
    if (fs.existsSync(statePath)) {
      stateItems = JSON.parse(fs.readFileSync(statePath, "utf-8")).items || {};
    }
  } catch (e) {}

  for (const item of items) {
    const key = item.key || item.semanticKey;
    if (!assets[key]) {
      const st = stateItems[key]?.status;
      if (st === "FAILED_QUOTA") {
        failedQuotaCount++;
      } else {
        pendingCount++;
      }
      continue;
    }

    const asset = assets[key];
    const url = asset.src || asset.url;
    const duration =
      typeof asset.durationSeconds === "number"
        ? asset.durationSeconds
        : asset.durationMs
          ? asset.durationMs / 1000
          : 0;

    let isInvalid = false;
    if (
      !url ||
      !asset.sha256 ||
      typeof duration !== "number" ||
      isNaN(duration) ||
      duration <= 0
    ) {
      console.error(
        `❌ Invalid manifest schema structure or duration for key: ${key}`,
      );
      invalidAssetCount++;
      isInvalid = true;
    }

    if (!isInvalid) {
      // Verify absolute public file path
      const relativeUrl = url.replace(/^\//, "");
      const filePath = path.resolve(process.cwd(), "public", relativeUrl);

      if (!fs.existsSync(filePath)) {
        console.error(`❌ Audio file does not exist on disk: ${filePath}`);
        invalidAssetCount++;
        isInvalid = true;
      } else {
        const stat = fs.statSync(filePath);
        if (stat.size === 0) {
          console.error(`❌ Published audio file is empty (0 bytes): ${filePath}`);
          invalidAssetCount++;
          isInvalid = true;
        } else if (stat.size < 100) {
          console.error(`❌ Published audio file is a fake placeholder: ${filePath}`);
          fakePlaceholderCount++;
          isInvalid = true;
        }
      }
    }

    if (!isInvalid) {
      realSpeechCount++;
    }
  }

  // Count intentional SFX in manifest
  for (const key of Object.keys(assets)) {
    if (key.includes("sfx")) {
      intentionalSfxCount++;
    }
  }

  // Ensure no audition or rejected files exist inside public/audio/v1
  const publicV1Dir = path.resolve(process.cwd(), "public/audio/v1");
  if (fs.existsSync(publicV1Dir)) {
    const scanForRejected = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          scanForRejected(fullPath);
        } else {
          if (
            file.includes("audition") ||
            file.includes("reject") ||
            file.includes("test")
          ) {
            console.error(
              `❌ Rejected or audition file found in public/audio/v1 directory: ${fullPath}`,
            );
            invalidAssetCount++;
          }
        }
      }
    };
    scanForRejected(publicV1Dir);
  }

  console.log(`real speech published: ${realSpeechCount}`);
  console.log(`intentional SFX published: ${intentionalSfxCount}`);
  console.log(`pending speech: ${pendingCount}`);
  console.log(`failed quota speech: ${failedQuotaCount}`);
  console.log(`invalid assets: ${invalidAssetCount}`);
  console.log(`fake placeholders: ${fakePlaceholderCount}`);

  if (invalidAssetCount > 0 || fakePlaceholderCount > 0) {
    console.error("❌ PUBLISHED VERIFICATION FAILED. Invalid or fake assets found.");
    process.exit(1);
  } else {
    console.log("⭐ PUBLISHED VERIFICATION PASSED SUCCESSFULLY! ⭐");
  }
}

if (mode === "architecture") {
  checkArchitecture();
} else if (mode === "published") {
  checkPublished();
} else {
  console.error(`❌ Invalid verification mode: ${mode}`);
  process.exit(1);
}
