import { chromium } from "@playwright/test";

async function verifyRemaining() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.text().includes("[AUDIO]")) {
      console.log(msg.text());
    }
  });

  // Inject script to track audio play calls
  await page.addInitScript(() => {
    // @ts-expect-error - window.audioEvents is custom
    window.audioEvents = [];
    const originalPlay = window.HTMLAudioElement.prototype.play;
    window.HTMLAudioElement.prototype.play = async function() {
      const src = this.src;
      // @ts-expect-error - window.audioEvents is custom
      window.audioEvents.push({ event: "play", src });
      console.log(`[AUDIO] PLAY: ${src}`);
      return originalPlay.call(this);
    };
  });

  try {
    // Navigate to Ancient Egyptian Teacher
    console.log("Navigating to Ancient Egyptian Teacher lesson...");
    await page.goto("http://localhost:3000/lessons/ancient-egyptian-teacher");
    
    console.log("Unlocking audio...");
    await page.waitForSelector("button:has-text('تشغيل الصوت')");
    await page.click("button:has-text('تشغيل الصوت')");
    await page.waitForTimeout(1000); // Wait for welcome audio

    // 1. Test Matching Activity
    console.log("\n--- Testing Matching Activity ---");
    await page.goto("http://localhost:3000/lessons/ancient-egyptian-teacher/activities/synonym-matching");
    await page.waitForTimeout(1000); // Wait for question audio

    console.log("Clicking left matching option...");
    await page.locator("div[role='button']").first().click();
    await page.waitForTimeout(1000); // Wait for option audio

    console.log("Completing pairs...");
    // Just click through left & right options to pair them
    const buttons = await page.locator("div[role='button']").all();
    if (buttons.length >= 6) {
      // Pair 1
      await buttons[0].click();
      await page.waitForTimeout(200);
      await buttons[3].click();
      await page.waitForTimeout(200);
      // Pair 2
      await buttons[1].click();
      await page.waitForTimeout(200);
      await buttons[4].click();
      await page.waitForTimeout(200);
      // Pair 3
      await buttons[2].click();
      await page.waitForTimeout(200);
      await buttons[5].click();
      await page.waitForTimeout(500);
    }

    console.log("Submitting Matching...");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(2000); // Wait for SFX + Spoken feedback

    const matchFeedback = await page.textContent(".animate-fade-in h3");
    console.log(`[EVIDENCE] Matching Feedback Text: ${matchFeedback}`);

    // 2. Test Ordering Activity
    console.log("\n--- Testing Ordering Activity ---");
    await page.goto("http://localhost:3000/lessons/magdi-yacoub/activities/yacoub-stages-ordering");
    await page.waitForTimeout(1000); // Wait for question audio

    console.log("Clicking Move Up...");
    await page.locator("button[title='تحريك لأعلى']").nth(1).click();
    await page.waitForTimeout(1000); // Wait for option audio

    console.log("Submitting Ordering...");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(2000); // Wait for SFX + Spoken feedback

    const orderFeedback = await page.textContent(".animate-fade-in h3");
    console.log(`[EVIDENCE] Ordering Feedback Text: ${orderFeedback}`);

  } catch (err) {
    console.error("Test failed:", err);
    console.log("Current URL:", page.url());
    const html = await page.content();
    console.log("Page HTML preview:", html.substring(0, 1000));
    await page.screenshot({ path: "scripts/failure-screenshot.png" });
    console.log("Screenshot saved to scripts/failure-screenshot.png");
  } finally {
    await browser.close();
  }
}

verifyRemaining().catch(console.error);
