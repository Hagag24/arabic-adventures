import os
import sys
import json
import re
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(project_root / "development" / "audio" / "edge-tts" / "src"))
from edge_audio.inventory import get_inventory

# Load word-level vocalizations from JSON
vocalizations_file = project_root / "development" / "audio" / "tools" / "word_vocalizations.json"
with open(vocalizations_file, "r", encoding="utf-8") as f:
    WORD_VOCALIZATIONS = json.load(f)

# Complete sentence-level vocalizations for stories, results, welcomes, feedbacks, and complex grammar
VOCALIZED_CATALOG = {
    # Welcome & Shared Feedbacks
    "global.welcome.01": "أَهْلًا بِكَ يَا بَطَلْ! هَلْ أَنْتَ جَاهِزٌ لِنَبْدَأَ رِحْلَتَنَا فِي اللُّغَةِ العَرَبِيَّةِ؟ هَيَّا بِنَا!",
    "global.feedback.correct.01": "أَحْسَنْتَ يَا بَطَلْ! الإِجَابَةُ صَحِيحَةٌ.",
    "global.feedback.retry.01": "وَلَا يِهِمَّكْ يَا بَطَلْ، الحَلّ مِشْ صَحّْ. فَكِّرْ بِهُدُوءْ وَجَرِّبْ تَانِي.",
    "global.feedback.completion.01": "بَرَافُو يَا بَطَلْ! خَلَّصْتَ النَّشَاطَ بِنَجَاحٍ.",
    "global.feedback.participation.01": "شُكْرًا لِمُشَارَكَتِكَ، تَمَّ حِفْظُ إِجَابَتِكَ.",

    # Stories & Results
    "lessons.ancient-egyptian-teacher.story": "بَدَأَ المَتْحَفُ المِصْرِيُّ مَشْرُوعًا كَبِيرًا لِتَطْوِيرِ القَاعَةِ الَّتِي تَعْرِضُ تَارِيخَ التَّعْلِيمِ وَالكِتَابَةِ فِي مِصْرَ القَدِيمَةِ. وَفِي هَذَا العَرْضِ، يَظْهَرُ دَوْرُ المُعَلِّمِ المِصْرِيِّ القَدِيمِ، الَّذِي كَانَ يُسَمَّى \"الكَاتِبَ\". كَانَ هَذَا الكَاتِبُ يَجْلِسُ فِي وَقَارٍ عَلَى وِسَادَةٍ، وَيَحْمِلُ بِيَدِهِ لَوْحَةً خَشَبِيَّةً وَأَدَوَاتِ الكِتَابَةِ مَصْنُوعَةِ مِنَ الخَشَبِ وَالرِّيشِ. وَكَانَ الكُتَّابُ يُدَوِّنُونَ عُلُومَهُمْ وَأَفْكَارَهُمْ عَلَى أَوْرَاقِ البَرْدِيِّ الَّتِي عُثِرَ عَلَيْهَا لَاحِقًا فِي مَقَابِرِ العُلَمَاءِ. لَقَدْ حَظِيَ الكَاتِبُ بِمَكَانَةٍ عَظِيمَةٍ فِي مُجْتَمَعِهِ، لِأَنَّهُ كَانَ يَنْشُرُ العِلْمَ وَالمَعْرِفَةَ وَيُسْهِمُ فِي بِنَاءِ الحَضَارَةِ وَتَدْوِينِ التَّارِيخِ.",
    "lessons.magdi-yacoub.story": "وُلِدَ الدُّكْتُور مَجْدِي يَعْقُوب فِي مِصْرَ، وَكَانَ وَالِدُهُ طَبِيبًا جَرَّاحًا نَاجِحًا. تَعَلَّمَ مَجْدِي مِنْ وَالِدِهِ حُبَّ مُسَاعَدَةِ النَّاسِ وَالتَّعَاطُفَ مَعَ المَرْضَى، فَقَرَّرَ أَنْ يُصْبِحَ طَبِيبًا لِيُعَالِجَ قُلُوبَ الأَطْفَالِ وَالكِبَارِ. سَافَرَ الطَّبِيبُ الشَّابُّ إِلَى بِرِيطَانِيَا لِيَتَعَلَّمَ وَيَكْتَسِبَ الخِبْرَةَ العَالَمِيَّةَ. وَاجْتَهَدَ لِسَنَوَاتٍ طَوِيلَةٍ حَتَّى أَصْبَحَ مِنْ أَشْهَرِ جَرَّاحِي القَلْبِ فِي العَالَمِ، وَحَصَلَ عَلَى لَقَبِ \"سِير\" تَكْرِيمًا لِجُهُودِهِ الإِنْسَانِيَّةِ. وَرَغْمَ شُهْرَتِهِ الكَبِيرَةِ، قَرَّرَ العَوْدَةَ إِلَى مِصْرَ فِي عَامِ أَلْفَيْنِ وَتِسْعَةٍ. وَاخْتَارَ مَدِينَةَ أَسْوَانَ الهَادِئَةَ لِيَبْنِيَ فِيهَا مَرْكَزًا عَالَمِيًّا لِجِرَاحَاتِ القَلْبِ، لِعِلَاجِ المَرْضَى بِالمَلْيُونِ وَبِالمَجَّانِ، وَرَسْمِ البَسْمَةِ عَلَى وُجُوهِ Mَرْضَى وَأَطْفَالِ مِصْرَ الطَّيِّبِينَ.",
    "lessons.ancient-egyptian-teacher.result": "لَقَدْ أَنْهَيْتَ دَرْسَ المُعَلِّمِ المِصْرِيِّ القَدِيمِ بِالكَامِلِ بِنَجَاحٍ وَحَصَلْتَ عَلَى وِسَامِ مُسْتَكْشِفِ الحَضَارَةِ!",
    "lessons.magdi-yacoub.result": "لَقَدْ أَنْهَيْتَ دَرْسَ حِوَارٍ مَعَ الدُّكْتُور مَجْدِي يَعْقُوب بِالكَامِلِ بِنَجَاحٍ وَحَصَلْتَ عَلَى وِسَامِ صَانِعِ الأَمَلِ!",
}

