export type AudioInventoryItem = {
  key: string;
  lessonSlug: string | null;
  activitySlug: string | null;
  roundId: string | null;

  purpose:
    | "lesson_intro"
    | "instruction"
    | "prompt"
    | "option"
    | "correct_feedback"
    | "retry_feedback"
    | "completion_feedback"
    | "model_answer";

  displayText: string;
  spokenText: string;
  fullyVocalizedText: string;
  normalizedComparisonText: string;

  deliveryStyle:
    | "educational_msa_egyptian"
    | "warm_egyptian_feedback"
    | "calm_option"
    | "story_narration";

  pronunciationOverrides: string[];
  generationStatus:
    | "DRAFT"
    | "TEXT_REVIEW_REQUIRED"
    | "READY_FOR_GENERATION"
    | "GENERATED"
    | "PENDING_AUDIO_REVIEW"
    | "APPROVED"
    | "REJECTED";

  approvedVoice: string | null;
  notes: string | null;
};
