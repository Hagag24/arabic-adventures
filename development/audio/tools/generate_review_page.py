import os
import sys
import json
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(project_root / "development" / "audio" / "edge-tts" / "src"))

from edge_audio.inventory import get_inventory

def main():
    inventory = get_inventory()
    
    # Load production manifest
    manifest_path = project_root / "public" / "audio" / "v1" / "audio-manifest.json"
    if not manifest_path.exists():
        print("Error: Production manifest not found.")
        sys.exit(1)
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    assets = manifest.get("assets", {})
    
    # Load overrides to show spoken text accurately
    overrides_file = project_root / "development" / "audio" / "edge-tts" / "spoken-text-overrides.json"
    overrides = {}
    if overrides_file.exists():
        with open(overrides_file, "r", encoding="utf-8") as f:
            overrides = json.load(f)
            
    from edge_audio.pronunciation import prepare_arabic_speech_text
    
    html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مراجعة الصوتيات - مغامرات العربية</title>
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
            max-width: 1200px;
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
        .stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background-color: #1e293b;
            padding: 10px 20px;
            border-radius: 8px;
            border: 1px solid #334155;
        }
        .stat-val {
            font-size: 20px;
            font-weight: bold;
            color: #38bdf8;
        }
        .category-section {
            margin-bottom: 40px;
            background-color: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #334155;
        }
        .category-title {
            color: #38bdf8;
            font-size: 22px;
            border-bottom: 1px solid #334155;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .audio-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 20px;
        }
        .audio-card {
            background-color: #0f172a;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #1e293b;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }
        .audio-info {
            flex: 1;
        }
        .audio-key {
            font-family: monospace;
            color: #38bdf8;
            font-size: 14px;
        }
        .text-display {
            font-size: 18px;
            margin: 8px 0;
            color: #f1f5f9;
        }
        .text-spoken {
            font-size: 16px;
            color: #94a3b8;
            margin-bottom: 5px;
        }
        .meta-tags {
            display: flex;
            gap: 10px;
            font-size: 12px;
            color: #64748b;
        }
        .tag {
            background-color: #1e293b;
            padding: 2px 8px;
            border-radius: 4px;
        }
        .tag.override {
            background-color: #0369a1;
            color: #e0f2fe;
        }
        audio {
            width: 300px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>مراجعة الصوتيات - مغامرات العربية</h1>
            <p class="subtitle">قائمة تشغيل مراجعة الأداء الصوتي الموحد (صوت المعلمة: Salma)</p>
            <div class="stats">
                <div class="stat-card">
                    <div>إجمالي الملفات</div>
                    <div class="stat-val">254</div>
                </div>
                <div class="stat-card">
                    <div>صوت المعلمة</div>
                    <div class="stat-val">ar-EG-SalmaNeural</div>
                </div>
                <div class="stat-card">
                    <div>معدل السرعة</div>
                    <div class="stat-val">-15%</div>
                </div>
            </div>
        </header>
"""
    
    categories_order = [
        "welcome",
        "correct_feedback",
        "retry_feedback",
        "completion_feedback",
        "participation_feedback",
        "instruction",
        "prompt",
        "option",
        "story",
        "result"
    ]
    
    grouped_items = {cat: [] for cat in categories_order}
    for item in inventory:
        cat = item["category"]
        if cat in grouped_items:
            grouped_items[cat].append(item)
            
    for cat in categories_order:
        items = grouped_items[cat]
        if not items:
            continue
            
        html_content += f"""
        <div class="category-section">
            <h2 class="category-title">{cat.replace('_', ' ').title()} ({len(items)} ملف)</h2>
            <div class="audio-list">
"""
        for item in items:
            key = item["semanticKey"]
            display_text = item["arabicText"]
            
            # Spoken text
            if key in overrides:
                spoken_text = overrides[key]
                is_override = True
            else:
                spoken_text = prepare_arabic_speech_text(display_text)
                is_override = False
                
            asset_info = assets.get(key, {})
            duration = asset_info.get("durationSeconds", 0)
            
            # The HTML file is in development/audio/review/review_playlist.html
            # The audio files are in public/audio/v1/...
            # Path relative to HTML is ../../../public/audio/v1/...
            rel_path = item["scriptPath"].replace(str(project_root / "public" / "audio" / "v1") + os.sep, "").replace(".txt", "")
            rel_path = rel_path.replace("\\", "/")
            audio_url = f"../../../public/audio/v1/{rel_path}.wav"
            
            html_content += f"""
                <div class="audio-card">
                    <div class="audio-info">
                        <span class="audio-key">{key}</span>
                        <div class="text-display">النص المعروض: {display_text}</div>
                        <div class="text-spoken">النص المنطوق: {spoken_text}</div>
                        <div class="meta-tags">
                            <span class="tag">المدة: {duration:.3f} ثانية</span>
                            <span class="tag">الصوت: ar-EG-SalmaNeural</span>
                            <span class="tag">السرعة: -15%</span>
                            {"<span class='tag override'>تعديل يدوي</span>" if is_override else ""}
                        </div>
                    </div>
                    <audio controls src="{audio_url}"></audio>
                </div>
"""
        html_content += """
            </div>
        </div>
"""
        
    html_content += """
    </div>
</body>
</html>
"""
    
    review_dir = project_root / "development" / "audio" / "review"
    review_dir.mkdir(parents=True, exist_ok=True)
    
    output_html = review_dir / "review_playlist.html"
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"Review playlist generated successfully at:")
    print(output_html)

if __name__ == "__main__":
    main()
