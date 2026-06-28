import re

FEMININE_EXCEPTIONS = {
    "أميرة", "مريم", "أمي", "أسرة", "حديقة", "حقيبة", "زهرة",
    "شجرة", "مدرسة", "معلمة", "مممساحة", "ممحاة", "نملة", "غابة",
    "مهندسة", "جميلة", "رسمة", "لوحة"
}

FEMALE_HINTS = {"مريم", "أميرة", "أمي", "أمها", "المعلمة", "معلمتي", "فتاة", "بنت"}
MALE_HINTS = {"يوسف", "سامي", "كريم", "طارق", "أبي", "أبوها", "الأب", "جدي", "ولد"}

HARAKAT_RE = re.compile(r"[\u064b-\u0652]+$")
ENDING_PUNCT_RE = re.compile(r"[!؟?.:,،؛]+$")
LONG_VOWEL_ENDINGS = {"ا", "و", "ي", "ى"}

WORD_TTS_OVERRIDES = {
    "أمي": "أُمِّي",
    "أبي": "أَبِي",
    "يوسف": "يُوسُفْ",
    "أميرة": "أَمِيرَة",
    "أسرة": "أُسْرَة",
    "أرنب": "أَرْنَب",
    "أسد": "أَسَد",
}

NAME_TTS_OVERRIDES = {
    "يوسف": "يُوسُف",
    "مريم": "مَرْيَم",
    "أميرة": "أَمِيرَة",
    "سامي": "سَامِي",
    "كريم": "كَرِيم",
    "طارق": "طَارِق",
}

def normalize_name_pronunciation(tts_text: str) -> str:
    tts = (tts_text or "").strip()
    if not tts:
        return tts

    for raw_name, vocalized_name in NAME_TTS_OVERRIDES.items():
        tts = re.sub(
            fr"(?<![\u0621-\u064A]){re.escape(raw_name)}(?![\u0621-\u064A])",
            vocalized_name,
            tts
        )
    return tts

def normalize_waqf_tts(word_text: str, tts_text: str) -> str:
    txt = (word_text or "").strip()
    tts = (tts_text or "").strip()
    if not txt or not tts:
        return tts

    if txt in WORD_TTS_OVERRIDES:
        tts = WORD_TTS_OVERRIDES[txt]

    # Strip ending punctuation before pause normalization.
    tts = ENDING_PUNCT_RE.sub("", tts)

    # Remove final case-ending harakat for pause/waqf style pronunciation.
    tts = HARAKAT_RE.sub("", tts)
    if not tts:
        return tts

    last_char = tts[-1]

    # Ta marbuta should be pronounced as final "ha" in pause.
    if last_char == "ة":
        return f"{tts[:-1]}هْ"

    # For long vowel endings, keep natural stop without adding sukun.
    if last_char in LONG_VOWEL_ENDINGS:
        return tts

    # Otherwise pause on sukun.
    return f"{tts}ْ"

def normalize_waqf_tts_for_text(text: str) -> str:
    """Apply waqf normalization to each word in a sentence."""
    if not text:
        return text
    
    words = text.split()
    normalized_words = []
    
    for i, word in enumerate(words):
        # Skip if word is just punctuation or very short
        if len(word) <= 1 or all(c in '،.!?؛:،؟' for c in word):
            normalized_words.append(word)
            continue
        
        # Extract trailing punctuation
        trailing_punct = ''
        clean_word = word
        while clean_word and clean_word[-1] in '،.!?؛:،؟':
            trailing_punct = clean_word[-1] + trailing_punct
            clean_word = clean_word[:-1]
        
        if not clean_word:
            normalized_words.append(word)
            continue
        
        # Check if this is the last word or has trailing punctuation (waqf position)
        is_last_word = (i == len(words) - 1) or trailing_punct
        
        if is_last_word:
            normalized = normalize_waqf_tts(clean_word, clean_word)
        else:
            normalized = clean_word
        
        normalized_words.append(normalized + trailing_punct)
    
    return ' '.join(normalized_words)

def prepare_arabic_speech_text(text: str) -> str:
    """Centralized pronunciation-preparation function."""
    if not text:
        return ""
    text = normalize_name_pronunciation(text)
    text = normalize_waqf_tts_for_text(text)
    return text
