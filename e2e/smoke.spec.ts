import { test, expect } from "@playwright/test";

test.describe("Arabic Adventures Smoke Tests", () => {
  test("Root HTML uses Arabic and RTL", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("Landing page renders title and lesson cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("مغامرات العربية");
    await expect(page.locator("h1")).toContainText("اللغة العربية");
    
    // Exactly two lessons should be present
    await expect(page.locator("text=خبر عن المعلم المصري القديم")).toBeVisible();
    await expect(page.locator("text=حوار مع د. مجدي يعقوب")).toBeVisible();
    await expect(page.locator("text=جسدي أمانة")).not.toBeVisible();
  });

  test("Old portal routes redirect to home page", async ({ page }) => {
    const oldRoutes = ["/teacher", "/admin", "/student", "/student/journeys"];
    
    for (const route of oldRoutes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // Should redirect to home page
      await expect(page.locator("h1")).toContainText("اللغة العربية");
    }
  });

  test("Old journey routes redirect to new lesson routes", async ({ page }) => {
    // 1. Ancient Egyptian Teacher
    await page.goto("/journeys/ancient-egyptian-teacher");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/lessons\/ancient-egyptian-teacher$/);
    await expect(page.locator("h1")).toContainText("خبر عن المعلم المصري القديم");

    // 2. King of Hearts -> magdi-yacoub
    await page.goto("/journeys/king-of-hearts");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/lessons\/magdi-yacoub$/);
    await expect(page.locator("h1")).toContainText("حوار مع د. مجدي يعقوب");
  });

  test("Old play routes redirect to new play routes", async ({ page }) => {
    await page.goto("/journeys/ancient-egyptian-teacher/play/best-title-choice");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/lessons\/ancient-egyptian-teacher\/activities\/best-title-choice$/);
  });

  test("Valid lesson details page renders roadmap correctly", async ({ page }) => {
    await page.goto("/lessons/ancient-egyptian-teacher");
    await expect(page.locator("h1")).toContainText("خبر عن المعلم المصري القديم");
    await expect(page.locator("text=خريطة الطريق للدرس")).toBeVisible();
  });

  test("Invalid lesson slug returns custom Arabic 404 page", async ({ page }) => {
    const response = await page.goto("/lessons/invalid-slug-123");
    expect(response?.status()).toBe(404);
  });

  test("API Health route returns two-lesson metadata", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.experience).toBe("two-lessons");
    expect(body.publishedLessons).toBe(2);
    expect(body.lesson1Activities).toBe(19);
    expect(body.lesson2Activities).toBe(28);
    expect(body.totalPublicActivities).toBe(47);
  });

  test("No horizontal overflow at 320px width", async ({ page }) => {
    const routes = [
      "/",
      "/lessons/ancient-egyptian-teacher",
    ];

    await page.setViewportSize({ width: 320, height: 568 });

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = window.innerWidth;
        return { docWidth, viewWidth, overflow: docWidth > viewWidth };
      });

      expect(overflow.overflow).toBe(false);
    }
  });

  test("Keyboard navigation works", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const activeTagName = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(activeTagName).toBe("a");
  });
});
