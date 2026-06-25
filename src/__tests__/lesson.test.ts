import { describe, test, expect, beforeEach } from "vitest";
import { testPrisma } from "./setup";
import { getPublishedJourneys } from "@/server/repositories/journey-repository";
import {
  fetchPublishedJourneys,
  fetchJourneyBySlug,
} from "@/server/services/journey-service";
import { execSync } from "child_process";

async function runSeed() {
  execSync("pnpm exec tsx prisma/seed.ts", {
    env: {
      ...process.env,
      DATABASE_URL: "file:./data/test.db",
    },
  });
}

describe("Database Migration & Seeding Tests", () => {
  test("Seed creates exactly two PUBLISHED lessons", async () => {
    await runSeed();

    const journeys = await testPrisma.journey.findMany({
      include: {
        activities: {
          where: { isPublished: true },
        },
      },
    });
    expect(journeys.length).toBe(2);

    const lesson1 = journeys.find((j) => j.slug === "ancient-egyptian-teacher");
    expect(lesson1).not.toBeUndefined();
    expect(lesson1?.activities.length).toBe(19);

    const lesson2 = journeys.find((j) => j.slug === "magdi-yacoub");
    expect(lesson2).not.toBeUndefined();
    expect(lesson2?.activities.length).toBe(28);
  }, 60000);

  test("Seed is idempotent", async () => {
    // Seed first time
    await runSeed();
    // Seed second time
    await runSeed();

    const journeys = await testPrisma.journey.findMany({
      include: {
        activities: {
          where: { isPublished: true },
        },
      },
    });
    expect(journeys.length).toBe(2);

    const lesson1 = journeys.find((j) => j.slug === "ancient-egyptian-teacher");
    expect(lesson1?.activities.length).toBe(19);

    const lesson2 = journeys.find((j) => j.slug === "magdi-yacoub");
    expect(lesson2?.activities.length).toBe(28);
  }, 60000);
});

describe("Repository & Service Ordering and Filtering", () => {
  beforeEach(async () => {
    // Populate test database with known test journeys (Draft, Published, Archived)
    await testPrisma.journey.createMany({
      data: [
        {
          id: "j-published-2",
          slug: "pub-2",
          title: "Published 2",
          shortDescription: "desc",
          themeKey: "theme",
          achievementTitle: "achieve",
          estimatedMinutes: 20,
          status: "PUBLISHED",
          displayOrder: 2,
        },
        {
          id: "j-published-1",
          slug: "pub-1",
          title: "Published 1",
          shortDescription: "desc",
          themeKey: "theme",
          achievementTitle: "achieve",
          estimatedMinutes: 20,
          status: "PUBLISHED",
          displayOrder: 1,
        },
        {
          id: "j-draft",
          slug: "draft-slug",
          title: "Draft Journey",
          shortDescription: "desc",
          themeKey: "theme",
          achievementTitle: "achieve",
          estimatedMinutes: 20,
          status: "DRAFT",
          displayOrder: 3,
        },
        {
          id: "j-archived",
          slug: "archived-slug",
          title: "Archived Journey",
          shortDescription: "desc",
          themeKey: "theme",
          achievementTitle: "achieve",
          estimatedMinutes: 20,
          status: "ARCHIVED",
          displayOrder: 4,
        },
      ],
    });

    // Create default stage for pub-1
    await testPrisma.journeyStage.create({
      data: {
        id: "stage-1",
        journeyId: "j-published-1",
        slug: "main",
        title: "مراحل الدرس",
        shortDescription: "desc",
        displayOrder: 1,
      },
    });
  });

  test("Published journeys are returned in displayOrder and Draft/Archived are excluded", async () => {
    const journeys = await getPublishedJourneys();

    // Should exclude DRAFT and ARCHIVED, leaving only 2 journeys
    expect(journeys.length).toBe(2);

    expect(journeys[0].slug).toBe("pub-1");
    expect(journeys[1].slug).toBe("pub-2");
  });

  test("Service filters out Draft and Archived journeys from lists", async () => {
    const list = await fetchPublishedJourneys();
    expect(list.length).toBe(2);
    expect(list.map((j) => j.slug)).toContain("pub-1");
    expect(list.map((j) => j.slug)).toContain("pub-2");
    expect(list.map((j) => j.slug)).not.toContain("draft-slug");
    expect(list.map((j) => j.slug)).not.toContain("archived-slug");
  });

  test("Valid published journey slug works", async () => {
    const journey = await fetchJourneyBySlug("pub-1");
    expect(journey).not.toBeNull();
    expect(journey?.title).toBe("Published 1");
  });

  test("Invalid or unpublished journey slug returns null", async () => {
    const nonExistent = await fetchJourneyBySlug("non-existent");
    expect(nonExistent).toBeNull();

    const draftJourney = await fetchJourneyBySlug("draft-slug");
    expect(draftJourney).toBeNull();

    const archivedJourney = await fetchJourneyBySlug("archived-slug");
    expect(archivedJourney).toBeNull();
  });
});
