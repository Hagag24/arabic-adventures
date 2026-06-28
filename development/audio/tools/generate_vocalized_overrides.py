import os
import sys
import json
import re
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(project_root / "development" / "audio" / "edge-tts" / "src"))

from edge_audio.inventory import get_inventory

# Sentence-level overrides for complex grammar, stories, or custom phrasing
SENTENCE_OVERRIDES = {
    "global.welcome.01": "أَهْلًا بِكَ يَا بَطَلْ! هَلْ أَنْتَ جَاهِزٌ لِنَبْدَأَ رِحْلَتَنَا فِي اللُّغَةِ العَرَبِيَّةِ؟ هَيَّا بِنَا!",
    "global.feedback.correct.01": "أَحْسَنْتَ يَا بَطَلْ! الإِجَابَةُ صَحِيحَةٌ.",
    "global.feedback.retry.01": "وَلَا يِهِمَّكْ يَا بَطَلْ، الحَلّ مِشْ صَحّْ. فَكِّرْ بِهُدُوءْ وَجَرِّبْ تَانِي.",
    "global.feedback.completion.01": "بَرَافُو يَا بَطَلْ! خَلَّصْتَ النَّشَاطَ بِنَجَاحٍ.",
    "global.feedback.participation.01": "شُكْرًا لِمُشَارَكَتِكَ، تَمَّ حِفْظُ إِجَابَتِكَ.",
    
    # Stories
    "lessons.ancient-egyptian-teacher.story": "بَدَأَ المَتْحَفُ المِصْرِيُّ مَشْرُوعًا كَبِيرًا لِتَطْوِيرِ القَاعَةِ الَّتِي تَعْرِضُ تَارِيخَ التَّعْلِيمِ وَالكِتَابَةِ فِي مِصْرَ القَدِيمَةِ. وَفِي هَذَا العَرْضِ، يَظْهَرُ دَوْرُ المُعَلِّمِ المِصْرِيِّ القَدِيمِ، الَّذِي كَانَ يُسَمَّى \"الكَاتِبَ\". كَانَ هَذَا الكَاتِبُ يَجْلِسُ فِي وَقَارٍ عَلَى وِسَادَةٍ، وَيَحْمِلُ بِيَدِهِ لَوْحَةً خَشَبِيَّةً وَأَدَوَاتِ الكِتَابَةِ المَصْنُوعَةِ مِنَ الخَشَبِ وَالرِّيشِ. وَكَانَ الكُتَّابُ يُدَوِّنُونَ عُلُومَهُمْ وَأَفْكَارَهُمْ عَلَى أَوْرَاقِ البَرْدِيِّ الَّتِي عُثِرَ عَلَيْهَا لَاحِقًا فِي مَقَابِرِ العُلَمَاءِ. لَقَدْ حَظِيَ الكَاتِبُ بِمَكَانَةٍ عَظِيمَةٍ فِي مُجْتَمَعِهِ، لِأَنَّهُ كَانَ يَنْشُرُ العِلْمَ وَالمَعْرِفَةَ وَيُسْهِمُ فِي بِنَاءِ الحَضَارَةِ وَتَدْوِينِ التَّارِيخِ.",
    
    "lessons.magdi-yacoub.story": "وُلِدَ الدُّكْتُور مَجْدِي يَعْقُوب فِي مِصْرَ، وَكَانَ وَالِدُهُ طَبِيبًا جَرَّاحًا نَاجِحًا. تَعَلَّمَ مَجْدِي مِنْ وَالِدِهِ حُبَّ مُسَاعَدَةِ النَّاسِ وَالتَّعَاطُفَ مَعَ المَرْضَى، فَقَرَّرَ أَنْ يُصْبِحَ طَبِيبًا لِيُعَالِجَ قُلُوبَ الأَطْفَالِ وَالكِبَارِ. سَافَرَ الطَّبِيبُ الشَّابُّ إِلَى بِرِيطَانِيَا لِيَتَعَلَّمَ وَيَكْتَسِبَ الخِبْرَةَ العَالَمِيَّةَ. وَاجْتَهَدَ لِسَنَوَاتٍ طَوِيلَةٍ حَتَّى أَصْبَحَ مِنْ أَشْهَرِ جَرَّاحِي القَلْبِ فِي العَالَمِ، وَحَصَلَ عَلَى لَقَبِ \"سِير\" تَكْرِيمًا لِجُهُودِهِ الإِنْسَانِيَّةِ. وَرَغْمَ شُهْرَتِهِ الكَبِيرَةِ، قَرَّرَ العَوْدَةَ إِلَى مِصْرَ فِي عَامِ أَلْفَيْنِ وَتِسْعَةٍ. وَاخْتَارَ مَدِينَةَ أَسْوَانَ الهَادِئَةَ لِيَبْنِيَ فِيهَا مَرْكَزًا عَالَمِيًّا لِجِرَاحَاتِ القَلْبِ، لِعِلَاجِ المَرْضَى بِالمَلْيُونِ وَبِالمَجَّانِ، وَرَسْمِ البَسْمَةِ عَلَى وُجُوهِ المَرْضَى وَأَطْفَالِ مِصْرَ الطَّيِّبِينَ.",
    
    # Results
    "lessons.ancient-egyptian-teacher.result": "لَقَدْ أَنْهَيْتَ دَرْسَ المُعَلِّمِ المِصْرِيِّ القَدِيمِ بِالكَامِلِ بِنَجَاحٍ وَحَصَلْتَ عَلَى وِسَامِ مُسْتَكْشِفِ الحَضَارَةِ!",
    "lessons.magdi-yacoub.result": "لَقَدْ أَنْهَيْتَ دَرْسَ حِوَارٍ مَعَ الدُّكْتُور مَجْدِي يَعْقُوب بِالكَامِلِ بِنَجَاحٍ وَحَصَلْتَ عَلَى وِسَامِ صَانِعِ الأَمَلِ!"
}