def clean_word(word: str) -> str:
    return re.sub(r"[!؟?.:,،؛()\"'«»“”\s]", "", word)

def vocalize_sentence(text: str) -> str:
    if not text:
        return ""
    
    words = text.split()
    vocalized_words = []
    
    for word in words:
        # Extract punctuation
        leading_punct = ""
        trailing_punct = ""
        clean = word
        
        while clean and clean[0] in '!؟?.:,،؛()\"\'«»“”':
            leading_punct += clean[0]
            clean = clean[1:]
            
        while clean and clean[-1] in '!؟?.:,،؛()\"\'«»“”':
            trailing_punct = clean[-1] + trailing_punct
            clean = clean[:-1]
            
        if not clean:
            vocalized_words.append(word)
            continue
            
        # Look up in dictionary
        # Strip all diacritics first to match raw text
        raw_key = re.sub(r"[\u064b-\u0652\u0670]", "", clean)
        
        # Normalize some letters for flexible lookup
        raw_key_norm = raw_key.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ة", "ه")
        
        found = False
        for dict_key, dict_val in WORD_VOCALIZATIONS.items():
            norm_dict_key = dict_key.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ة", "ه")
            if raw_key_norm == norm_dict_key:
                vocalized_clean = dict_val
                found = True
                break
                
        if not found:
            vocalized_clean = clean # Fallback to original
            
        vocalized_words.append(leading_punct + vocalized_clean + trailing_punct)
        
    return " ".join(vocalized_words)

def normalize_waqf_spelling(text: str) -> str:
    words = text.split()
    normalized = []
    for i, w in enumerate(words):
        leading_punct = ""
        trailing_punct = ""
        clean = w
        while clean and clean[0] in '!؟?.:,،؛()\"\'«»“”':
            leading_punct += clean[0]
            clean = clean[1:]
        while clean and clean[-1] in '!؟?.:,،؛()\"\'«»“”':
            trailing_punct = clean[-1] + trailing_punct
            clean = clean[:-1]
            
        if not clean:
            normalized.append(w)
            continue
            
        is_waqf = (i == len(words) - 1) or trailing_punct
        
        # Custom phonetics: Convert M to م, H to خ, E to ا, Kh to خ
        clean = clean.replace("M", "مَ").replace("H", "حِ").replace("E", "إِ").replace("Kh", "خَ")
        
        if is_waqf:
            # Strip case ending harakat
            clean = re.sub(r"[\u064e\u064f\u0650\u064b\u064c\u064d]$", "", clean)
            if clean.endswith("ة"):
                clean = clean[:-1] + "هْ"
            elif not clean.endswith("ْ") and not clean[-1] in ["ا", "و", "ي", "ى"]:
                clean = clean + "ْ"
                
        normalized.append(leading_punct + clean + trailing_punct)
    return " ".join(normalized)

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
        
    inventory = get_inventory()
    overrides = {}
    
    unvocalized_words = set()
    
    for item in inventory:
        key = item["semanticKey"]
        display_text = item["arabicText"]
        
        # Determine raw spoken text
        if key in VOCALIZED_CATALOG:
            raw_spoken = VOCALIZED_CATALOG[key]
        else:
            # Re-map shared feedback completions
            if item["category"] == "completion_feedback":
                raw_spoken = VOCALIZED_CATALOG["global.feedback.completion.01"]
            elif item["category"] == "participation_feedback":
                raw_spoken = VOCALIZED_CATALOG["global.feedback.participation.01"]
            else:
                raw_spoken = vocalize_sentence(display_text)
                
        spoken_text = normalize_waqf_spelling(raw_spoken)
        
        # Audit for any unvocalized words (except English, numbers, or simple particles)
        words = spoken_text.split()
        for w in words:
            cw = clean_word(w)
            base = re.sub(r"[\u064b-\u0652\u0670]", "", cw)
            if base and not re.search(r"[\u064b-\u0652\u0670]", cw):
                if re.match(r"^[\u0621-\u064A\u0670\u06A9\u06AF]+$", base):
                    if base not in {"في", "على", "إلى", "لا", "ما", "يا", "عن", "أم", "أو", "من", "مع", "سير", "د"}:
                        unvocalized_words.add(base)
                        
        overrides[key] = {
            "displayText": display_text,
            "spokenText": spoken_text,
            "voice": "ar-EG-SalmaNeural",
            "rate": "-15%",
            "reviewStatus": "script-reviewed"
        }
        
    # Save overrides
    output_path = project_root / "development" / "audio" / "edge-tts" / "spoken-text-overrides.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(overrides, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {len(overrides)} explicit spoken scripts to {output_path}")
    print(f"Total unvocalized words remaining: {len(unvocalized_words)}")
    if unvocalized_words:
        print("Unvocalized words list:")
        print(sorted(list(unvocalized_words)))

if __name__ == "__main__":
    main()
