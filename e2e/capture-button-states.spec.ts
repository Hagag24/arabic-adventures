import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const UI_ART_DIR = "D:\\arabic-adventures\\artifacts\\audio\\ui";

const stateFileMap = {
  initializing: "audio-initializing.png",
  no_assets: "audio-no-assets.png",
  unlock_required: "audio-unlock-required.png",
  ready: "audio-ready.png",
  buffering: "audio-buffering.png",
  playing_instruction: "audio-reading-instruction.png",
  playing_prompt: "audio-reading-question.png",
  playing_option: "audio-reading-option.png",
  playing_correct_feedback: "audio-correct-feedback.png",
  playing_retry_feedback: "audio-retry-feedback.png",
  playing_completion: "audio-completion.png",
  switching: "audio-switching.png",
  paused: "audio-paused.png",
  muted: "audio-muted.png",
  dictation_active: "audio-dictation-active.png",
  recoverable_error: "audio-error.png",
};

test.describe("Audio Button Visual States Screenshot Captures", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(UI_ART_DIR)) {
      fs.mkdirSync(UI_ART_DIR, { recursive: true });
    }
  });

  test("Capture all 16 states and mobile state", async ({ context, page }) => {
    await context.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__AUDIO_TEST_HOOKS_ENABLED__ = true;
    });
    // Load the homepage with a fixed desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const toggleBtn = page.locator("button[data-state]");
    await expect(toggleBtn).toBeVisible();

    // Loop and capture each state using animations: "disabled" to avoid test timeouts on CSS animations
    for (const [state, fileName] of Object.entries(stateFileMap)) {
      await page.evaluate((s) => {
        window.dispatchEvent(new CustomEvent("audio-toggle-test-override", { detail: s }));
      }, state);

      // Brief wait to ensure styles apply
      await page.waitForTimeout(100);

      const screenshotPath = path.join(UI_ART_DIR, fileName);
      // Disable animations to capture state immediately without waiting for transition/keyframes stability
      await toggleBtn.screenshot({ path: screenshotPath, animations: "disabled" });
      console.log(`Saved screenshot: ${screenshotPath}`);
    }

    // Capture mobile viewport representation
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Set to ready state
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("audio-toggle-test-override", { detail: "ready" }));
    });
    await page.waitForTimeout(100);

    const mobilePath = path.join(UI_ART_DIR, "audio-mobile.png");
    // Disable animations to capture full mobile header layout immediately
    await header.screenshot({ path: mobilePath, animations: "disabled" });
    console.log(`Saved mobile viewport screenshot: ${mobilePath}`);
  });
});
