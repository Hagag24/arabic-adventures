import os
import sys
import json
import asyncio
import random
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(project_root / "development" / "audio" / "edge-tts" / "src"))

from edge_audio.audio_conversion import convert_mp3_to_wav, normalize_wav_volume, trim_silence
import edge_tts

# 10 representative keys across the required categories
REPRESENTATIVE_KEYS = {
    "welcome": "global.welcome.01",
    "short_instruction": "ancient-egyptian-teacher-arabic-feelings-j1-instruction",
    "long_instruction": "ancient-egyptian-teacher-event-meaning-matching-instruction",
    "question": "ancient-egyptian-teacher-arabic-feelings-j1-prompt",
    "single_answer": "ancient-egyptian-teacher-arabic-feelings-j1-option-happy",
    "difficult_vocabulary_word": "ancient-egyptian-teacher-vocabulary-words-option-scribe",
    "correct_feedback": "global.feedback.correct.01",
    "retry_feedback": "global.feedback.retry.01",
    "matching_instruction": "ancient-egyptian-teacher-synonym-matching-instruction",
    "lesson_completion_message": "lessons.ancient-egyptian-teacher.result"
}

async def generate_candidate(key: str, spoken_text: str, voice: str, rate: str, dest_wav: Path, sem: asyncio.Semaphore):
    async with sem:
        tmp_mp3 = dest_wav.with_suffix(".mp3")
        
        print(f"Generating: key={key}, voice={voice}, rate={rate}")
        
        max_retries = 5
        for attempt in range(max_retries):
            try:
                communicate = edge_tts.Communicate(
                    text=spoken_text,
                    voice=voice,
                    rate=rate,
                    volume="+0%",
                    pitch="+0Hz"
                )
                await communicate.save(str(tmp_mp3))
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"ERROR: Failed to generate {key} after {max_retries} attempts: {e}")
                    raise e
                delay = (2 ** attempt) + random.uniform(0, 1)
                print(f"  [RETRY] Attempt {attempt+1} failed for {key}: {e}. Retrying in {delay:.2f}s...")
                await asyncio.sleep(delay)
                
        success = convert_mp3_to_wav(tmp_mp3, dest_wav)
        if tmp_mp3.exists():
            tmp_mp3.unlink()
            
        if success:
            # Post-process: trim silence with a safe 100ms pad and normalize to -1.0 dBFS
            trim_silence(dest_wav, threshold=100, pad_ms=100)
            normalize_wav_volume(dest_wav, target_peak_db=-1.0)

