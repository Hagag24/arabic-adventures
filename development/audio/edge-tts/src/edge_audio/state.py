import json
from typing import Dict, Any
from . import config


def load_state() -> Dict[str, Any]:
    if not config.STATE_FILE.exists():
        return {"items": {}}
    with open(config.STATE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_state(state: Dict[str, Any]):
    tmp_path = config.STATE_FILE.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
    tmp_path.replace(config.STATE_FILE)


def init_state(inventory_items: list[Dict[str, Any]]) -> Dict[str, Any]:
    state = load_state()
    if "items" not in state:
        state["items"] = {}

    for item in inventory_items:
        key = item["semanticKey"]
        if key not in state["items"]:
            state["items"][key] = {
                "semanticKey": key,
                "category": item["category"],
                "scriptPath": item["scriptPath"],
                "stagingWavPath": item["stagingWavPath"],
                "scriptSha256": item["scriptSha256"],
                "configurationSha256": "",
                "wavSha256": "",
                "durationSeconds": 0,
                "attemptCount": 0,
                "generatedAt": None,
                "lastError": None,
                "status": "SCRIPT_READY",
            }
        else:
            if state["items"][key]["status"] == "GENERATING":
                state["items"][key]["status"] = "SCRIPT_READY"

    save_state(state)
    return state
