"use client";

import React from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import { StudentResponse } from "./ActivityPlayerClient";
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
import MultiRoundRenderer from "./renderers/MultiRoundRenderer";

import { ActivityAudioContract } from "@/audio/runtime/activity-audio-contract";

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
  | "agree_disagree"
  | "multi_round";

interface ActivityRendererProps {
  activity: StudentActivityPayload;
  audioContract: ActivityAudioContract;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  response: StudentResponse | null;
  onResponseChange: (response: StudentResponse) => void;
  setActiveSubId?: (id: string) => void;
}

function assertNever(x: never): never {
  throw new Error(`Unhandled activity type: ${JSON.stringify(x)}`);
}

export default function ActivityRenderer({
  activity,
  audioContract,
  onSubmit,
  isSubmitting,
  evaluationResult,
  response,
  onResponseChange,
  setActiveSubId,
}: ActivityRendererProps) {
  const type = activity.type as ActivityType;

  switch (type) {
    case "single_choice":
      return (
        <ChoiceRenderer
          activity={activity}
          audioContract={audioContract}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "single_choice" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "single_choice",
              data: {
                selectedOption: data.selectedOption || "",
              },
            })
          }
        />
      );
    case "checklist":
    case "multiple_select":
      return (
        <ChecklistRenderer
          activity={activity}
          audioContract={audioContract}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={
            response?.type === "checklist" ||
            response?.type === "multiple_select"
              ? response.data
              : null
          }
          onChange={(data) =>
            onResponseChange({
              type: type as "checklist" | "multiple_select",
              data,
            })
          }
        />
      );
    case "word_bank":
      return (
        <WordBankRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "word_bank" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "word_bank",
              data,
            })
          }
        />
      );
    case "matching":
      return (
        <MatchingRenderer
          activity={activity}
          audioContract={audioContract}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "matching" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "matching",
              data,
            })
          }
        />
      );
    case "ordering":
      return (
        <OrderingRenderer
          activity={activity}
          audioContract={audioContract}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "ordering" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "ordering",
              data,
            })
          }
        />
      );
    case "fill_in_the_blank":
      return (
        <FillBlankRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "fill_in_the_blank" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "fill_in_the_blank",
              data,
            })
          }
        />
      );
    case "three_answers":
      return (
        <ThreeAnswersRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "three_answers" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "three_answers",
              data,
            })
          }
        />
      );
    case "problem_solution":
      return (
        <ProblemSolutionRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "problem_solution" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "problem_solution",
              data,
            })
          }
        />
      );
    case "story_builder":
      return (
        <StoryBuilderRenderer
          activity={activity}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "story_builder" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "story_builder",
              data,
            })
          }
        />
      );
    case "self_assessment":
      return (
        <SelfAssessmentRenderer
          activity={activity}
          audioContract={audioContract}
          value={response?.type === "self_assessment" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "self_assessment",
              data,
            })
          }
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
          value={
            response?.type === "short_text" ||
            response?.type === "long_text" ||
            response?.type === "creative_ending" ||
            response?.type === "retell_story"
              ? response.data
              : null
          }
          onChange={(data) =>
            onResponseChange({
              type: type as
                | "short_text"
                | "long_text"
                | "creative_ending"
                | "retell_story",
              data,
            })
          }
        />
      );
    case "agree_disagree":
      return (
        <AgreeDisagreeRenderer
          activity={activity}
          audioContract={audioContract}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "agree_disagree" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "agree_disagree",
              data,
            })
          }
        />
      );
    case "multi_round":
      return (
        <MultiRoundRenderer
          activity={activity}
          audioContract={audioContract}
          setActiveSubId={setActiveSubId || (() => {})}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          evaluationResult={evaluationResult}
          value={response?.type === "multi_round" ? response.data : null}
          onChange={(data) =>
            onResponseChange({
              type: "multi_round",
              data,
            })
          }
        />
      );
    default:
      // Exhaustive compile-time check using assertNever
      return assertNever(type);
  }
}
