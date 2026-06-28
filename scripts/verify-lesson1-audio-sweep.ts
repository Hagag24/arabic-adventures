import { chromium, Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { lesson1Activities, ActivityDefinition } from "../src/content/lesson-activity-definitions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function interactWithScreen(page: Page, act: ActivityDefinition) {
  // 1. Fill all textareas
  const textareas = page.locator("textarea");
  const textareaCount = await textareas.count();
  for (let j = 0; j < textareaCount; j++) {
    if (await textareas.nth(j).isVisible()) {
      await textareas.nth(j).fill(`إجابة نموذجية للحقل رقم ${j + 1}`);
    }
  }

  // 2. Fill all text inputs
  const inputs = page.locator("input[type='text']");
  const inputCount = await inputs.count();
  for (let j = 0; j < inputCount; j++) {
    if (await inputs.nth(j).isVisible()) {
      await inputs.nth(j).fill(`إجابة رقم ${j + 1}`);
    }
  }

  // 3. Click option cards
  const options = page.locator("div[role='button']");
  const optionCount = await options.count();
  if (optionCount > 0) {
    const isMatching = act.type === "matching" || (await page.locator("p:has-text('يطابقه')").isVisible()) || (await page.locator("p:has-text('طابق')").isVisible());
    if (isMatching) {
      const half = Math.floor(optionCount / 2);
      for (let k = 0; k < half; k++) {
        await options.nth(k).click();
        await page.waitForTimeout(500);
        await options.nth(half + k).click();
        await page.waitForTimeout(500);
      }
    } else if (act.type === "self_assessment" || act.type === "single_choice" || (await page.locator("p:has-text('اختر')").isVisible())) {
      await options.nth(0).click();
      await page.waitForTimeout(500);
      if (optionCount > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(500);
      }
    } else {
      await options.nth(0).click();
      await page.waitForTimeout(500);
      if (optionCount > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(500);
      }
    }
  }

  // 4. Click reorder buttons if visible
  const upButtons = page.locator("button:has-text('▲')");
  const upCount = await upButtons.count();
  for (let j = 0; j < upCount; j++) {
    if (await upButtons.nth(j).isVisible() && await upButtons.nth(j).isEnabled()) {
      await upButtons.nth(j).click();
      await page.waitForTimeout(500);
    }
  }
  const downButtons = page.locator("button:has-text('▼')");
  const downCount = await downButtons.count();
  for (let j = 0; j < downCount; j++) {
    if (await downButtons.nth(j).isVisible() && await downButtons.nth(j).isEnabled()) {
      await downButtons.nth(j).click();
      await page.waitForTimeout(500);
    }
  }
}

async function runSweep() {
  console.log("Launching browser for Lesson 1 Audio Sweep...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const audioRequests: string[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/audio/v1/")) {
      audioRequests.push(url);
      console.log(`[AUDIO REQUEST] ${url}`);
    }
  });

  page.on("console", (msg) => {
    if (msg.text().startsWith("[")) {
      console.log(`[BROWSER LOG] ${msg.text()}`);
    }
  });

  const screensDiscovered = lesson1Activities.length;
  let screensVisited = 0;
  let screensPassed = 0;
  let screensFailed = 0;

  try {
    // 0. Reset session
    console.log("Resetting lesson session...");
    await page.request.post("http://localhost:3000/api/journeys/ancient-egyptian-teacher/restart");

    // 1. Go to the lesson start
    console.log("Navigating to Ancient Egyptian Teacher lesson...");
    await page.goto("http://localhost:3000/lessons/ancient-egyptian-teacher");
    await page.waitForTimeout(2000);

    // 2. Click unlock audio button
    console.log("Unlocking audio...");
    const unlockBtn = page.locator("button:has-text('تشغيل الصوت')").first();
    if (await unlockBtn.isVisible()) {
      await unlockBtn.click();
      await page.waitForTimeout(1500);
    }

    // 3. Start the first activity
    console.log("Starting first activity...");
    await page.locator("a[href*='/activities/']").first().click();
    await page.waitForTimeout(2000);

    for (let i = 0; i < lesson1Activities.length; i++) {
      const act = lesson1Activities[i];
      screensVisited++;
      console.log(`\n--- Visited Screen ${i + 1}/${lesson1Activities.length}: ${act.slug} (${act.type}) ---`);

      // Verify question autoplay
      const expectedQuestionKey = `ancient-egyptian-teacher-${act.slug}-prompt`;
      console.log(`Expecting question audio: ${expectedQuestionKey}`);
      await page.waitForTimeout(1000);

      // Interact with current screen/round
      await interactWithScreen(page, act);

      // Handle multi_round progression
      let nextRoundBtn = page.locator("button:has-text('الجولة التالية')");
      while (await nextRoundBtn.isVisible()) {
        if (await nextRoundBtn.isEnabled()) {
          console.log("Moving to next round...");
          await nextRoundBtn.click();
          await page.waitForTimeout(1500);
          await interactWithScreen(page, act);
        } else {
          // If it's disabled, maybe we need to interact again
          await interactWithScreen(page, act);
          if (await nextRoundBtn.isEnabled()) {
            await nextRoundBtn.click();
            await page.waitForTimeout(1500);
          } else {
            break;
          }
        }
        nextRoundBtn = page.locator("button:has-text('الجولة التالية')");
      }

      // 4. Click Submit
      const submitBtn = page.locator("main button").last();
      if (await submitBtn.isVisible() && await submitBtn.isEnabled()) {
        console.log("Submitting...");
        await submitBtn.click();
      }

      await page.waitForTimeout(2000); // Wait for feedback audio

      // Verify next button is visible and click it
      const nextBtn = page.locator("a:has-text('النشاط التالي'), a:has-text('إنهاء الدرس')");
      if (await nextBtn.isVisible()) {
        screensPassed++;
        console.log("Screen passed successfully!");
        await nextBtn.click();
        await page.waitForTimeout(2000);
      } else {
        screensFailed++;
        console.error("Screen failed: Next button not found!");
        break;
      }
    }

  } catch (err) {
    console.error("Error during sweep:", err);
    try {
      await page.screenshot({ path: path.join(__dirname, "../error-screenshot.png") });
      console.log("Saved error screenshot to error-screenshot.png");
    } catch (screenshotErr) {
      console.error("Failed to take screenshot:", screenshotErr);
    }
    screensFailed++;
  } finally {
    await browser.close();
    console.log("\n--- SWEEP SUMMARY ---");
    console.log(`screensDiscovered = ${screensDiscovered}`);
    console.log(`screensVisited = ${screensVisited}`);
    console.log(`screensPassed = ${screensPassed}`);
    console.log(`screensFailed = ${screensFailed}`);
    
    if (screensFailed > 0 || screensPassed !== screensDiscovered) {
      console.error("\n[SWEEP FAILED] Some screens did not pass!");
      process.exit(1);
    } else {
      console.log("\n[SWEEP PASSED] All 19 screens passed the browser audio sweep!");
      process.exit(0);
    }
  }
}

runSweep().catch(console.error);
