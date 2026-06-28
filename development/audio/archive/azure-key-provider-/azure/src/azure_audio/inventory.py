import json
import subprocess
from pathlib import Path
from typing import Dict, Any, List
from . import config
from . import file_utils

def get_inventory() -> List[Dict[str, Any]]:
    script = "import { audioScripts } from './src/audio/content/audio-script-index.ts'; console.log(JSON.stringify(audioScripts));"
    res = subprocess.check_output(["pnpm.cmd", "exec", "tsx", "-e", script], cwd=str(config.PROJECT_ROOT))
    
    # stdout may contain package manager logs, so extract the json part
    out_str = res.decode("utf-8")
    start = out_str.find("[")
    end = out_str.rfind("]")
    if start == -1 or end == -1:
        raise ValueError("Failed to parse inventory JSON from TSX")
        
    raw_inventory = json.loads(out_str[start:end+1])
    
    inventory = []
    for item in raw_inventory:
        semantic_key = item.get("semanticKey") or item.get("key")
        rel_path = item.get("relativeBasePath")
        if not rel_path:
            continue
        script_path = str(config.PUBLIC_AUDIO_DIR / f"{rel_path}.txt")
        wav_path = str(config.PUBLIC_AUDIO_DIR / f"{rel_path}.wav")
        
        # Determine actual script path and read it
        txt_path_obj = Path(script_path)
        arabic_text = ""
        script_sha256 = ""
        
        if txt_path_obj.exists():
            with open(txt_path_obj, "r", encoding="utf-8") as f:
                arabic_text = f.read().strip()
            script_sha256 = file_utils.get_file_sha256(txt_path_obj)
            
        inventory.append({
            "semanticKey": semantic_key,
            "category": item.get("category"),
            "scriptPath": script_path,
            "wavPath": wav_path,
            "arabicText": arabic_text,
            "scriptSha256": script_sha256,
        })
        
    return inventory
