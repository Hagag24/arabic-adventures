import { chromium } from "@playwright/test";

async function verifyAudio() {
  console.log("Launching browser for verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("[AUDIO]")) {
      logs.push(msg.text());
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
    
    const originalPause = window.HTMLAudioElement.prototype.pause;
    window.HTMLAudioElement.prototype.pause = function() {
      const src = this.src;
      // @ts-expect-error - window.audioEvents is custom
      window.audioEvents.push({ event: "pause", src });
      console.log(`[AUDIO] PAUSE: ${src}`);
      return originalPause.call(this);
    };
  });

  try {
    console.log("Navigating to lesson...");
    await page.goto("http://localhost:3000/lessons/magdi-yacoub");
    
    console.log("Unlocking audio...");
    await page.waitForSelector("button:has-text('تشغيل الصوت')");
    await page.click("button:has-text('تشغيل الصوت')");
    await page.waitForTimeout(1000); // Wait for welcome audio
    
    // Activity 1: SelfAssessment (usually first)
    console.log("Starting Activity 1...");
    await page.locator("a[href*='/activities/']").first().click();
    await page.waitForTimeout(1000); // Wait for question audio

    console.log("Clicking answer...");
    await page.locator("div[role='button']").first().click();
    await page.waitForTimeout(1000); // Wait for answer audio
    
    console.log("Submitting...");
    await page.locator("button:has-text('تأكيد اختياري')").click();
    await page.waitForTimeout(1500); // Wait for feedback audio
    
    const feedbackText1 = await page.textContent(".animate-fade-in h3");
    console.log(`[EVIDENCE] SelfAssessment Feedback Text: ${feedbackText1}`);

    // Activity 2: Choice
    console.log("Moving to Activity 2 (Choice)...");
    await page.locator("a[href*='/activities/']").last().click(); // Next activity link
    await page.waitForTimeout(1000); // Wait for question audio

    console.log("Clicking answer...");
    await page.locator("div[role='button']").first().click();
    await page.waitForTimeout(1000); // Wait for answer audio
    
    console.log("Submitting...");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(1500); // Wait for feedback audio
    
    const feedbackText2 = await page.textContent(".animate-fade-in h3");
    console.log(`[EVIDENCE] Choice Feedback Text: ${feedbackText2}`);

    // Activity 3: Ordering
    console.log("Moving to Activity 3 (Ordering)...");
    await page.locator("a[href*='/activities/']").last().click();
    await page.waitForTimeout(1000); // Wait for question audio

    console.log("Clicking move up button...");
    await page.locator("button[title='تحريك لأعلى']").first().click();
    await page.waitForTimeout(1000); // Wait for answer audio
    
    console.log("Submitting...");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(1500); // Wait for feedback audio
    
    const feedbackText3 = await page.textContent(".animate-fade-in h3");
    console.log(`[EVIDENCE] Ordering Feedback Text: ${feedbackText3}`);

    // @ts-expect-error - window.audioEvents is custom
    const events = await page.evaluate(() => window.audioEvents) as Array<{ event: string, src: string }>;
    console.log("[EVIDENCE] Final Playback Events:");
    events.forEach(e => console.log(`${e.event}: ${e.src}`));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

verifyAudio().catch(console.error);
