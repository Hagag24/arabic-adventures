import "server-only";
import { createPrismaClient } from "@/lib/db/create-prisma-client";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";

dotenv.config();

const defaultDbUrl = "file:./data/arabic-adventures.db";

function resolveDatabaseUrl(): string {
  const configuredUrl = process.env.DATABASE_URL || defaultDbUrl;
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

  if (!isVercel || configuredUrl !== defaultDbUrl) {
    return configuredUrl;
  }

  const sourcePath = path.join(process.cwd(), "data", "arabic-adventures.db");
  const targetPath = path.join(os.tmpdir(), "arabic-adventures.db");

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  return `file:${targetPath}`;
}

const dbUrl = resolveDatabaseUrl();

// Global declaration for development hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient(dbUrl);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
