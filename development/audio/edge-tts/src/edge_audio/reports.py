import json
from datetime import datetime
from . import config


def write_progress_report(state: dict, inventory: list):
    counts = {
        "GENERATED": 0,
        "SCRIPT_READY": 0,
        "FAILED_RATE_LIMIT": 0,
        "FAILED_NETWORK": 0,
        "FAILED_VALIDATION": 0,
        "FAILED_PERMANENT": 0,
        "REGENERATION_REQUIRED": 0,
        "GENERATING": 0,
    }

    total = len(inventory)

    for item in inventory:
        key = item["semanticKey"]
        st = state["items"].get(key, {}).get("status", "SCRIPT_READY")
        counts[st] = counts.get(st, 0) + 1

    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total": total,
        "counts": counts,
    }

    with open(config.REPORTS_DIR / "progress.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    md = "# Edge TTS Generation Progress\n\n"
    md += f"*Updated at: {report['timestamp']}*\n\n"
    md += f"- **Total Speech**: {total}\n"
    for k, v in counts.items():
        md += f"- **{k}**: {v}\n"

    with open(config.REPORTS_DIR / "progress.md", "w", encoding="utf-8") as f:
        f.write(md)
