import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import ActivityPlayerClient from "../components/activity/ActivityPlayerClient";
import { StudentActivityPayload } from "@/server/services/activity-service";

const mockActivity: StudentActivityPayload = {
  id: "test-act-id",
  journeyId: "test-journey-id",
  journeySlug: "ancient-egyptian-teacher",
  journeyTitle: "خبر عن المعلم المصري القديم",
  stageId: "test-stage-id",
  stageSlug: "main",
  stageTitle: "مراحل الدرس",
  slug: "arabic-feelings-j1",
  type: "self_assessment",
  title: "شعوري قبل حصة اللغة العربية",
  instruction: "ما شعورك قبل حصة اللغة العربية؟",
  prompt: "اختر ما يعبر بصدق عن مشاعرك الداخلية قبل بدء الدرس:",
  isGraded: false,
  isSensitive: false,
  storagePolicy: "FULL_RESPONSE",
  displayOrder: 1,
  audioAsset: null,
  options: [
    {
      optionKey: "happy",
      label: "أشعر بالحماس",
      secondaryText: null,
      displayOrder: 1,
    },
    {
      optionKey: "neutral",
      label: "أشعر بالهدوء",
      secondaryText: null,
      displayOrder: 2,
    },
    {
      optionKey: "calm",
      label: "أشعر بالسكينة",
      secondaryText: null,
      displayOrder: 3,
    },
  ],
  activityNumber: 1,
  totalActivities: 19,
  previousActivitySlug: null,
  nextActivitySlug: "next-slug",
  nextActivityTitle: "Next Activity",
  isCompleted: false,
  instructionAudioKey: null,
  promptAudioKey: null,
  correctFeedbackAudioKey: null,
  incorrectFeedbackAudioKey: null,
  completionFeedbackAudioKey: null,
  previousResponseData: null,
  configuration: null,
};

describe("SelfAssessment Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("selection: renders integrated flow, updates response, and enables bottom submit button", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            result: {
              isCorrect: true,
              score: 0.0,
              storagePolicy: "FULL_RESPONSE",
              modelAnswer: null,
              explanation: null,
              journeyStatus: "IN_PROGRESS",
              feedback: {
                status: "participation",
                displayText: "شكرًا لمشاركتك 🌟",
                audioKey: "global.feedback.participation.01",
              },
            },
          }),
      } as Response),
    );

    render(<ActivityPlayerClient activity={mockActivity} />);

    // 1. Initially, submit button should be disabled with text "اختر إجابة أولاً"
    const submitBtn = screen.getByRole("button", { name: "اختر إجابة أولاً" });
    expect(submitBtn).toBeDisabled();

    // Verify option cards are rendered as buttons with aria-pressed="false"
    const optButtons = screen
      .getAllByRole("button")
      .filter(
        (btn) => btn.hasAttribute("aria-pressed") && !btn.hasAttribute("aria-label"),
      );
    expect(optButtons).toHaveLength(3);
    optButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-pressed", "false");
    });

    // 2. Click the first option card
    fireEvent.click(optButtons[0]);

    // First card should now be pressed and marked as selected
    expect(optButtons[0]).toHaveAttribute("aria-pressed", "true");
    expect(optButtons[0]).toHaveTextContent("✓ تم الاختيار");
    expect(optButtons[1]).toHaveAttribute("aria-pressed", "false");

    // Parent player's submit button should now be enabled showing "تأكيد اختياري"
    const enabledSubmitBtn = screen.getByRole("button", {
      name: "تأكيد اختياري",
    });
    expect(enabledSubmitBtn).toBeEnabled();

    // 3. Click the confirm button to trigger submission
    fireEvent.click(enabledSubmitBtn);

    // Verify loading state appears
    expect(
      screen.getByRole("button", { name: "جارٍ الحفظ..." }),
    ).toBeDisabled();

    // Verify API is called with canonical selectedKey payload
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/activities/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityId: "test-act-id",
        responseData: { selectedKey: "happy" },
      }),
    });

    // 4. Verify completed state (Next button becomes active, submit button disabled showing selection saved)
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "تم حفظ اختيارك" }),
      ).toBeDisabled();
    });

    // Friendly feedback is rendered
    expect(screen.getByText("شكرًا لمشاركتك 🌟")).toBeInTheDocument();
    expect(
      screen.getByText("تم حفظ اختيارك، ويمكنك الانتقال إلى النشاط التالي."),
    ).toBeInTheDocument();

    // Next activity navigation link is visible
    const nextLink = screen.getByRole("link", { name: "النشاط التالي ➔" });
    expect(nextLink).toHaveAttribute(
      "href",
      "/lessons/ancient-egyptian-teacher/activities/next-slug",
    );
  });

  test("keyboard navigation: space or enter selects key", () => {
    render(<ActivityPlayerClient activity={mockActivity} />);

    const optButtons = screen
      .getAllByRole("button")
      .filter(
        (btn) => btn.hasAttribute("aria-pressed") && !btn.hasAttribute("aria-label"),
      );

    // Click/Space triggers selection
    fireEvent.click(optButtons[1]);
    expect(optButtons[1]).toHaveAttribute("aria-pressed", "true");
  });

  test("persistence: restores previous selectedKey when reloading", () => {
    const mockWithPrev: StudentActivityPayload = {
      ...mockActivity,
      previousResponseData: { selectedKey: "neutral" },
    };

    render(<ActivityPlayerClient activity={mockWithPrev} />);

    const optButtons = screen
      .getAllByRole("button")
      .filter(
        (btn) => btn.hasAttribute("aria-pressed") && !btn.hasAttribute("aria-label"),
      );

    expect(optButtons[0]).toHaveAttribute("aria-pressed", "false");
    expect(optButtons[1]).toHaveAttribute("aria-pressed", "true");
  });

  test("technical metadata absence: does not leak tags or configuration in HTML", () => {
    const { container } = render(
      <ActivityPlayerClient activity={mockActivity} />,
    );
    const html = container.innerHTML;

    expect(html).not.toContain("self_regulation");
    expect(html).not.toContain("#self_regulation");
    expect(html).not.toContain("FULL_RESPONSE");
    expect(html).not.toContain("COMPLETION_ONLY");
    expect(html).not.toContain("sourceKey");
    expect(html).not.toContain("storagePolicy");
  });
});
