"use client";

import React from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import ChoiceRenderer from "./renderers/ChoiceRenderer";
import ChecklistRenderer from "./renderers/ChecklistRenderer";
import WordBankRenderer from "./renderers/WordBankRenderer";
import MatchingRenderer from "./renderers/MatchingRenderer";
import OrderingRenderer from "./renderers/OrderingRenderer";
import FillBlankRenderer from "./renderers/FillBlankRenderer";
import ThreeAnswersRenderer from "./renderers/ThreeAnswersRenderer";
import ProblemSolutionRenderer from "./renderers/ProblemSolutionRenderer";
import StoryBuilderRenderer from "./renderers/StoryBuilderRenderer";
import SelfAssessmentRenderer from "./renderers/SelfAssessmentRenderer";
import OpenTextRenderer from "./renderers/OpenTextRenderer";
import AgreeDisagreeRenderer from "./renderers/AgreeDisagreeRenderer";

type ActivityType =
  | "single_choice"
  | "checklist"
  | "multiple_select"
  | "word_bank"
  | "matching"
  | "ordering"
  | "fill_in_the_blank"
  | "three_answers"
  | "problem_solution"
  | "story_builder"
  | "self_assessment"
  | "short_text"
  | "long_text"
  | "creative_ending"
  | "retell_story"
  | "agree_disagree";

interface ActivityRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

function assertNever(x: never): never {
  throw new Error(`Unhandled activity type: ${JSON.stringify(x)}`);
}

export default function ActivityRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: ActivityRendererProps) {
  const type = activity.type as ActivityType;

  switch (type) {
    case "single_choice":
      return (
        <ChoiceRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "checklist":
    case "multiple_select":
      return (
        <ChecklistRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "word_bank":
      return (
        <WordBankRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "matching":
      return (
        <MatchingRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "ordering":
      return (
        <OrderingRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "fill_in_the_blank":
      return (
        <FillBlankRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "three_answers":
      return (
        <ThreeAnswersRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "problem_solution":
      return (
        <ProblemSolutionRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "story_builder":
      return (
        <StoryBuilderRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "self_assessment":
      return (
        <SelfAssessmentRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "short_text":
    case "long_text":
    case "creative_ending":
    case "retell_story":
      return (
        <OpenTextRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    case "agree_disagree":
      return (
        <AgreeDisagreeRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
        />
      );
    default:
      // Exhaustive compile-time check using assertNever
      return assertNever(type);
  }
}
