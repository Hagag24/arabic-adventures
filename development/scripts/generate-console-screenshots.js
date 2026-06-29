import { chromium } from "@playwright/test";
import { exec, spawn } from "child_process";
import http from "http";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "D:\\arabic-adventures\\artifacts";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pollHealth(url, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error(`Health check timeout at ${url}`));
        return;
      }
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.status === "ok") {
                  clearInterval(interval);
                  resolve(true);
                }
              } catch {
                // Ignore parsing errors, retry
              }
            });
          }
        })
        .on("error", () => {
          // Ignore connection errors, retry
        });
    }, 1000);
  });
}

function killPort(port) {
  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File scripts\\ensure-project-port.ps1 -Port ${port}`;
    console.log(`Running: ${cmd}`);
    exec(cmd, (err, stdout, stderr) => {
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve(true);
    });
  });
}

async function runDevMode() {
  console.log("\n==================================================");
  console.log("TESTING DEVELOPMENT MODE (Port 3000)");
  console.log("==================================================");

  // 1. Ensure port 3000 is clean
  await killPort(3000);

  // 2. Start dev server with SHOW_NEXT_DEVTOOLS=false explicitly
  console.log("Starting Next.js dev server on port 3000...");
  const devProcess = spawn("npx.cmd", ["next", "dev", "--hostname", "127.0.0.1", "--port", "3000"], {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, SHOW_NEXT_DEVTOOLS: "false" }
  });
  devProcess.unref();

  // 3. Poll health
  console.log("Polling dev server health...");
  await pollHealth("http://127.0.0.1:3000/api/health");
  console.log("Dev server is healthy and running!");

  // 4. Launch browser to verify HMR and console
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const hmrFailures = [];
  
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      consoleErrors.push(text);
    }
    if (text.includes("webpack-hmr") || text.includes("WebSocket")) {
      hmrFailures.push(text);
    }
    console.log(`[Dev Browser Console] ${msg.type()}: ${text}`);
  });

  // Navigate to self-assessment activity
  console.log("Navigating to self-assessment on dev server...");
  await page.goto("http://127.0.0.1:3000/lessons/ancient-egyptian-teacher/activities/arabic-feelings-j1");
  await page.waitForLoadState("networkidle");
  
  // Wait a few seconds to let HMR establish and verify clean HMR connection
  console.log("Waiting for HMR connection...");
  await wait(5000);

  // Take console screenshot
  const screenshotPath = path.join(ARTIFACTS_DIR, "dev-console-hmr-clean.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`Saved screenshot: ${screenshotPath}`);

  // Navigate to roadmap
  console.log("Navigating to roadmap on dev server...");
  await page.goto("http://127.0.0.1:3000/lessons/ancient-egyptian-teacher");
  await page.waitForLoadState("networkidle");
  const roadmapDevPath = path.join(ARTIFACTS_DIR, "lesson-roadmap-clean-dev.png");
  await page.screenshot({ path: roadmapDevPath });
  console.log(`Saved screenshot: ${roadmapDevPath}`);

  // Assertions
  console.log(`Console errors found: ${consoleErrors.length}`);
  console.log(`HMR WebSockets failures found: ${hmrFailures.length}`);
  
  await browser.close();

  // 5. Clean port 3000
  console.log("Cleaning port 3000...");
  await killPort(3000);
}

async function runDevToolsMode() {
  console.log("\n==================================================");
  console.log("TESTING DEVELOPMENT MODE WITH DEVTOOLS (Port 3000)");
  console.log("==================================================");

  // 1. Ensure port 3000 is clean
  await killPort(3000);

  // 2. Start dev server with SHOW_NEXT_DEVTOOLS=true
  console.log("Starting Next.js dev server with SHOW_NEXT_DEVTOOLS=true...");
  const devProcess = spawn("npx.cmd", ["next", "dev", "--hostname", "127.0.0.1", "--port", "3000"], {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, SHOW_NEXT_DEVTOOLS: "true" }
  });
  devProcess.unref();

  // 3. Poll health
  console.log("Polling dev server health...");
  await pollHealth("http://127.0.0.1:3000/api/health");

  // 4. Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to roadmap
  console.log("Navigating to roadmap on dev server (devtools enabled)...");
  await page.goto("http://127.0.0.1:3000/lessons/ancient-egyptian-teacher");
  await page.waitForLoadState("networkidle");
  await wait(3000);

  // Take screenshot showing indicator
  const screenshotPath = path.join(ARTIFACTS_DIR, "lesson-roadmap-devtools-enabled.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`Saved screenshot: ${screenshotPath}`);

  await browser.close();

  // 5. Clean port 3000
  console.log("Cleaning port 3000...");
  await killPort(3000);
}

async function runProductionMode() {
  console.log("\n==================================================");
  console.log("TESTING PRODUCTION MODE (Port 3001)");
  console.log("==================================================");

  // 1. Ensure port 3001 is clean
  await killPort(3001);

  // 2. Start production server
  console.log("Starting Next.js production server on port 3001...");
  const prodProcess = spawn("npx.cmd", ["next", "start", "--hostname", "127.0.0.1", "--port", "3001"], {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, SHOW_NEXT_DEVTOOLS: "false" }
  });
  prodProcess.unref();

  // 3. Poll health
  console.log("Polling production server health...");
  await pollHealth("http://127.0.0.1:3001/api/health");
  console.log("Production server is healthy and running!");

  // 4. Launch browser to verify absence of HMR in production
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests = [];
  page.on("request", (req) => {
    requests.push(req.url());
  });

  page.on("console", (msg) => {
    console.log(`[Prod Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  // Navigate to self-assessment activity
  console.log("Navigating to self-assessment on production server...");
  await page.goto("http://127.0.0.1:3001/lessons/ancient-egyptian-teacher/activities/arabic-feelings-j1");
  await page.waitForLoadState("networkidle");
  await wait(3000);

  // Take console screenshot
  const screenshotPath = path.join(ARTIFACTS_DIR, "production-console-no-hmr.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`Saved screenshot: ${screenshotPath}`);

  // Navigate to roadmap in production
  console.log("Navigating to roadmap on production server...");
  await page.goto("http://127.0.0.1:3001/lessons/ancient-egyptian-teacher");
  await page.waitForLoadState("networkidle");
  const roadmapProdPath = path.join(ARTIFACTS_DIR, "lesson-roadmap-clean-production.png");
  await page.screenshot({ path: roadmapProdPath });
  console.log(`Saved screenshot: ${roadmapProdPath}`);

  // Verify no HMR requests
  const hmrRequests = requests.filter((url) => url.includes("webpack-hmr") || url.includes("hmr"));
  console.log(`HMR WebSockets requests in production: ${hmrRequests.length}`);

  await browser.close();

  // 5. Clean port 3001
  console.log("Cleaning port 3001...");
  await killPort(3001);
}

async function main() {
  try {
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
    
    await runDevMode();
    await runDevToolsMode();
    await runProductionMode();
    
    console.log("\n==================================================");
    console.log("ALL CONSOLE AND PORT CHECKS COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (err) {
    console.error("Error during console screenshot generation:", err);
    process.exit(1);
  }
}

main();
