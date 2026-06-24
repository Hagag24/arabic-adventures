import { beforeEach, afterAll } from "vitest";
import { createPrismaClient } from "@/lib/db/create-prisma-client";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.includes("test.db")) {
  throw new Error(
    `CRITICAL: Automated tests must run on test.db. Current DATABASE_URL: ${dbUrl}`,
  );
}

const testPrisma = createPrismaClient(dbUrl);

export { testPrisma };

beforeEach(async () => {
  // Clean all records before each test to ensure test isolation
  await testPrisma.$executeRawUnsafe(`DELETE FROM "JourneyStage";`);
  await testPrisma.$executeRawUnsafe(`DELETE FROM "Journey";`);
});

afterAll(async () => {
  await testPrisma.$disconnect();
});
