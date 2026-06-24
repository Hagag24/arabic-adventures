import { test, expect } from "@playwright/test";

test.describe("Arabic Adventures Smoke Tests", () => {
  test("Root HTML uses Arabic and RTL", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("Landing page renders title and journey cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("مغامرات العربية");
    await expect(page.locator("h1")).toContainText("اللغة العربية");
    
    await expect(page.locator("text=أسرار المعلم المصري القديم")).toBeVisible();
    await expect(page.locator("text=ملك القلوب")).toBeVisible();
    await expect(page.locator("text=جسدي أمانة")).toBeVisible();
  });

  test("Old routes redirect to home page", async ({ page }) => {
    const oldRoutes = ["/teacher", "/admin", "/student", "/student/journeys"];
    
    for (const route of oldRoutes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // Should redirect to home page
      await expect(page.locator("h1")).toContainText("اللغة العربية");
    }
  });

  test("Old student journey route redirects to new journey route", async ({ page }) => {
    await page.goto("/student/journeys/ancient-egyptian-teacher");
    await page.waitForLoadState("networkidle");
    // Should redirect to /journeys/ancient-egyptian-teacher
    await expect(page).toHaveURL(/\/journeys\/ancient-egyptian-teacher$/);
    await expect(page.locator("h1")).toContainText("أسرار المعلم المصري القديم");
  });

  test("Valid journey details page renders stages correctly", async ({ page }) => {
    await page.goto("/journeys/ancient-egyptian-teacher");
    await expect(page.locator("h1")).toContainText("أسرار المعلم المصري القديم");
    
    await expect(page.getByRole("heading", { name: "استعد", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "توقّع", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "راجع إنجازك", exact: true })).toBeVisible();
  });

  test("Invalid journey slug returns custom Arabic 404 page", async ({ page }) => {
    const response = await page.goto("/journeys/invalid-slug-123");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText(
      "لم نتمكن من العثور على هذه الصفحة",
    );
    await expect(page.locator("text=العودة إلى الصفحة الرئيسية")).toBeVisible();
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
      "/journeys/ancient-egyptian-teacher",
      "/journeys/invalid-slug-123"
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
