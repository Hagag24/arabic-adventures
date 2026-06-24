import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

async function verify() {
  console.log(`Verifying database at: ${dbUrl}`);

  // 1. Reachability
  await prisma.$connect();
  console.log("✔ Database is reachable.");

  // 2. Exactly three seeded journeys
  const journeys = await prisma.journey.findMany({
    include: { stages: true },
  });
  if (journeys.length !== 3) {
    throw new Error(
      `Expected exactly 3 journeys, but found ${journeys.length}`,
    );
  }
  console.log("✔ Exactly three journeys exist.");

  // 3. Expected stage counts (exactly 8 stages per journey)
  for (const journey of journeys) {
    if (journey.stages.length !== 8) {
      throw new Error(
        `Expected exactly 8 stages for journey '${journey.slug}', but found ${journey.stages.length}`,
      );
    }
  }
  console.log("✔ Expected stage counts are correct (8 per journey).");

  // 4. No duplicate journey slugs
  const slugs = journeys.map((j) => j.slug);
  const uniqueSlugs = new Set(slugs);
  if (slugs.length !== uniqueSlugs.size) {
    throw new Error("Duplicate journey slugs found.");
  }
  console.log("✔ No duplicate journey slugs exist.");

  // 5. No duplicate stage order within a journey
  for (const journey of journeys) {
    const orders = journey.stages.map((s) => s.displayOrder);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error(
        `Duplicate stage displayOrder found in journey '${journey.slug}'.`,
      );
    }

    const stageSlugs = journey.stages.map((s) => s.slug);
    const uniqueStageSlugs = new Set(stageSlugs);
    if (stageSlugs.length !== uniqueStageSlugs.size) {
      throw new Error(
        `Duplicate stage slug found in journey '${journey.slug}'.`,
      );
    }
  }
  console.log("✔ No duplicate stage order or slugs exist within journeys.");

  console.log("Database verification PASSED successfully!");
}

verify()
  .catch((err) => {
    console.error("❌ Database verification FAILED:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
