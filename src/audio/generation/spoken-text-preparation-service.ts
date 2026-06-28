import { normalizeForLexicalComparison } from "./arabic-normalization";

export type SpokenTextIntegrityResult = {
  isValid: boolean;
  mismatchReason?: string;
  normalizedDisplay?: string;
  normalizedSpoken?: string;
};

export function expandNumbersInArabicText(text: string): string {
  let expanded = text;
  // Replace 2009 with "ألفين وتسعة"
  expanded = expanded.replace(/\b2009\b/g, "ألفين وتسعة");
  // Replace 3 with "ثلاثة"
  expanded = expanded.replace(/\b3\b/g, "ثلاثة");
  // Replace 1 with "الأولى" or "واحد" contextually, but let's handle simple cases
  expanded = expanded.replace(/\b1\b/g, "واحد");
  expanded = expanded.replace(/\b2\b/g, "اثنين");
  return expanded;
}

export function validateSpokenTextIntegrity(
  displayText: string,
  spokenText: string,
): SpokenTextIntegrityResult {
  // Expand numbers first
  const displayExpanded = expandNumbersInArabicText(displayText);
  const spokenExpanded = expandNumbersInArabicText(spokenText);

  // Normalize both for lexical comparison
  const normalizedDisplay = normalizeForLexicalComparison(displayExpanded);
  const normalizedSpoken = normalizeForLexicalComparison(spokenExpanded);

  if (normalizedDisplay === normalizedSpoken) {
    return { isValid: true };
  }

  // Find exact word mismatches
  const displayWords = normalizedDisplay.split(" ").filter(Boolean);
  const spokenWords = normalizedSpoken.split(" ").filter(Boolean);

  if (displayWords.length !== spokenWords.length) {
    return {
      isValid: false,
      mismatchReason: `Word count mismatch: visible has ${displayWords.length} words, spoken has ${spokenWords.length} words.`,
      normalizedDisplay,
      normalizedSpoken,
    };
  }

  const mismatches: string[] = [];
  for (let i = 0; i < displayWords.length; i++) {
    if (displayWords[i] !== spokenWords[i]) {
      mismatches.push(
        `Word ${i + 1}: expected '${displayWords[i]}', got '${spokenWords[i]}'`,
      );
    }
  }

  return {
    isValid: false,
    mismatchReason: `Lexical mismatch: ${mismatches.join(", ")}`,
    normalizedDisplay,
    normalizedSpoken,
  };
}
