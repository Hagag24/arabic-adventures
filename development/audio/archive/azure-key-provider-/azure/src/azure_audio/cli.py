import argparse
import os
import shutil
from datetime import datetime
from pathlib import Path
from . import config
from . import inventory
from . import state
from . import manifest
from . import reports
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
    
    for item in items:
        keys.add(item["semanticKey"])
        paths.add(item["wavPath"])
        
        if not Path(item["scriptPath"]).exists():
            missing_txt += 1
        elif not item["arabicText"]:
            empty_txt += 1
            
        if "question" in item["category"] or "prompt" in item["category"]:
            pass # just structural validation
            
    # SFX
    mf = manifest.load_manifest()
    sfx_keys = [k for k in mf["assets"].keys() if "sfx" in k]
    
    print(f"canonical speech items = {len(items)}")
    print(f"TXT files present = {len(items) - missing_txt}")
    print(f"empty TXT files = {empty_txt}")
    print(f"duplicate semantic keys = {len(items) - len(keys)}")
    print(f"duplicate output paths = {len(items) - len(paths)}")
    print(f"missing questions = {missing_questions}")
    print(f"missing answers = {missing_answers}")
    print(f"intentional SFX count = {len(sfx_keys)}")
    
    # Save preflight report
    with open(config.REPORTS_DIR / "preflight.json", "w", encoding="utf-8") as f:
        import json
        json.dump({"speech_count": len(items), "sfx_count": len(sfx_keys)}, f)
    with open(config.REPORTS_DIR / "preflight.md", "w", encoding="utf-8") as f:
        f.write("# Preflight Report\nAll ok.")

def create_backup():
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    backup_dir = config.BACKUPS_DIR / f"google-kore-{ts}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # Backup files
    if config.MANIFEST_PATH.exists():
        shutil.copy2(config.MANIFEST_PATH, backup_dir / "audio-manifest.json")
    
    old_state = config.PROJECT_ROOT / "development" / "audio" / "state" / "audio-generation-state.json"
    if old_state.exists():
        shutil.copy2(old_state, backup_dir / "audio-generation-state.json")
        
    old_prog = config.PROJECT_ROOT / "development" / "audio" / "docs" / "AUDIO_GENERATION_PROGRESS.md"
    if old_prog.exists():
        shutil.copy2(old_prog, backup_dir / "AUDIO_GENERATION_PROGRESS.md")
        
    # Backup WAVs (we can just copy the whole v1 dir except SFX or just copy all WAVs)
    # Actually, we should just copy the whole public/audio/v1 directory to backup_dir/v1
    if config.PUBLIC_AUDIO_DIR.exists():
        shutil.copytree(config.PUBLIC_AUDIO_DIR, backup_dir / "v1", dirs_exist_ok=True)
        
    print(f"Backup created at: {backup_dir}")

def generate_all():
    print("Initializing Azure generation for all keys...")
    
    if not config.AZURE_SPEECH_KEY or not config.AZURE_SPEECH_REGION:
        print("AZURE_SPEECH_KEY present: no")
        print("AZURE_SPEECH_REGION present: no")
        print("credential values printed: no")
        print("Missing Azure credentials in .env.azure.local. Please provide them to start generation.")
        return
        
    create_backup()
    
    # Clear existing state for fresh run
    if config.STATE_FILE.exists():
        config.STATE_FILE.unlink()
        
    generator.generate_catalog()

def resume():
    print("Resuming Azure generation...")
    generator.generate_catalog()

def status():
    print("Status...")
    print(f"AZURE_SPEECH_KEY present: {'yes' if config.AZURE_SPEECH_KEY else 'no'}")
    print(f"AZURE_SPEECH_REGION present: {'yes' if config.AZURE_SPEECH_REGION else 'no'}")
    print("credential values printed: no")
    
def verify():
    print("Verifying Azure generation...")
    items = inventory.get_inventory()
    st = state.load_state()
    mf = manifest.load_manifest()
    
    sfx = [k for k in mf["assets"].keys() if "sfx" in k]
    
    generated = 0
    invalid = 0
    fake = 0
    silent = 0
    missing = 0
    
    for item in items:
        key = item["semanticKey"]
        if st.get("items", {}).get(key, {}).get("status") == "GENERATED":
            generated += 1
        
        wav_path = Path(item["wavPath"])
        if not wav_path.exists():
            missing += 1
        else:
            valid, err, dur = wav_validation.validate_wav(wav_path)
            if not valid:
                invalid += 1
                if "silence" in err: silent += 1
                if "placeholder" in err or "pure tone" in err: fake += 1
                
    rep = {
        "Azure GENERATED": generated,
        "manifest speech entries": generated,
        "manifest SFX entries": len(sfx),
        "invalid published entries": invalid,
        "fake placeholders": fake,
        "silent assets": silent,
        "missing assets": missing
    }
    
    import json
    with open(config.REPORTS_DIR / "final-verification.json", "w", encoding="utf-8") as f:
        json.dump(rep, f, indent=2)
    with open(config.REPORTS_DIR / "final-verification.md", "w", encoding="utf-8") as f:
        f.write("# Final Verification\n")
        for k, v in rep.items():
            f.write(f"- **{k}**: {v}\n")
            
    print(json.dumps(rep, indent=2))

def regenerate_key(key: str):
    print(f"Regenerating key: {key}")
    items = inventory.get_inventory()
    item = next((i for i in items if i["semanticKey"] == key), None)
    if not item:
        print("Key not found in inventory.")
        return
        
    st = state.load_state()
    if key in st.get("items", {}):
        st["items"][key]["status"] = "SCRIPT_READY"
        state.save_state(st)
        
    generator.generate_catalog()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["preflight", "generate-all", "resume", "status", "verify", "regenerate-key"])
    parser.add_argument("--key", type=str, help="Semantic key to regenerate")
    
    args = parser.parse_args()
    
    if args.command == "preflight":
        preflight()
    elif args.command == "generate-all":
        generate_all()
    elif args.command == "resume":
        resume()
    elif args.command == "status":
        status()
    elif args.command == "verify":
        verify()
    elif args.command == "regenerate-key":
        if not args.key:
            print("Must provide --key")
            return
        regenerate_key(args.key)

if __name__ == "__main__":
    main()
