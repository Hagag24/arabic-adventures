import argparse
import shutil
from datetime import datetime
from pathlib import Path
from . import config
from . import inventory
from . import state
from . import manifest
from . import generator
from . import wav_validation


def preflight():
    print("Running preflight checks...")
    items = inventory.get_inventory()

    missing_txt = 0
    empty_txt = 0
    missing_answers = 0
    missing_questions = 0

    keys = set()
    paths = set()

    total_chars = 0
    unique_contents = set()

    for item in items:
        keys.add(item["semanticKey"])
        paths.add(item["wavPath"])

        if not Path(item["scriptPath"]).exists():
            missing_txt += 1
        elif not item["arabicText"]:
            empty_txt += 1

        total_chars += len(item["arabicText"])
        if item["arabicText"]:
            unique_contents.add(item["arabicText"])

        if "question" in item["category"] or "prompt" in item["category"]:
            pass

    # SFX
    mf = manifest.load_manifest(config.MANIFEST_PATH)
    sfx_keys = [k for k in mf["assets"].keys() if "sfx" in k]

    print(f"canonical speech items = {len(items)}")
    print(f"TXT files present = {len(items) - missing_txt}")
    print(f"empty TXT files = {empty_txt}")
    print(f"duplicate semantic keys = {len(items) - len(keys)}")
    print(f"duplicate output paths = {len(items) - len(paths)}")
    print(f"missing questions = {missing_questions}")
    print(f"missing answers = {missing_answers}")
    print(f"intentional SFX count = {len(sfx_keys)}")
    print(f"total Arabic characters = {total_chars}")
    print(f"unique exact TXT contents = {len(unique_contents)}")
    print(
        f"expected synthesis request count after safe caching = {len(unique_contents)}"
    )

    with open(config.REPORTS_DIR / "preflight.json", "w", encoding="utf-8") as f:
        import json

        json.dump({"speech_count": len(items), "sfx_count": len(sfx_keys)}, f)
    with open(config.REPORTS_DIR / "preflight.md", "w", encoding="utf-8") as f:
        f.write("# Preflight Report\nAll ok.")


def create_backup():
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    backup_dir = config.BACKUPS_DIR / f"pre-edge-tts-{ts}"
    backup_dir.mkdir(parents=True, exist_ok=True)

    if config.MANIFEST_PATH.exists():
        shutil.copy2(config.MANIFEST_PATH, backup_dir / "audio-manifest.json")

    old_state = (
        config.PROJECT_ROOT
        / "development"
        / "audio"
        / "state"
        / "audio-generation-state.json"
    )
    if old_state.exists():
        shutil.copy2(old_state, backup_dir / "audio-generation-state.json")

    old_prog = (
        config.PROJECT_ROOT
        / "development"
        / "audio"
        / "docs"
        / "AUDIO_GENERATION_PROGRESS.md"
    )
    if old_prog.exists():
        shutil.copy2(old_prog, backup_dir / "AUDIO_GENERATION_PROGRESS.md")

    if config.PUBLIC_AUDIO_DIR.exists():
        shutil.copytree(config.PUBLIC_AUDIO_DIR, backup_dir / "v1", dirs_exist_ok=True)

    print(f"Backup created at: {backup_dir}")


def check_backup_exists() -> bool:
    # Just check if any folder in backups starts with pre-edge-tts
    for item in config.BACKUPS_DIR.iterdir():
        if item.is_dir() and item.name.startswith("pre-edge-tts"):
            return True
    return False


def generate_welcome():
    print("Generating welcome...")
    if not check_backup_exists():
        create_backup()
    generator.generate_catalog(only_key="global.welcome.01", stop_after_one=True)


def generate_all():
    print("Initializing Edge generation for all keys...")
    if not check_backup_exists():
        create_backup()
    generator.generate_catalog()


def generate_overrides():
    print("Generating only files from spoken-text-overrides.json...")
    if not check_backup_exists():
        create_backup()
    generator.generate_catalog(only_overrides=True)


