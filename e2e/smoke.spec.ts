import { test, expect } from "@playwright/test";

test.describe("Arabic Adventures Smoke Tests", () => {
  test("Root HTML uses Arabic and RTL", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("Landing page renders title and CTA button", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("مغامرات العربية");
    await expect(page.locator("h1")).toContainText("اللغة العربية");
    const ctaButton = page.locator("text=ابدأ المغامرة الآن");
    await expect(ctaButton).toBeVisible();
  });

  test("Teacher and Admin portal coming-soon placeholders work", async ({ page }) => {
    await page.goto("/teacher");
    await expect(page.locator("h1")).toContainText("بوابة المعلم قريباً!");

    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText("لوحة الإدارة قريباً!");
  });

  test("Journey list renders dynamic SQLite database content", async ({ page }) => {
    await page.goto("/student/journeys");
    await expect(page.locator("h1")).toContainText("رحلاتك التعليمية المتاحة");
    
    await expect(page.locator("text=أسرار المعلم المصري القديم")).toBeVisible();
    await expect(page.locator("text=ملك القلوب")).toBeVisible();
    await expect(page.locator("text=جسدي أمانة")).toBeVisible();
  });

  test("Valid journey details page renders stages correctly", async ({ page }) => {
    await page.goto("/student/journeys/ancient-egyptian-teacher");
    await expect(page.locator("h1")).toContainText("أسرار المعلم المصري القديم");
    
    await expect(page.getByRole("heading", { name: "استعد", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "توقّع", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "راجع إنجازك", exact: true })).toBeVisible();
  });

  test("Invalid journey slug displays custom Arabic not found page", async ({ page }) => {
    await page.goto("/student/journeys/invalid-slug-123");
    await expect(page.locator("h1")).toContainText("لم نتمكن من العثور على هذه الصفحة");
    await expect(page.locator("text=الانتقال لرحلات التعلم")).toBeVisible();
  });

  test("API Health route returns OK", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toEqual({
      status: "ok",
      database: "connected",
    });
  });

  test("No horizontal overflow at 320px width", async ({ page }) => {
    const routes = [
      "/",
      "/student",
      "/student/journeys",
      "/student/journeys/ancient-egyptian-teacher",
      "/teacher",
      "/admin",
      "/student/journeys/invalid-slug-123"
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
