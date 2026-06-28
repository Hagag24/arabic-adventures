import { test, expect } from "@playwright/test";
import { exec, spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

const RESULTS_PATH = path.resolve(process.cwd(), "artifacts/audio/review/review-results.json");
const CATALOG_PATH = path.resolve(process.cwd(), "artifacts/audio/review/review-catalog.json");

let serverProcess: ChildProcess;
const PORT = 4175;
const HOST = "127.0.0.1";
const URL = `http://${HOST}:${PORT}`;

test.describe("Audition Review System E2E Tests", () => {
  test.describe.configure({ mode: "serial" });
  
  test.beforeAll(async () => {
    // Build catalog before starting server to ensure it exists
    exec("node node_modules/tsx/dist/cli.mjs scripts/audio/build-review.ts");
    
    // Start the local review server and wait for it to print "Review server running"
    await new Promise<void>((resolve, reject) => {
      serverProcess = spawn("node", ["node_modules/tsx/dist/cli.mjs", "scripts/audio/review-server.ts"]);
      
      let resolved = false;
      serverProcess.stdout?.on("data", (data) => {
        const str = data.toString();
        console.log(`[Server Stdout] ${str.trim()}`);
        if (str.includes("Review server running") && !resolved) {
          resolved = true;
          resolve();
        }
      });

      serverProcess.stderr?.on("data", (data) => {
        console.error(`[Server Stderr] ${data.toString().trim()}`);
      });

      serverProcess.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error("Timeout waiting for review server to start"));
        }
      }, 15000);
    });
  });

  test.afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  test("catalog schema validation and counts", () => {
    expect(fs.existsSync(CATALOG_PATH)).toBe(true);
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
    
    // 8 speech groups
    expect(catalog.speechGroups).toHaveLength(8);
    
    // 8 variants per speech group = 64 total speech candidates
    let totalSpeech = 0;
    const candidateIds = new Set<string>();
    for (const group of catalog.speechGroups) {
      expect(group.variants).toHaveLength(8);
      totalSpeech += group.variants.length;
      for (const v of group.variants) {
        candidateIds.add(v.candidateId);
        
        // Semantic key, voice, style must match the candidate ID
        expect(v.candidateId).toBe(`${group.semanticKey}::${v.voice}::${v.style}`);
        
        // MP3 is served for playback, WAV is NOT served for playback in catalog mp3ReviewPath
        expect(v.mp3ReviewPath.endsWith(".mp3")).toBe(true);
        expect(v.mp3ReviewPath.includes("masters")).toBe(false);
      }
    }
    
    expect(totalSpeech).toBe(64);
    // Unique candidate IDs (no duplicates)
    expect(candidateIds.size).toBe(64);
    
    // 5 sound effects
    expect(catalog.sfx).toHaveLength(5);
    for (const s of catalog.sfx) {
      expect(s.semanticKey.startsWith("sfx.")).toBe(true);
      expect(s.mp3ReviewPath.endsWith(".mp3")).toBe(true);
    }
  });

  test("review page loads correctly and displays correct statistics", async ({ page }) => {
    page.on("console", msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on("pageerror", err => console.error(`[Browser Error] ${err.message}`));
    await page.goto(URL);
    await page.waitForLoadState("load");

    // Title exists
    await expect(page.locator("h1")).toContainText("بوابة تقييم الأصوات");

    // 8 expandable phrase groups
    const groups = page.locator(".phrase-group");
    await expect(groups).toHaveCount(8);

    // Section 1 summary stats
    const statsBoxes = page.locator(".stat-box");
    await expect(statsBoxes.nth(0).locator(".stat-val")).toHaveText("8");
    await expect(statsBoxes.nth(1).locator(".stat-val")).toHaveText("4");
    await expect(statsBoxes.nth(2).locator(".stat-val")).toHaveText("2");
    await expect(statsBoxes.nth(3).locator(".stat-val")).toHaveText("64");

    // Section 3 SFX container is present
    const sfxCards = page.locator(".sfx-card");
    await expect(sfxCards).toHaveCount(5);
  });

  test("exclusivity of playback: starting one stops another", async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState("load");

    // Expand first phrase group
    await page.locator(".phrase-header").nth(0).click();

    // Click play on the first variant cell
    const cells = page.locator(".variant-cell");
    const play1 = cells.nth(0).locator(".play-control-btn");
    const play2 = cells.nth(1).locator(".play-control-btn");

    await play1.click();
    await expect(cells.nth(0)).toHaveClass(/playing/);
    await expect(play1).toHaveText("⏸");

    // Click play on the second variant cell
    await play2.click();
    
    // The first cell should stop playing, and second cell should start playing
    await expect(cells.nth(0)).not.toHaveClass(/playing/);
    await expect(play1).toHaveText("▶");
    await expect(cells.nth(1)).toHaveClass(/playing/);
    await expect(play2).toHaveText("⏸");
  });

  test("review voting updates review-results and survives server restart", async ({ page }) => {
    // Back up existing reviews
    let backupContent = "";
    if (fs.existsSync(RESULTS_PATH)) {
      backupContent = fs.readFileSync(RESULTS_PATH, "utf-8");
    }

    try {
      await page.goto(URL);
      await page.waitForLoadState("load");

      // Expand first phrase group
      await page.locator(".phrase-header").nth(0).click();

      // Check first cell's candidate ID
      const cell1 = page.locator(".variant-cell").nth(0);
      const approveBtn = cell1.locator(".vote-option-btn.approve");
      
      // Vote approve
      await approveBtn.click();
      await expect(approveBtn).toHaveClass(/selected/);
      
      // Write some notes
      const notesArea = cell1.locator(".notes-area");
      await notesArea.fill("Test E2E approval notes");
      
      // Check favorite
      const favBtn = cell1.locator(".fav-btn");
      await favBtn.click();
      await expect(favBtn).toHaveClass(/active/);

      // Wait a bit for the auto-save request to finish
      await page.waitForTimeout(1000);

      // Read file directly to verify save
      expect(fs.existsSync(RESULTS_PATH)).toBe(true);
      const reviews = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));
      
      // Look for first variant ID
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
      const firstId = catalog.speechGroups[0].variants[0].candidateId;
      
      expect(reviews[firstId]).toBeDefined();
      expect(reviews[firstId].status).toBe("APPROVED");
      expect(reviews[firstId].favorite).toBe(true);
      expect(reviews[firstId].notes).toBe("Test E2E approval notes");
      expect(reviews[firstId].source).toBe("HUMAN");

      // Restart the server
      serverProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await new Promise<void>((resolve, reject) => {
        serverProcess = spawn("node", ["node_modules/tsx/dist/cli.mjs", "scripts/audio/review-server.ts"]);
        
        let resolved = false;
        serverProcess.stdout?.on("data", (data) => {
          const str = data.toString();
          console.log(`[Server Restart Stdout] ${str.trim()}`);
          if (str.includes("Review server running") && !resolved) {
            resolved = true;
            resolve();
          }
        });

        serverProcess.stderr?.on("data", (data) => {
          console.error(`[Server Restart Stderr] ${data.toString().trim()}`);
        });

        serverProcess.on("error", (err) => {
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        });

        // Timeout after 15 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            reject(new Error("Timeout waiting for review server restart"));
          }
        }, 15000);
      });

      // Reload the page and expand
      await page.goto(URL);
      await page.waitForLoadState("load");
      await page.locator(".phrase-header").nth(0).click();

      // Assert status and notes are preserved in UI
      const reloadedCell = page.locator(".variant-cell").nth(0);
      await expect(reloadedCell.locator(".vote-option-btn.approve")).toHaveClass(/selected/);
      await expect(reloadedCell.locator(".fav-btn")).toHaveClass(/active/);
      expect(await reloadedCell.locator(".notes-area").inputValue()).toBe("Test E2E approval notes");

    } finally {
      // Restore reviews backup
      if (backupContent) {
        fs.writeFileSync(RESULTS_PATH, backupContent, "utf-8");
      }
    }
  });

});
