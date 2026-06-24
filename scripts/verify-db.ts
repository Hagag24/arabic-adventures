import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";
import { workbookActivityInventory } from "../src/content/workbook-activity-inventory";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

async function verify() {
  console.log(`\n==================================================`);
  console.log(`Verifying database at: ${dbUrl}`);
  console.log(`==================================================\n`);

  await prisma.$connect();
  console.log("✔ Database is reachable.");

  // 1. Journey and Stage Counts
  const journeys = await prisma.journey.findMany({
    include: { stages: { include: { activities: true } }, activities: true },
  });

  const journeyCount = journeys.length;
  console.log(`Total Journeys: ${journeyCount}`);
  if (journeyCount !== 3) {
    throw new Error(`Expected exactly 3 journeys, found ${journeyCount}`);
  }

  let totalStages = 0;
  for (const j of journeys) {
    totalStages += j.stages.length;
    if (j.stages.length !== 8) {
      throw new Error(
        `Journey [${j.slug}] does not have exactly 8 stages (found ${j.stages.length})`,
      );
    }
  }
  console.log(`Total Stages: ${totalStages} (8 per journey ✔)`);

  // 2. Activity Counts
  const activities = await prisma.activity.findMany({
    include: { options: true, answerKey: true },
  });
  const totalActivityCount = activities.length;
  console.log(`Total Activities in DB: ${totalActivityCount}`);

  // Report counts per journey
  console.log("\n--- Activities per Journey ---");
  for (const j of journeys) {
    console.log(
      `- Journey [${j.slug}] (${j.title}): ${j.activities.length} activities`,
    );
  }

  // Report counts per stage
  console.log("\n--- Activities per Stage ---");
  for (const j of journeys) {
    console.log(`Journey: [${j.slug}]`);
    for (const s of j.stages) {
      console.log(
        `  - Stage [${s.slug}] (${s.title}): ${s.activities.length} activities`,
      );
    }
  }

  const publishedCount = activities.filter((a) => a.isPublished).length;
  const objectiveCount = activities.filter((a) => a.isGraded).length;
  const openCount = activities.filter((a) => !a.isGraded).length;
  const selfAssessmentCount = activities.filter(
    (a) => a.type === "self_assessment",
  ).length;
  const answerKeyCount = activities.filter((a) => a.answerKey !== null).length;

  console.log(`\n--- Activity Breakdown ---`);
  console.log(`- Published Activities: ${publishedCount}`);
  console.log(`- Objective (Graded) Activities: ${objectiveCount}`);
  console.log(`- Open (Ungraded) Activities: ${openCount}`);
  console.log(`- Self-Assessment Activities: ${selfAssessmentCount}`);
  console.log(`- Answer Keys in DB: ${answerKeyCount}`);

  // 3. Invariants & Security Checks
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
    (a) => a.isGraded && !a.answerKey,
  );
  console.log(
    `- Objective activities missing answer keys: ${objectiveMissingAnswerKey.length}`,
  );
  if (objectiveMissingAnswerKey.length > 0) {
    throw new Error(
      `Found ${objectiveMissingAnswerKey.length} objective activities missing answer keys: ${objectiveMissingAnswerKey.map((a) => a.slug).join(", ")}`,
    );
  }

  // Check open activities incorrectly marked graded
  const openIncorrectlyGraded = activities.filter(
    (a) => !objectiveTypes.includes(a.type) && a.isGraded,
  );
  console.log(
    `- Open activities incorrectly marked graded: ${openIncorrectlyGraded.length}`,
  );
  if (openIncorrectlyGraded.length > 0) {
    throw new Error(
      `Found ${openIncorrectlyGraded.length} open activities marked graded: ${openIncorrectlyGraded.map((a) => a.slug).join(", ")}`,
    );
  }

  // Check activities missing sourceItemKey
  const missingSourceItemKey = activities.filter((a) => !a.sourceItemKey);
  console.log(
    `- Activities missing sourceItemKey: ${missingSourceItemKey.length}`,
  );
  if (missingSourceItemKey.length > 0) {
    throw new Error(
      `Found activities missing sourceItemKey: ${missingSourceItemKey.map((a) => a.slug).join(", ")}`,
    );
  }

  // Check duplicate sourceItemKey
  const sourceKeys = activities.map((a) => a.sourceItemKey);
  const duplicateSourceKeys = sourceKeys.filter(
    (item, index) => sourceKeys.indexOf(item) !== index,
  );
  console.log(`- Duplicate sourceItemKey: ${duplicateSourceKeys.length}`);
  if (duplicateSourceKeys.length > 0) {
    throw new Error(
      `Duplicate sourceItemKeys found: ${Array.from(new Set(duplicateSourceKeys)).join(", ")}`,
    );
  }

  // Check duplicate journey/activity slug
  const journeyActivitySlugs = activities.map(
    (a) => `${a.journeyId}/${a.slug}`,
  );
  const duplicateSlugs = journeyActivitySlugs.filter(
    (item, index) => journeyActivitySlugs.indexOf(item) !== index,
  );
  console.log(`- Duplicate journey/activity slugs: ${duplicateSlugs.length}`);
  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Duplicate activity slugs within same journey found: ${duplicateSlugs.join(", ")}`,
    );
  }

  // Check duplicate activity display order within a stage
  for (const j of journeys) {
    for (const s of j.stages) {
      const orders = s.activities.map((a) => a.displayOrder);
      const duplicateOrders = orders.filter(
        (item, index) => orders.indexOf(item) !== index,
      );
      if (duplicateOrders.length > 0) {
        throw new Error(
          `Duplicate activity displayOrder found in Stage [${s.slug}] of Journey [${j.slug}]: ${duplicateOrders.join(", ")}`,
        );
      }
    }
  }
  console.log("- Duplicate stage & activity display orders: 0 ✔");

  // Check activities missing narration keys
  const activitiesMissingNarration = activities.filter((a) => {
    if (!a.instructionNarrationKey) return true;
    if (a.prompt && !a.promptNarrationKey) return true;
    if (
      a.isGraded &&
      (!a.correctFeedbackNarrationKey || !a.incorrectFeedbackNarrationKey)
    )
      return true;
    if (!a.completionFeedbackNarrationKey) return true;

    // Check option narration keys
    const optionMissingNarration = a.options.some((opt) => !opt.narrationKey);
    if (optionMissingNarration) return true;

    return false;
  });
  console.log(
    `- Activities or options missing narration keys: ${activitiesMissingNarration.length}`,
  );
  if (activitiesMissingNarration.length > 0) {
    throw new Error(
      `Found ${activitiesMissingNarration.length} activities/options missing narration keys: ${activitiesMissingNarration.map((a) => a.slug).join(", ")}`,
    );
  }

  // Journey 3 counts by storage policy
  const j3 = journeys.find((j) => j.slug === "my-body-is-a-trust");
  if (!j3) {
    throw new Error("Journey 3 (my-body-is-a-trust) not found in DB.");
  }
  const j3Activities = activities.filter((a) => a.journeyId === j3.id);
  const j3FullResponse = j3Activities.filter(
    (a) => a.storagePolicy === "FULL_RESPONSE",
  );
  const j3ObjResultOnly = j3Activities.filter(
    (a) => a.storagePolicy === "OBJECTIVE_RESULT_ONLY",
  );
  const j3CompletionOnly = j3Activities.filter(
    (a) => a.storagePolicy === "COMPLETION_ONLY",
  );
  const j3NoPersistence = j3Activities.filter(
    (a) => a.storagePolicy === "NO_PERSISTENCE",
  );

  console.log(`\n- Journey 3 Activities: ${j3Activities.length}`);
  console.log(`  - FULL_RESPONSE count: ${j3FullResponse.length}`);
  console.log(`  - OBJECTIVE_RESULT_ONLY count: ${j3ObjResultOnly.length}`);
  console.log(`  - COMPLETION_ONLY count: ${j3CompletionOnly.length}`);
  console.log(`  - NO_PERSISTENCE count: ${j3NoPersistence.length}`);

  // Journey 3 safety policy validation: No FULL_RESPONSE allowed
  if (j3FullResponse.length > 0) {
    throw new Error(
      `Journey 3 contains ${j3FullResponse.length} activities with FULL_RESPONSE policy (violates privacy gates!): ${j3FullResponse.map((a) => a.slug).join(", ")}`,
    );
  }
  console.log(
    `✔ Journey 3 privacy and storage policy constraints validated successfully.`,
  );

  // 4. Reconcile with Workbook Activity Inventory
  console.log(`\n--- Workbook Inventory Reconciliation ---`);
  const totalWorkbookItems = workbookActivityInventory.length;
  console.log(`Total source inventory items: ${totalWorkbookItems}`);

  const implementedCount = workbookActivityInventory.filter(
    (i) => i.implementationStatus === "IMPLEMENTED",
  ).length;
  const reviewCount = workbookActivityInventory.filter(
    (i) => i.implementationStatus === "REVIEW_ACTIVITY",
  ).length;
  const mergedCount = workbookActivityInventory.filter(
    (i) => i.implementationStatus === "MERGED_WITH_REASON",
  ).length;
  const blockedCount = workbookActivityInventory.filter(
    (i) => i.implementationStatus === "BLOCKED_CONTENT_REVIEW",
  ).length;

  console.log(`- Implemented: ${implementedCount}`);
  console.log(`- Review: ${reviewCount}`);
  console.log(`- Merged: ${mergedCount}`);
  console.log(`- Blocked: ${blockedCount}`);

  const calculatedTotal =
    implementedCount + reviewCount + mergedCount + blockedCount;
  console.log(`- Calculated Total: ${calculatedTotal}`);
  if (calculatedTotal !== totalWorkbookItems) {
    throw new Error(
      `Workbook status inventory counts do not add up to total. ${calculatedTotal} !== ${totalWorkbookItems}`,
    );
  }
  console.log(
    `✔ Inventory status totals reconcile successfully (Implemented + Review + Merged + Blocked = Total).`,
  );

  // Inventory mapping counts
  const dbSourceKeys = new Set(
    activities.filter((a) => a.isPublished).map((a) => a.sourceItemKey),
  );
  const inventoryKeys = workbookActivityInventory.map((i) => i.sourceItemKey);

  const mappedCount = inventoryKeys.filter((k) => dbSourceKeys.has(k)).length;
  const unmappedCount = inventoryKeys.filter(
    (k) => !dbSourceKeys.has(k),
  ).length;
  const inventedPublished = activities.filter(
    (a) => a.isPublished && !inventoryKeys.includes(a.sourceItemKey || ""),
  ).length;

  console.log(`- Inventory mapped count: ${mappedCount}`);
  console.log(`- Inventory unmapped count: ${unmappedCount}`);
  console.log(`- Invented published activities in DB: ${inventedPublished}`);

  if (unmappedCount > 0) {
    throw new Error(
      `Found ${unmappedCount} unmapped inventory items not present in the DB.`,
    );
  }
  if (inventedPublished > 0) {
    throw new Error(
      `Found ${inventedPublished} invented published activities in the DB.`,
    );
  }
  console.log(`✔ Zero unmapped or invented published activities exist in DB.`);

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