# Word-level vocalizations (will be populated iteratively)
WORD_VOCALIZATIONS = {
    # Pronouns & Particles
    "ما": "مَا",
    "شعورك": "شُعُورُكَ",
    "قبل": "قَبْلَ",
    "حصة": "حِصَّةِ",
    "اللغة": "اللُّغَةِ",
    "العربية": "العَرَبِيَّةِ",
    "اختر": "اِخْتَرِ",
    "الاجابة": "الإِجَابَةَ",
    "الخيار": "الخِيَارَ",
    "الصحيح": "الصَّحِيحَ",
    "الصحيحة": "الصَّحِيحَةَ",
    "أشعر": "أَشْعُرُ",
    "بالحماس": "بِالحَمَاسِ",
    "والرغبة": "وَالرَّغْبَةِ",
    "الدرس": "الدَّرْسِ",
    "بدء": "بَدْءِ",
    "عن": "عَنْ",
    "يعبر": "يُعَبِّرُ",
    "بصدق": "بِصِدْقٍ",
    "مشاعرك": "مَشَاعِرِكَ",
    "الداخلية": "الدَّاخِلِيَّةِ",
    "التعليم": "التَّعْلِيمِ",
    "والكتابة": "وَالكِتَابَةِ",
    "مصر": "مِصْرَ",
    "القديمة": "القَدِيمَةِ",
    "المتحف": "المَتْحَفُ",
    "المصري": "المِصْرِيُّ",
    "مشروعا": "مَشْرُوعًا",
    "كبيرا": "كَبِيرًا",
    "لتطوير": "لِتَطْوِيرِ",
    "القاعة": "القَاعَةِ",
    "التي": "الَّتِي",
    "تعرض": "تَعْرِضُ",
    "تاريخ": "تَارِيخَ",
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
        
        if raw_key in WORD_VOCALIZATIONS:
            vocalized_clean = WORD_VOCALIZATIONS[raw_key]
        else:
            vocalized_clean = clean # Fallback to original
            
        vocalized_words.append(leading_punct + vocalized_clean + trailing_punct)
        
    return " ".join(vocalized_words)

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
        
        if key in SENTENCE_OVERRIDES:
            spoken_text = SENTENCE_OVERRIDES[key]
        else:
            # Re-map shared feedback completions
            if item["category"] == "completion_feedback":
                spoken_text = SENTENCE_OVERRIDES["global.feedback.completion.01"]
            elif item["category"] == "participation_feedback":
                spoken_text = SENTENCE_OVERRIDES["global.feedback.participation.01"]
            else:
                spoken_text = vocalize_sentence(display_text)
                
        # Audit for unvocalized words in the result
        words = spoken_text.split()
        for w in words:
            cw = clean_word(w)
            # If it has no diacritics and is not a number/english/exception
            base = re.sub(r"[\u064b-\u0652\u0670]", "", cw)
            if base and not re.search(r"[\u064b-\u0652\u0670]", cw):
                # Check if it contains only Arabic letters
                if re.match(r"^[\u0621-\u064A\u0670\u06A9\u06AF]+$", base):
                    if base not in {"في", "على", "إلى", "لا", "ما", "يا", "عن", "أم", "أو", "من", "مع", "سير"}:
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
        print("Unvocalized words list (add these to WORD_VOCALIZATIONS):")
        print(sorted(list(unvocalized_words)))

if __name__ == "__main__":
    main()
