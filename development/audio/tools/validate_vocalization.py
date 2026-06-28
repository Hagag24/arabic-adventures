import os
import re
import json
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent.parent

# Unicode range for Arabic diacritics
DIACRITICS_RE = re.compile(r"[\u064b-\u0652\u0670]")
ARABIC_WORD_RE = re.compile(r"^[\u0621-\u064A\u0670\u06A9\u06AF]+$")

# Words that are allowed to have no diacritics (e.g., very simple particles, numbers, English words)
EXCEPTIONS = {
    "في", "على", "إلى", "لا", "ما", "يا", "عن", "أم", "أو", "من", "حتى", "مع",
    "in", "3", "2009", "سير", "د."
}

def clean_word(word: str) -> str:
    # Strip punctuation
    return re.sub(r"[!؟?.:,،؛()\"'«»“”\s]", "", word)

def validate_vocalization():
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
        
    overrides_file = project_root / "development" / "audio" / "edge-tts" / "spoken-text-overrides.json"
    if not overrides_file.exists():
        print("Error: spoken-text-overrides.json not found.")
        return False

    with open(overrides_file, "r", encoding="utf-8") as f:
        overrides = json.load(f)

    print(f"Scanning {len(overrides)} explicit spoken scripts for vocalization...")

    errors = []
    total_words = 0
    unvocalized_words_count = 0

    for key, data in overrides.items():
        # Handle both flat and nested structures
        if isinstance(data, dict):
            spoken_text = data.get("spokenText", "")
        else:
            spoken_text = data

        if not spoken_text:
            errors.append((key, "Empty spoken text"))
            continue

        words = spoken_text.split()
        for word in words:
            cleaned = clean_word(word)
            if not cleaned:
                continue

            # Check if it is an Arabic word
            # Strip diacritics to check if the base is Arabic letters
            base_word = DIACRITICS_RE.sub("", cleaned)
            if not base_word:
                continue

            total_words += 1

            # If it contains only Arabic letters
            if ARABIC_WORD_RE.match(base_word):
                if base_word in EXCEPTIONS:
                    continue

                # Check if it has at least one diacritic
                if not DIACRITICS_RE.search(cleaned):
                    errors.append((key, f"Unvocalized word: '{cleaned}' (base: '{base_word}')"))
                    unvocalized_words_count += 1

            # Check for suspicious repeated letters (artificial elongation)
            for match in re.finditer(r"([\u0621-\u064A])\1{2,}", base_word):
                errors.append((key, f"Suspicious repeated letter in '{cleaned}': '{match.group(0)}'"))

    print(f"\nScan complete. Total Arabic words checked: {total_words}")
    print(f"Unvocalized words found: {unvocalized_words_count}")

    if errors:
        print(f"\n[ERROR] VOCALIZATION VALIDATION FAILED: Found {len(errors)} issues.")
        for key, err in errors[:30]:  # Show first 30 errors
            print(f"- [{key}]: {err}")
        if len(errors) > 30:
            print(f"... and {len(errors) - 30} more issues.")
        return False
    else:
        print("✔ ALL SCRIPTS ARE FULLY VOCALIZED AND PASSED VALIDATION! ⭐")
        return True

if __name__ == "__main__":
    validate_vocalization()