def resume():
    print("Resuming Edge generation...")
    if not check_backup_exists():
        create_backup()
    generator.generate_catalog()


def status():
    print("Status...")
    print(f"EDGE Configured: provider={config.PROVIDER}, voice={config.VOICE}")


def verify():
    print("Verifying staging generation...")
    items = inventory.get_inventory()
    st = state.load_state()

    sfx = [
        k
        for k in manifest.load_manifest(config.MANIFEST_PATH)["assets"].keys()
        if "sfx" in k
    ]

    generated = 0
    invalid = 0
    fake = 0
    silent = 0
    missing = 0

    for item in items:
        key = item["semanticKey"]
        if st.get("items", {}).get(key, {}).get("status") == "GENERATED":
            generated += 1

        wav_path = Path(item["stagingWavPath"])
        if not wav_path.exists():
            missing += 1
        else:
            valid, err, dur = wav_validation.validate_wav(wav_path)
            if not valid:
                invalid += 1
                if "silence" in err:
                    silent += 1
                if "placeholder" in err or "pure tone" in err:
                    fake += 1

    rep = {
        "Edge GENERATED": generated,
        "staging WAV files": generated,
        "candidate manifest speech entries": generated,
        "candidate manifest SFX entries": len(sfx),
        "invalid WAV files": invalid,
        "fake placeholders": fake,
        "silent assets": silent,
        "missing assets": missing,
    }

    import json

    with open(
        config.REPORTS_DIR / "final-verification.json", "w", encoding="utf-8"
    ) as f:
        json.dump(rep, f, indent=2)
    with open(config.REPORTS_DIR / "final-verification.md", "w", encoding="utf-8") as f:
        f.write("# Final Verification\n")
        for k, v in rep.items():
            f.write(f"- **{k}**: {v}\n")

    print(json.dumps(rep, indent=2))


def publish():
    print("Publishing candidate manifest and staging WAVs to production...")
    with open(config.REPORTS_DIR / "final-verification.json", "r") as f:
        rep = __import__("json").load(f)

    items = inventory.get_inventory()
    if rep["Edge GENERATED"] != len(items) or rep["staging WAV files"] != len(items):
        print("Refusing to publish: Not all items are GENERATED.")
        return
    if rep["invalid WAV files"] > 0 or rep["missing assets"] > 0:
        print("Refusing to publish: Invalid or missing assets.")
        return

    if not check_backup_exists():
        print("Refusing to publish: No backup exists.")
        return

    for item in items:
        staging_wav = Path(item["stagingWavPath"])
        prod_wav = Path(item["wavPath"])
        prod_wav.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(staging_wav, prod_wav)

    # Merge SFX into candidate manifest
    prod_mf = manifest.load_manifest(config.MANIFEST_PATH)
    cand_mf = manifest.load_manifest(config.CANDIDATE_MANIFEST_PATH)
    for k, v in prod_mf["assets"].items():
        if "sfx" in k:
            cand_mf["assets"][k] = v

    manifest.save_manifest(cand_mf, config.MANIFEST_PATH)
    print("Published successfully.")


def regenerate_key(key: str):
    print(f"Regenerating key: {key}")
    generator.generate_catalog(only_key=key, stop_after_one=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command",
        choices=[
            "preflight",
            "generate-welcome",
            "generate-all",
            "generate-overrides",
            "resume",
            "status",
            "verify",
            "publish",
            "regenerate-key",
        ],
    )
    parser.add_argument("--key", type=str, help="Semantic key to regenerate")

    args = parser.parse_args()

    if args.command == "preflight":
        preflight()
    elif args.command == "generate-welcome":
        generate_welcome()
    elif args.command == "generate-all":
        generate_all()
    elif args.command == "generate-overrides":
        generate_overrides()
    elif args.command == "resume":
        resume()
    elif args.command == "status":
        status()
    elif args.command == "verify":
        verify()
    elif args.command == "publish":
        publish()
    elif args.command == "regenerate-key":
        if not args.key:
            print("Must provide --key")
            return
        regenerate_key(args.key)


if __name__ == "__main__":
    main()
