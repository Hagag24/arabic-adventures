export function stripDiacritics(text: string): string {
  // Arabic diacritics unicode range: \u064B to \u0652, tatweel \u0640, superscript alef \u0670
  return text.replace(/[\u064B-\u0652\u0640\u0670]/g, "");
}

export function normalizeArabicLetters(text: string): string {
  let normalized = text;

  // 1. Normalize Alef variants (أ, إ, آ) to bare Alef (ا)
  normalized = normalized.replace(/[أإآ]/g, "ا");

  // 2. Normalize Teh Marbuta (ة) to Heh (ه)
  normalized = normalized.replace(/ة/g, "ه");

  // 3. Normalize Alef Maqsura (ى) to Yeh (ي)
  normalized = normalized.replace(/ى/g, "ي");

  return normalized;
}

export function stripPunctuationAndWhitespace(text: string): string {
  let cleaned = text;

  // Replace punctuation with spaces
  cleaned = cleaned.replace(/[؟!.,،:;\-_"'\(\)\[\]\{\}«»“”]/g, " ");

  // Normalize whitespace (replace multiple spaces/tabs/newlines with a single space)
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

export function normalizeForLexicalComparison(text: string): string {
  let result = text;
  result = stripDiacritics(result);
  result = normalizeArabicLetters(result);
  result = stripPunctuationAndWhitespace(result);
  return result.toLowerCase();
}
