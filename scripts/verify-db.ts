import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

async function verify() {
  console.log(`\n==================================================`);
  console.log(`Verifying database at: ${dbUrl}`);
  console.log(`==================================================\n`);

  await prisma.$connect();
  console.log("✔ Database is reachable.");

  // 1. Lesson Counts
  const journeys = await prisma.journey.findMany({
    include: {
      activities: {
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const journeyCount = journeys.length;
  console.log(`Total Active Lessons in DB: ${journeyCount}`);
  if (journeyCount !== 2) {
    throw new Error(`Expected exactly 2 active lessons, found ${journeyCount}`);
  }

  const lesson1 = journeys.find((j) => j.slug === "ancient-egyptian-teacher");
  if (!lesson1) {
    throw new Error("Lesson 1 (ancient-egyptian-teacher) not found.");
  }
  console.log(`✔ Lesson 1 found.`);

  const lesson2 = journeys.find((j) => j.slug === "magdi-yacoub");
  if (!lesson2) {
    throw new Error("Lesson 2 (magdi-yacoub) not found.");
  }
  console.log(`✔ Lesson 2 found.`);

  // 2. Activity Counts
  const activities = await prisma.activity.findMany({
    include: { options: true, answerKey: true },
  });
  const totalActivityCount = activities.length;
  console.log(`Total Activities in DB: ${totalActivityCount}`);
  if (totalActivityCount !== 47) {
    throw new Error(
      `Expected exactly 47 total activities, found ${totalActivityCount}`,
    );
  }

  const l1Count = lesson1.activities.length;
  console.log(`Lesson 1 activities: ${l1Count}`);
  if (l1Count !== 19) {
    throw new Error(
      `Expected exactly 19 activities in Lesson 1, found ${l1Count}`,
    );
  }

  const l2Count = lesson2.activities.length;
  console.log(`Lesson 2 activities: ${l2Count}`);
  if (l2Count !== 28) {
    throw new Error(
      `Expected exactly 28 activities in Lesson 2, found ${l2Count}`,
    );
  }
  console.log(`✔ Activity counts match requirements: 19 + 28 = 47.`);

  // Verify third lesson is completely absent
  const j3Count = await prisma.journey.count({
    where: { slug: "my-body-is-a-trust" },
  });
  if (j3Count > 0) {
    throw new Error(
      "Found third lesson (my-body-is-a-trust) records in the database. Violates invariants!",
    );
  }
  console.log(`✔ 0 active third-lesson database records in DB.`);

  // 3. Mappings Verification
  console.log(`\n--- Verification of Source Mappings ---`);

  const nullSourceKeys = activities.filter((a) => !a.sourceKey);
  if (nullSourceKeys.length > 0) {
    throw new Error(
      `Found activities with null source keys: ${nullSourceKeys.map((a) => a.slug).join(", ")}`,
    );
  }
  console.log(`✔ Null source keys = 0`);

  const sourceKeys = activities.map((a) => a.sourceKey as string);
  const duplicateSourceKeys = sourceKeys.filter(
    (key, idx) => sourceKeys.indexOf(key) !== idx,
  );
  if (duplicateSourceKeys.length > 0) {
    throw new Error(
      `Duplicate source keys found: ${duplicateSourceKeys.join(", ")}`,
    );
  }
  console.log(`✔ Duplicate source keys = 0`);

  const pairs = activities.map(
    (a) => `${a.sourceLessonNumber}-${a.sourceActivityNumber}`,
  );
  const duplicatePairs = pairs.filter((p, idx) => pairs.indexOf(p) !== idx);
  if (duplicatePairs.length > 0) {
    throw new Error(
      `Duplicate lesson/activity number pairs found: ${duplicatePairs.join(", ")}`,
    );
  }
  console.log(`✔ Duplicate lesson/activity numbers = 0`);

  // 4. Invariants & Security Checks
  console.log(`\n--- Verification of Invariants ---`);

  // Check objective activities missing answer keys
  const objectiveTypes = [
    "single_choice",
    "matching",
    "ordering",
    "fill_in_the_blank",
    "word_bank",
  ];
  const objectiveMissingAnswerKey = activities.filter(
    (a) => a.isGraded && !a.answerKey && a.type !== "multi_round",
  );
  if (objectiveMissingAnswerKey.length > 0) {
    throw new Error(
      `Found ${objectiveMissingAnswerKey.length} objective activities missing answer keys: ${objectiveMissingAnswerKey.map((a) => a.slug).join(", ")}`,
    );
  }
  console.log(`✔ Objective activities have answer keys.`);

  // Check duplicate slugs within same journey
  const journeyActivitySlugs = activities.map(
    (a) => `${a.journeyId}/${a.slug}`,
  );
  const duplicateSlugs = journeyActivitySlugs.filter(
    (item, index) => journeyActivitySlugs.indexOf(item) !== index,
  );
  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Duplicate activity slugs within same journey found: ${duplicateSlugs.join(", ")}`,
    );
  }
  console.log(`✔ Duplicate activity slugs = 0.`);

  console.log(`\n==================================================`);
  console.log("✔ DATABASE VERIFICATION PASSED SUCCESSFULLY!");
  console.log(`==================================================\n`);
}

verify()
  .catch((err) => {
    console.error("\n❌ DATABASE VERIFICATION FAILED:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
