import json
from typing import Dict, Any
from . import config


def load_manifest(path) -> Dict[str, Any]:
    if not path.exists():
        return {"assets": {}}
    with open(path, "r", encoding="utf-8") as f:
        m = json.load(f)
        if "assets" not in m:
            m = {"assets": m}
        return m


def save_manifest(manifest: Dict[str, Any], path):
    tmp_path = path.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    tmp_path.replace(path)


def update_candidate_manifest_entry(key: str, data: Dict[str, Any]):
    manifest = load_manifest(config.CANDIDATE_MANIFEST_PATH)
    manifest["assets"][key] = data
    save_manifest(manifest, config.CANDIDATE_MANIFEST_PATH)
