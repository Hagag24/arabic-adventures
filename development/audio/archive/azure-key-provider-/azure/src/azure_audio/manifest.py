import json
from typing import Dict, Any
from . import config

def load_manifest() -> Dict[str, Any]:
    if not config.MANIFEST_PATH.exists():
        return {"assets": {}}
    with open(config.MANIFEST_PATH, "r", encoding="utf-8") as f:
        m = json.load(f)
        if "assets" not in m:
            m = {"assets": m}
        return m

def save_manifest(manifest: Dict[str, Any]):
    tmp_path = config.MANIFEST_PATH.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    tmp_path.replace(config.MANIFEST_PATH)

def update_manifest_entry(key: str, data: Dict[str, Any]):
    manifest = load_manifest()
    manifest["assets"][key] = data
    save_manifest(manifest)
