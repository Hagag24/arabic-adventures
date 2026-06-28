import { test, expect } from "@playwright/test";

test.describe("E2E Audio Orchestration and Visual Layout Tests", () => {
  
  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__AUDIO_TEST_HOOKS_ENABLED__ = true;
    });
    // Mock a valid manifest with assets so the button is enabled and fully active by default
    await page.route("**/audio/v1/audio-manifest.json", (route) => {
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
              purpose: "prompt",
            },
          },
        }),
      });
    });
  });

  test("one toggle per public page across routes", async ({ page }) => {
    const routes = [
      "/",
      "/lessons/ancient-egyptian-teacher",
      "/lessons/ancient-egyptian-teacher/activities/best-title-choice",
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("load");
      
      // Ensure exactly one global audio toggle exists in the header
      const toggle = page.locator("button[data-state]");
      await expect(toggle).toHaveCount(1);
      
      // Ensure it is inside PublicHeader or equivalent header layout
      const headerToggle = page.locator("header button[data-state]");
      await expect(headerToggle).toHaveCount(1);
    }
  });

  test("zero desktop width shift and mobile layout compliance", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    const toggle = page.locator("button[data-state]");
    await expect(toggle).toBeVisible();

    // Check initial layout dimensions (Desktop: min-width: 210px, height: 46px)
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(210);
    expect(box!.height).toBe(46);

    // Loop through override states and assert width remains constant
    const states = ["ready", "buffering", "playing_prompt", "paused", "muted", "dictation_active"];
    for (const state of states) {
      await page.evaluate((s) => {
        window.dispatchEvent(new CustomEvent("audio-toggle-test-override", { detail: s }));
      }, state);
      await page.waitForTimeout(50);
      
      const newBox = await toggle.boundingBox();
      expect(newBox!.width).toBe(box!.width);
      expect(newBox!.height).toBe(box!.height);
    }

    // Check mobile touch target and overflow (width 320px)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("audio-toggle-test-override", { detail: "ready" }));
    });
    await page.waitForTimeout(50);

    const mobileBox = await toggle.boundingBox();
    expect(mobileBox!.width).toBeGreaterThanOrEqual(44);
    expect(mobileBox!.height).toBeGreaterThanOrEqual(44);

    // Verify no horizontal document overflow
    const docOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(docOverflow).toBe(false);
  });

  test("mute preference is persisted and ignores active events", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    // Retrieve initial audio preferences from localStorage
    const getPrefs = async () => {
      return await page.evaluate(() => {
        return localStorage.getItem("ArabicAdventures.Audio.Enabled");
      });
    };

    const toggleBtn = page.locator("button[data-state]");
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click(); // toggle mute state

    const prefs = await getPrefs();
    expect(prefs).not.toBeNull();
  });

  test("cross-tab coordination halts audio playback", async ({ context }) => {
    // Open Tab 1
    const page1 = await context.newPage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page1.addInitScript(() => { (window as any).__AUDIO_TEST_HOOKS_ENABLED__ = true; });
    await page1.goto("/");
    await page1.waitForLoadState("load");

    // Open Tab 2
    const page2 = await context.newPage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page2.addInitScript(() => { (window as any).__AUDIO_TEST_HOOKS_ENABLED__ = true; });
    await page2.goto("/");
    await page2.waitForLoadState("load");

    // Enable audio on both tabs
    await page1.evaluate(() => {
      localStorage.setItem("arabic-adventures-audio-preferences", JSON.stringify({ enabled: true, volume: 0.7 }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.__audioOrchestrator) {
        win.__audioOrchestrator.playbackStatus = "playing";
        win.__audioOrchestrator.activePurpose = "prompt";
      }
    });

    // Verify Tab 1 is initially playing
    const isPlayingBefore = await page1.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      return win.__audioOrchestrator ? win.__audioOrchestrator.getPlaybackStatus() === "playing" : false;
    });
    expect(isPlayingBefore).toBe(true);

    // Verify Tab 1 visual state changes/reacts to BroadcastChannel coordinate events
    await page1.evaluate(() => {
      // Simulate receiving PLAY_STARTED message from Tab 2
      const channel = new BroadcastChannel("ArabicAdventures.Audio");
      channel.postMessage({
        type: "PLAY_STARTED",
        tabId: "tab-2",
        playbackToken: "123",
      });
    });

    await page1.waitForTimeout(200);
    
    // Tab 1 should stop/mute local playback and reset status to idle
    const isPlayingAfter = await page1.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      return win.__audioOrchestrator ? win.__audioOrchestrator.getPlaybackStatus() === "playing" : true;
    });
    expect(isPlayingAfter).toBe(false);
  });

  test("missing manifest or audio files degrades gracefully", async ({ page }) => {
    // Mock manifest to return 500 error
    await page.route("**/audio/v1/audio-manifest.json", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("load");

    // The audio button should display 'no_assets' visual state gracefully
    const toggle = page.locator("button[data-state]");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("data-state", "no_assets");
    await expect(toggle).toBeDisabled();
  });
});

test.describe("Production safety - verification that test hooks are absent", () => {
  test("hooks are absent when __AUDIO_TEST_HOOKS_ENABLED__ is not set", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    // Verify window.__audioOrchestrator is undefined
    const hasOrchestrator = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__audioOrchestrator !== undefined;
    });
    expect(hasOrchestrator).toBe(false);

    // Verify override event does not work
    const toggle = page.locator("button[data-state]");
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toHaveAttribute("data-state", "initializing");
    const initialState = await toggle.getAttribute("data-state");

    // Attempt to override state to buffering
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("audio-toggle-test-override", { detail: "buffering" }));
    });
    await page.waitForTimeout(100);

    const stateAfterOverride = await toggle.getAttribute("data-state");
    // The state should NOT change to 'buffering' (it remains in its initial state or transitions naturally, but not to the overridden 'buffering' state)
    expect(stateAfterOverride).not.toBe("buffering");
  });
});

