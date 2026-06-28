export type ActivityAudioContract = {
  instructionKey?: string;
  questionKey: string;
  answerKeys: Record<string, string>;
  correctFeedbackKey?: string;
  retryFeedbackKey?: string;
  participationFeedbackKey?: string;
  completionFeedbackKey?: string;
};

export function getLessonAudioPrefix(lessonSlug: string): string {
  if (lessonSlug === "magdi-yacoub") return "king-of-hearts-yacoub";
  return lessonSlug;
}

export function resolveActivityAudioContract(
  activity: {
    slug: string;
    journeySlug: string;
    type?: string;
    instructionAudioKey?: string | null;
    promptAudioKey?: string | null;
    correctFeedbackAudioKey?: string | null;
    incorrectFeedbackAudioKey?: string | null;
    completionFeedbackAudioKey?: string | null;
    options: { optionKey: string; narrationKey?: string | null }[];
    configuration?: {
      rounds?: Array<{
        id: string;
        options?: Array<{ optionKey: string; narrationKey?: string | null }>;
      }>;
    } | null;
  },
  context?: {
    screenId?: string;
    roundId?: string;
    hasKey?: (key: string) => boolean;
  } | ((key: string) => boolean)
): ActivityAudioContract {
  const hasKey = typeof context === "function"
    ? context
         : (context?.hasKey || (() => true));
  const roundId = (context && typeof context === "object") ? context.roundId : undefined;

  const prefix = getLessonAudioPrefix(activity.journeySlug);
  
  const instructionKeyRaw = activity.instructionAudioKey || `${prefix}-${activity.slug}-instruction`;
  const instructionKey = hasKey(instructionKeyRaw) ? instructionKeyRaw : undefined;

  const questionKey = activity.promptAudioKey || `${prefix}-${activity.slug}-prompt`;
  
  const answerKeys: Record<string, string> = {};

  if (activity.type === "multi_round" && activity.configuration?.rounds && roundId) {
    const round = activity.configuration.rounds.find((r) => r.id === roundId);
    if (round && round.options) {
      for (const option of round.options) {
        answerKeys[option.optionKey] = option.narrationKey || `${prefix}-${activity.slug}-${roundId}-option-${option.optionKey}`;
      }
    }
  } else {
    for (const option of activity.options) {
      answerKeys[option.optionKey] = option.narrationKey || `${prefix}-${activity.slug}-option-${option.optionKey}`;
    }
  }
  
  const correctFeedbackKeyRaw = activity.correctFeedbackAudioKey || `${prefix}-${activity.slug}-correct-feedback`;
  const correctFeedbackKey = hasKey(correctFeedbackKeyRaw) ? correctFeedbackKeyRaw : undefined;

  const retryFeedbackKeyRaw = activity.incorrectFeedbackAudioKey || `${prefix}-${activity.slug}-incorrect-feedback`;
  const retryFeedbackKey = hasKey(retryFeedbackKeyRaw) ? retryFeedbackKeyRaw : undefined;

  const completionFeedbackKeyRaw = activity.completionFeedbackAudioKey || `${prefix}-${activity.slug}-completion-feedback`;
  const completionFeedbackKey = hasKey(completionFeedbackKeyRaw) ? completionFeedbackKeyRaw : undefined;

  const participationFeedbackKeyRaw = activity.completionFeedbackAudioKey || `${prefix}-${activity.slug}-completion-feedback`;
  const participationFeedbackKey = hasKey(participationFeedbackKeyRaw) ? participationFeedbackKeyRaw : undefined;

  return {
    instructionKey,
    questionKey,
    answerKeys,
    correctFeedbackKey,
    retryFeedbackKey,
    participationFeedbackKey,
    completionFeedbackKey,
  };
}
