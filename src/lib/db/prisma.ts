import "server-only";
import { createPrismaClient } from "@/lib/db/create-prisma-client";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";

// Global declaration for development hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Add error handling for database connection
let prismaInstance: ReturnType<typeof createPrismaClient>;

try {
  prismaInstance = globalForPrisma.prisma ?? createPrismaClient(dbUrl);
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  // Create a mock client for production fallback
  prismaInstance = createMockPrismaClient();
}

export const prisma = prismaInstance;

// Mock client for when database is not available
function createMockPrismaClient() {
  return {
    journey: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
    },
    journeyProgress: {
      findMany: async () => [],
      create: async () => null,
      update: async () => null,
      upsert: async () => null,
    },
    activityProgress: {
      findMany: async () => [],
      count: async () => 0,
      create: async () => null,
      update: async () => null,
    },
    activityAttempt: {
      findMany: async () => [],
      create: async () => null,
    },
    playerSession: {
      findUnique: async () => null,
      create: async () => null,
    },
  } as any;
}