async def main():
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
        
    overrides_file = project_root / "development" / "audio" / "edge-tts" / "spoken-text-overrides.json"
    if not overrides_file.exists():
        print("Error: spoken-text-overrides.json not found. Run vocalize_catalog.py first.")
        sys.exit(1)
        
    with open(overrides_file, "r", encoding="utf-8") as f:
        overrides = json.load(f)
        
    staging_dir = project_root / "development" / "audio" / "staging" / "narrator_comparison"
    staging_dir.mkdir(parents=True, exist_ok=True)
    
    voices = ["ar-EG-SalmaNeural", "ar-EG-ShakirNeural"]
    rates = ["-5%", "-10%", "-15%"]
    
    print("Generating representative narrator test set...")
    
    sem = asyncio.Semaphore(2) # Max 2 concurrent connections to prevent rate limits
    tasks = []
    
    for cat, key in REPRESENTATIVE_KEYS.items():
        # Check both flat and nested structure
        if key not in overrides:
            print(f"Warning: Key {key} not found in overrides.")
            continue
            
        data = overrides[key]
        spoken_text = data["spokenText"] if isinstance(data, dict) else data
        
        for voice in voices:
            for rate in rates:
                voice_clean = voice.split("-")[-1].replace("Neural", "")
                rate_clean = rate.replace("%", "").replace("-", "minus_")
                
                dest_name = f"{key}_{voice_clean}_{rate_clean}.wav"
                dest_path = staging_dir / dest_name
                
                tasks.append(generate_candidate(key, spoken_text, voice, rate, dest_path, sem))
                
    await asyncio.gather(*tasks)
    print(f"\nSuccessfully generated {len(tasks)} comparison candidates.")
    
    # Generate HTML Comparison Page
    html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مقارنة المعلق الصوتي - مغامرات العربية</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 20px;
        }
        h1 {
            color: #38bdf8;
            margin: 0;
        }
        .subtitle {
            color: #94a3b8;
            margin-top: 10px;
        }
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: #1e293b;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #334155;
        }
        th, td {
            padding: 15px;
            text-align: right;
            border-bottom: 1px solid #334155;
        }
        th {
            background-color: #0f172a;
            color: #38bdf8;
            font-weight: 700;
        }
        .text-display {
            font-size: 16px;
            color: #f1f5f9;
            margin-bottom: 5px;
        }
        .text-spoken {
            font-size: 14px;
            color: #94a3b8;
            font-style: italic;
        }
        .voice-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .player-row {
            display: flex;
            align-items: center;
            gap: 10px;
            background-color: #0f172a;
            padding: 8px;
            border-radius: 6px;
        }
        .player-label {
            font-size: 12px;
            color: #38bdf8;
            width: 50px;
        }
        audio {
            width: 220px;
            height: 30px;
        }
        .category-badge {
            background-color: #0284c7;
            color: #e0f2fe;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>مقارنة الأداء الصوتي ومعدل السرعة</h1>
            <p class="subtitle">استمع وقارن بين صوت المعلمة (Salma) وصوت المعلم (Shakir) بمعدلات سرعة مختلفة</p>
        </header>
        
        <table class="comparison-table">
            <thead>
                <tr>
                    <th style="width: 15%;">الفئة والرمز</th>
                    <th style="width: 35%;">النص المعروض والمنطوق</th>
                    <th style="width: 25%;">المعلمة (Salma)</th>
                    <th style="width: 25%;">المعلم (Shakir)</th>
                </tr>
            </thead>
            <tbody>
"""
    
    for cat, key in REPRESENTATIVE_KEYS.items():
        if key not in overrides:
            continue
            
        data = overrides[key]
        display_text = data["displayText"] if isinstance(data, dict) else key
        spoken_text = data["spokenText"] if isinstance(data, dict) else data
        
        html_content += f"""
                <tr>
                    <td>
                        <span class="category-badge">{cat.replace('_', ' ').title()}</span>
                        <div style="font-size: 11px; color: #64748b; margin-top: 5px; font-family: monospace;">{key}</div>
                    </td>
                    <td>
                        <div class="text-display">{display_text}</div>
                        <div class="text-spoken">المنطوق: {spoken_text}</div>
                    </td>
                    <td>
                        <div class="voice-section">
                            <div class="player-row">
                                <span class="player-label">سرعة -5%</span>
                                <audio controls src="{key}_Salma_minus_5.wav"></audio>
                            </div>
                            <div class="player-row">
                                <span class="player-label">سرعة -10%</span>
                                <audio controls src="{key}_Salma_minus_10.wav"></audio>
                            </div>
                            <div class="player-row">
                                <span class="player-label">سرعة -15%</span>
                                <audio controls src="{key}_Salma_minus_15.wav"></audio>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="voice-section">
                            <div class="player-row">
                                <span class="player-label">سرعة -5%</span>
                                <audio controls src="{key}_Shakir_minus_5.wav"></audio>
                            </div>
                            <div class="player-row">
                                <span class="player-label">سرعة -10%</span>
                                <audio controls src="{key}_Shakir_minus_10.wav"></audio>
                            </div>
                            <div class="player-row">
                                <span class="player-label">سرعة -15%</span>
                                <audio controls src="{key}_Shakir_minus_15.wav"></audio>
                            </div>
                        </div>
                    </td>
                </tr>
"""
        
    html_content += """
            </tbody>
        </table>
    </div>
</body>
</html>
"""
    
    output_html = staging_dir / "comparison.html"
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"\nComparison HTML page generated at:")
    print(output_html)

if __name__ == "__main__":
    asyncio.run(main())
