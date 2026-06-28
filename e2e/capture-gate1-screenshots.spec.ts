import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUDIO_ART_DIR = "D:\\arabic-adventures\\artifacts\\audio";

test.describe("Gate 1 Audio & Dictation Screenshot Capture", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(AUDIO_ART_DIR)) {
      fs.mkdirSync(AUDIO_ART_DIR, { recursive: true });
    }
  });

  test("1. Unavailable state screenshot", async ({ page }) => {
    // Mock audio manifest 404 to trigger unavailable state
    await page.route("**/audio/v1/audio-manifest.json", route => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Manifest not found" }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("load");

    // Capture global-audio-unavailable screenshot
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "global-audio-unavailable.png") });
  });

  test("2. Enabled, Muted, and Mobile states screenshots", async ({ page }) => {
    // Mock valid manifest with a dummy asset to activate toggle states
    await page.route("**/audio/v1/audio-manifest.json", route => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          version: "1.0",
          assets: {
            "global.welcome.01": {
              url: "/audio/v1/welcome.mp3",
              sha256: "dummy-hash-welcome",
              durationMs: 1500,
              purpose: "welcome",
            },
            "dummy-key": {
              url: "/audio/v1/dummy.mp3",
              sha256: "dummy-hash",
              durationMs: 1500,
            },
          },
        }),
      });
    });

    // Go to homepage with full-width desktop layout
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    // Click the toggle once (which turns it on)
    const toggleBtn = page.locator("button:has-text('الصوت')");
    await toggleBtn.click();
    await page.waitForTimeout(500); // Wait for transition animation
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "global-audio-enabled.png") });

    // Click again to mute
    await toggleBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "global-audio-muted.png") });

    // Switch to mobile viewport and take screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "global-audio-mobile.png") });
  });

  test("3. Dictation states screenshots", async ({ page }) => {
    // Mock SpeechRecognition API
    await page.addInitScript(() => {
      class MockSpeechRecognition {
        continuous = false;
        interimResults = false;
        lang = "ar-EG";
        onstart: (() => void) | null = null;
        onresult: ((event: unknown) => void) | null = null;
        onerror: ((event: unknown) => void) | null = null;
        onend: (() => void) | null = null;

        start() {
          if (this.onstart) this.onstart();
          // Simulate speech detection after delay
          setTimeout(() => {
            if (this.onresult) {
              const event = {
                results: [
                  [
                    { transcript: "هذه إجابة مكتوبة بالإملاء الصوتي" }
                  ]
                ]
              };
              this.onresult(event);
            }
            if (this.onend) this.onend();
          }, 800);
        }
        stop() {
          if (this.onend) this.onend();
        }
        abort() {
          if (this.onend) this.onend();
        }
      }
      (window as unknown as Record<string, unknown>).SpeechRecognition = MockSpeechRecognition;
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition = MockSpeechRecognition;
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/lessons/ancient-egyptian-teacher/activities/student-questions");
    await page.waitForSelector("button:has-text('إملاء صوّتي')");

    // 1. Dictatable field idle screenshot
    const firstMicBtn = page.locator("button:has-text('إملاء صوّتي')").first();
    await expect(firstMicBtn).toBeVisible();
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "dictatable-field-idle.png") });

    // 2. Click the mic button to trigger listening state
    await firstMicBtn.click();
    await page.waitForTimeout(300); // Wait for listening state to toggle
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "dictatable-field-listening.png") });

    // 3. Wait for mock recognition result and transcript insertion
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "dictatable-field-transcript.png") });

    // 4. Three answers dictation renderer overview screenshot
    await page.screenshot({ path: path.join(AUDIO_ART_DIR, "three-answer-dictation.png") });
  });
});
