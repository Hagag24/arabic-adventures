import { test, expect } from "@playwright/test";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});
const prisma = new PrismaClient({ adapter });

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const ARTIFACTS_DIR = "D:\\arabic-adventures\\artifacts";

test.describe("Visual Evidence Collection", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
  });

  test("Journey 1 (ancient-egyptian-teacher) Visual Flows", async ({ page, context }) => {
    // 1. Home page screenshot
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-home.png") });

    // 2. Click on Journey 1 card & Roadmap screenshot
    await page.click("text=أسرار المعلم المصري القديم");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-roadmap.png") });

    // 3. Play choice activity - before selection
    await page.goto("/journeys/ancient-egyptian-teacher/play/best-title-choice");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-choice-before.png") });

    // 4. Incorrect Choice selection screenshot
    await page.click("#opt-opt1");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=محاولة جيدة");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-choice-incorrect.png") });

    // 5. Correct Choice selection & submission screenshot
    await page.click('button:has-text("حاول مجدداً")');
    await page.click("#opt-opt2");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=إجابة صحيحة");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-choice-correct.png") });

    // 6. Synonym matching screenshot
    await page.goto("/journeys/ancient-egyptian-teacher/play/synonym-matching");
    await page.waitForLoadState("networkidle");
    // Connect عالم to باحث
    await page.click("button:has-text('عالم')");
    await page.click("button:has-text('باحث')");
    // Connect مقبرة to مدفن
    await page.click("button:has-text('مقبرة')");
    await page.click("button:has-text('مدفن')");
    // Connect مهنة to حرفة
    await page.click("button:has-text('مهنة')");
    await page.click("button:has-text('حرفة')");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-matching.png") });

    // 7. Event ordering screenshot
    await page.goto("/journeys/ancient-egyptian-teacher/play/event-ordering");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-ordering.png") });

    // 8. Open text/questions screenshot
    await page.goto("/journeys/ancient-egyptian-teacher/play/student-questions");
    await page.waitForLoadState("networkidle");
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill("ما هو اسم هذا المعلم القديم؟");
    await inputs.nth(1).fill("أين تقع هذه المقبرة التاريخية؟");
    await inputs.nth(2).fill("لماذا تعد مهنة الكاتب مهنة عظيمة ومقدسة؟");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-open-answer.png") });

    // 9. Self assessment feelings screenshot
    await page.goto("/journeys/ancient-egyptian-teacher/play/arabic-feelings-j1");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-self-assessment.png") });

    // 10. Force complete Journey 1 in DB & capture results page
    const browserCookies = await context.cookies();
    const sessionCookie = browserCookies.find(c => c.name === "player_session_token");
    if (sessionCookie) {
      const hashed = hashToken(sessionCookie.value);
      const session = await prisma.playerSession.findUnique({
        where: { publicTokenHash: hashed }
      });
      if (session) {
        // Find all activities in Journey 1
        const journey = await prisma.journey.findFirst({
          where: { slug: "ancient-egyptian-teacher" },
          include: { activities: true }
        });
        if (journey) {
          for (const act of journey.activities) {
            await prisma.activityProgress.upsert({
              where: {
                playerSessionId_activityId: {
                  playerSessionId: session.id,
                  activityId: act.id
                }
              },
              create: {
                playerSessionId: session.id,
                activityId: act.id,
                status: "COMPLETED",
                completedAt: new Date()
              },
              update: {
                status: "COMPLETED",
                completedAt: new Date()
              }
            });
          }
        }
      }
    }

    await page.goto("/journeys/ancient-egyptian-teacher/result");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-result.png") });
  });

  test("Journey 2 (king-of-hearts) Visual Flows", async ({ page, context }) => {
    // Navigate to set session
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Roadmap
    await page.goto("/journeys/king-of-hearts");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-roadmap.png") });

    // 2. Ordering
    await page.goto("/journeys/king-of-hearts/play/yacoub-life-ordering");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-ordering.png") });

    // 3. Fill-in-the-blank
    await page.goto("/journeys/king-of-hearts/play/yacoub-return-year");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-fill-blank.png") });

    // 4. Problem-and-solution
    await page.goto("/journeys/king-of-hearts/play/yacoub-problem-solutions");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-problem-solution.png") });

    // 5. Story-builder
    await page.goto("/journeys/king-of-hearts/play/yacoub-humanitarian-project");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-story-builder.png") });

    // 6. Self-assessment
    await page.goto("/journeys/king-of-hearts/play/yacoub-praise-assessment");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-self-assessment.png") });

    // 7. Force complete Journey 2 in DB & results page
    const browserCookies = await context.cookies();
    const sessionCookie = browserCookies.find(c => c.name === "player_session_token");
    if (sessionCookie) {
      const hashed = hashToken(sessionCookie.value);
      const session = await prisma.playerSession.findUnique({
        where: { publicTokenHash: hashed }
      });
      if (session) {
        const journey = await prisma.journey.findFirst({
          where: { slug: "king-of-hearts" },
          include: { activities: true }
        });
        if (journey) {
          for (const act of journey.activities) {
            await prisma.activityProgress.upsert({
              where: {
                playerSessionId_activityId: {
                  playerSessionId: session.id,
                  activityId: act.id
                }
              },
              create: {
                playerSessionId: session.id,
                activityId: act.id,
                status: "COMPLETED",
                completedAt: new Date()
              },
              update: {
                status: "COMPLETED",
                completedAt: new Date()
              }
            });
          }
        }
      }
    }

    await page.goto("/journeys/king-of-hearts/result");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-result.png") });
  });

  test("Journey 3 (my-body-is-a-trust) Visual Flows", async ({ page, context }) => {
    // Navigate to set session
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Roadmap
    await page.goto("/journeys/my-body-is-a-trust");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-roadmap.png") });

    // 2. Choice
    await page.goto("/journeys/my-body-is-a-trust/play/safety-private-parts");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-choice.png") });

    // 3. Safe response
    await page.goto("/journeys/my-body-is-a-trust/play/safety-abuse-action");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-safe-response.png") });

    // 4. Word-bank
    await page.goto("/journeys/my-body-is-a-trust/play/safety-word-bank-fill");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-word-bank.png") });

    // 5. Open ending
    await page.goto("/journeys/my-body-is-a-trust/play/safety-alternative-ending");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-open-ending.png") });

    // 6. Self-assessment
    await page.goto("/journeys/my-body-is-a-trust/play/safety-arabic-feelings");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-self-assessment.png") });

    // 7. Force complete Journey 3 in DB & results page
    const browserCookies = await context.cookies();
    const sessionCookie = browserCookies.find(c => c.name === "player_session_token");
    if (sessionCookie) {
      const hashed = hashToken(sessionCookie.value);
      const session = await prisma.playerSession.findUnique({
        where: { publicTokenHash: hashed }
      });
      if (session) {
        const journey = await prisma.journey.findFirst({
          where: { slug: "my-body-is-a-trust" },
          include: { activities: true }
        });
        if (journey) {
          for (const act of journey.activities) {
            await prisma.activityProgress.upsert({
              where: {
                playerSessionId_activityId: {
                  playerSessionId: session.id,
                  activityId: act.id
                }
              },
              create: {
                playerSessionId: session.id,
                activityId: act.id,
                status: "COMPLETED",
                completedAt: new Date()
              },
              update: {
                status: "COMPLETED",
                completedAt: new Date()
              }
            });
          }
        }
      }
    }

    await page.goto("/journeys/my-body-is-a-trust/result");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey3-result.png") });
  });
});
