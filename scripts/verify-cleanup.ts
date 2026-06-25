import fs from "fs";
import path from "path";
import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

function checkFileNotExists(filePath: string) {
  const absPath = path.resolve(filePath);
  if (fs.existsSync(absPath)) {
    throw new Error(
      `Cleanup failed: File or directory [${filePath}] still exists!`,
    );
  }
}

async function verifyFileSystem() {
  console.log("Checking filesystem for obsolete files...");

  // 1. Check old journey route pages
  checkFileNotExists("src/app/journeys");

  // 2. Check student/teacher/admin source pages
  checkFileNotExists("src/app/student");
  checkFileNotExists("src/app/teacher");
  checkFileNotExists("src/app/admin");

  // 3. Check legacy 77-item workbook inventory
  checkFileNotExists("src/content/workbook-activity-inventory.ts");

  // 4. Check old seed builder file
  checkFileNotExists("src/content/activity-seed-builder.ts");

  // 5. Check obsolete audio placeholder
  checkFileNotExists("public/audio/approved/my-body-is-a-trust-main.mp3");

  // 6. Check obsolete scripts
  checkFileNotExists("scripts/generate-audio.js");
  checkFileNotExists("scripts/verify-audio.ts");

  console.log("✔ Filesystem contains 0 obsolete files.");
}

async function verifyDuplicates() {
  console.log("Checking for duplicate components or hooks...");

  // 1. Check for duplicate player client shells
  const findFiles = (dir: string, pattern: RegExp, fileList: string[] = []) => {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findFiles(filePath, pattern, fileList);
      } else if (pattern.test(file)) {
        fileList.push(filePath);
      }
    }
    return fileList;
  };

  const players = findFiles("src", /ActivityPlayerClient\.tsx$/);
  if (players.length > 1) {
    throw new Error(
      `Cleanup failed: Found duplicate ActivityPlayerClient components at:\n${players.join("\n")}`,
    );
  }
  console.log(`✔ Exactly 1 ActivityPlayerClient shell exists: ${players[0]}`);

  // 2. Check for duplicate microphone hooks or inline SpeechRecognition definitions
  const filesWithSpeech: string[] = [];
  const findSpeechRecognitionInFiles = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findSpeechRecognitionInFiles(filePath);
      } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        const content = fs.readFileSync(filePath, "utf-8");
        if (
          content.includes("webkitSpeechRecognition") ||
          content.includes("SpeechRecognition")
        ) {
          // Exclude the mock, migration files, and archive docs
          if (
            !filePath.includes("__tests__") &&
            !filePath.includes("archive")
          ) {
            filesWithSpeech.push(filePath);
          }
        }
      }
    }
  };

  findSpeechRecognitionInFiles("src");
  if (filesWithSpeech.length > 1) {
    throw new Error(
      `Cleanup failed: SpeechRecognition instantiated in multiple files:\n${filesWithSpeech.join("\n")}`,
    );
  }
  console.log(`✔ Exactly 1 microphone hook file found: ${filesWithSpeech[0]}`);
}

async function verifyDatabase() {
  console.log("Connecting to database for orphancy checks...");
  await prisma.$connect();

  // 1. Check active lessons
  const journeys = await prisma.journey.findMany();
  const activeSlugs = journeys.map((j) => j.slug);
  if (journeys.length !== 2) {
    throw new Error(
      `Cleanup failed: Expected exactly 2 active journeys, found ${journeys.length}`,
    );
  }
  if (
    !activeSlugs.includes("ancient-egyptian-teacher") ||
    !activeSlugs.includes("magdi-yacoub")
  ) {
    throw new Error(
      `Cleanup failed: Active journeys must be ancient-egyptian-teacher and magdi-yacoub`,
    );
  }

  // 2. Check active activities
  const activities = await prisma.activity.findMany();
  if (activities.length !== 47) {
    throw new Error(
      `Cleanup failed: Expected exactly 47 active activities, found ${activities.length}`,
    );
  }

  // 3. Orphancy check for options
  const optionOrphans = await prisma.activityOption.findMany({
    where: { activityId: { notIn: activities.map((a) => a.id) } },
  });
  if (optionOrphans.length > 0) {
    throw new Error(
      `Cleanup failed: Found ${optionOrphans.length} orphan activity options!`,
    );
  }

  // 4. Orphancy check for answer keys
  const answerKeyOrphans = await prisma.activityAnswerKey.findMany({
    where: { activityId: { notIn: activities.map((a) => a.id) } },
  });
  if (answerKeyOrphans.length > 0) {
    throw new Error(
      `Cleanup failed: Found ${answerKeyOrphans.length} orphan activity answer keys!`,
    );
  }

  // 5. Orphancy check for progress
  const progressOrphans = await prisma.activityProgress.findMany({
    where: { activityId: { notIn: activities.map((a) => a.id) } },
  });
  if (progressOrphans.length > 0) {
    throw new Error(
      `Cleanup failed: Found ${progressOrphans.length} orphan activity progress rows!`,
    );
  }

  // 6. Orphancy check for attempts
  const attemptOrphans = await prisma.activityAttempt.findMany({
    where: { activityId: { notIn: activities.map((a) => a.id) } },
  });
  if (attemptOrphans.length > 0) {
    throw new Error(
      `Cleanup failed: Found ${attemptOrphans.length} orphan activity attempts!`,
    );
  }

  // 7. Check that no third-lesson records remain
  const thirdLessonJourney = await prisma.journey.findFirst({
    where: { slug: "my-body-is-a-trust" },
  });
  if (thirdLessonJourney) {
    throw new Error(
      `Cleanup failed: Found active third lesson (my-body-is-a-trust) journey record!`,
    );
  }

  console.log(
    "✔ Database verification passed with 0 orphan records and exactly 47 active activities across 2 lessons.",
  );
}

async function main() {
  console.log("\n==================================================");
  console.log("Running Cleanup Verification Suite...");
  console.log("==================================================\n");

  try {
    await verifyFileSystem();
    await verifyDuplicates();
    await verifyDatabase();
    console.log("\n==================================================");
    console.log("✔ CLEANUP VERIFICATION PASSED SUCCESSFULLY!");
    console.log("==================================================\n");
  } catch (error: unknown) {
    console.error("\n❌ CLEANUP VERIFICATION FAILED:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
