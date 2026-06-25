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

  test("Lesson 1 (ancient-egyptian-teacher) Visual Flows", async ({ page, context }) => {
    // 1. Home page screenshot
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-home.png") });

    // 2. Click on Lesson 1 card & Roadmap screenshot
    await page.click("text=خبر عن المعلم المصري القديم");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-roadmap.png") });

    // 3. Play choice activity - before selection
    await page.goto("/lessons/ancient-egyptian-teacher/activities/best-title-choice");
    await page.waitForLoadState("load");
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
    await page.goto("/lessons/ancient-egyptian-teacher/activities/synonym-matching");
    await page.waitForLoadState("load");
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
    await page.goto("/lessons/ancient-egyptian-teacher/activities/event-ordering");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-ordering.png") });

    // 8. Open text/questions screenshot
    await page.goto("/lessons/ancient-egyptian-teacher/activities/student-questions");
    await page.waitForLoadState("load");
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill("ما هو اسم هذا المعلم القديم؟");
    await inputs.nth(1).fill("أين تقع هذه المقبرة التاريخية؟");
    await inputs.nth(2).fill("لماذا تعد مهنة الكاتب مهنة عظيمة ومقدسة؟");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-open-answer.png") });

    // 9. Self assessment feelings flows and screenshots
    await page.goto("/lessons/ancient-egyptian-teacher/activities/arabic-feelings-j1");
    await page.waitForLoadState("load");

    // Verify page does not contain technical metadata
    const bodyTextBefore = await page.innerText("body");
    const technicalKeywords = ["self_regulation", "#self_regulation", "FULL_RESPONSE", "COMPLETION_ONLY", "sourceKey", "storagePolicy"];
    for (const keyword of technicalKeywords) {
      expect(bodyTextBefore).not.toContain(keyword);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-before-selection.png") });

    // Click the enthusiasm card (contains "أشعر بالحماس")
    const enthusiasmBtn = page.getByRole("button", { name: "أشعر بالحماس" });
    await enthusiasmBtn.click();
    await expect(enthusiasmBtn).toHaveAttribute("aria-pressed", "true");
    
    // Screenshot for enabled button state
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-selected.png") });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-button-enabled.png") });

    // Listen for the POST request to submit the activity
    const requestPromise = page.waitForRequest(req => 
      req.url().includes("/api/activities/submit") && req.method() === "POST"
    );
    const responsePromise = page.waitForResponse(res => 
      res.url().includes("/api/activities/submit") && res.status() === 200
    );

    // Click the confirmation button
    const confirmBtn = page.getByRole("button", { name: "تأكيد اختياري" });
    await confirmBtn.click();

    const requestObj = await requestPromise;
    await responsePromise;

    // Validate the request body
    const requestBody = requestObj.postDataJSON();
    expect(requestBody.responseData).toBeDefined();
    expect(requestBody.responseData.selectedKey).toBe("happy");
    
    const forbiddenKeys = ["score", "isCorrect", "skillTags", "storagePolicy", "sourceKey", "sourceActivityNumber", "answerKey", "correctOptionKey"];
    for (const key of forbiddenKeys) {
      expect(requestBody.responseData[key]).toBeUndefined();
      expect(requestBody[key]).toBeUndefined();
    }

    // Verify completion feedback appears
    await expect(page.locator("text=شكرًا لمشاركتك")).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-completed.png") });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-submitted.png") });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-network-success.png") });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-self-assessment.png") });

    // Test restoration after refresh
    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.locator("text=شكرًا لمشاركتك")).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "self-assessment-restored-after-refresh.png") });

    // Verify next button works
    const nextBtn = page.getByRole("link", { name: "النشاط التالي" });
    await nextBtn.click();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/\/lessons\/ancient-egyptian-teacher\/activities\/arabic-self-assessment$/);

    // 10. Force complete Lesson 1 in DB & capture results page
    const browserCookies = await context.cookies();
    const sessionCookie = browserCookies.find(c => c.name === "player_session_token");
    if (sessionCookie) {
      const hashed = hashToken(sessionCookie.value);
      const session = await prisma.playerSession.findUnique({
        where: { publicTokenHash: hashed }
      });
      if (session) {
        // Find all activities in Lesson 1
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

    await page.goto("/lessons/ancient-egyptian-teacher/result");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey1-result.png") });
  });

  test("Lesson 2 (magdi-yacoub) Visual Flows", async ({ page, context }) => {
    // Navigate to set session
    await page.goto("/");
    await page.waitForLoadState("load");

    // 1. Roadmap
    await page.goto("/lessons/magdi-yacoub");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-roadmap.png") });

    // 2. Ordering
    await page.goto("/lessons/magdi-yacoub/activities/yacoub-life-ordering");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-ordering.png") });

    // 3. Fill-in-the-blank
    await page.goto("/lessons/magdi-yacoub/activities/yacoub-return-year");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-fill-blank.png") });

    // 4. Problem-and-solution
    await page.goto("/lessons/magdi-yacoub/activities/yacoub-problem-solutions");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-problem-solution.png") });

    // 5. Story-builder
    await page.goto("/lessons/magdi-yacoub/activities/yacoub-humanitarian-project");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-story-builder.png") });

    // 6. Self-assessment
    await page.goto("/lessons/magdi-yacoub/activities/yacoub-praise-assessment");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-self-assessment.png") });

    // 7. Force complete Lesson 2 in DB & results page
    const browserCookies = await context.cookies();
    const sessionCookie = browserCookies.find(c => c.name === "player_session_token");
    if (sessionCookie) {
      const hashed = hashToken(sessionCookie.value);
      const session = await prisma.playerSession.findUnique({
        where: { publicTokenHash: hashed }
      });
      if (session) {
        const journey = await prisma.journey.findFirst({
          where: { slug: "magdi-yacoub" },
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

    await page.goto("/lessons/magdi-yacoub/result");
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "journey2-result.png") });
  });
});
