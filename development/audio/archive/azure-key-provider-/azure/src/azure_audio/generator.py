import time
import shutil
import json
from datetime import datetime
from pathlib import Path
from . import config
from . import ssml
from . import azure_provider
from . import wav_validation
from . import state
from . import manifest
from . import reports
from . import file_utils

def generate_catalog():
    from .inventory import get_inventory
    inventory = get_inventory()
    st = state.init_state(inventory)
    
    reports.write_progress_report(st, inventory)
    
    # Process identical script caching
    cache_map = {}
    
    for idx, item in enumerate(inventory):
        key = item["semanticKey"]
        item_state = st["items"][key]
        
        if item_state["status"] == "GENERATED":
            continue
            
        print(f"[{idx+1}/{len(inventory)}] Processing {key}...")
        
        arabic_text = item["arabicText"]
        if not arabic_text:
            print(f"  Empty arabic text for {key}, skipping.")
            item_state["status"] = "FAILED_PERMANENT"
            item_state["lastError"] = "Empty arabic text"
            state.save_state(st)
            continue
            
        script_sha256 = item["scriptSha256"]
        config_hash_input = f"{script_sha256}:{config.PROVIDER}:{config.VOICE}:{config.LOCALE}:{config.RATE}:{config.PITCH}:{config.OUTPUT_FORMAT_STR}"
        config_sha256 = file_utils.get_string_sha256(config_hash_input)
        
        item_state["configurationSha256"] = config_sha256
        
        # Check identical script cache
        cache_hit = False
        if config_sha256 in cache_map:
            cached_wav = Path(cache_map[config_sha256])
            if cached_wav.exists():
                print(f"  CACHE_REUSED: Identical script configuration found for {key}")
                target_wav = Path(item["wavPath"])
                target_wav.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(cached_wav, target_wav)
                
                # Update manifest and state
                item_state["status"] = "GENERATED"
                item_state["wavSha256"] = file_utils.get_file_sha256(target_wav)
                _, _, duration = wav_validation.validate_wav(target_wav)
                item_state["durationSeconds"] = duration
                item_state["generatedAt"] = datetime.utcnow().isoformat() + "Z"
                
                manifest_entry = {
                    "src": "/audio/v1/" + Path(item["wavPath"]).relative_to(config.PUBLIC_AUDIO_DIR).as_posix(),
                    "scriptSrc": "/audio/v1/" + Path(item["scriptPath"]).relative_to(config.PUBLIC_AUDIO_DIR).as_posix(),
                    "category": item["category"],
                    "sha256": item_state["wavSha256"],
                    "scriptSha256": script_sha256,
                    "durationSeconds": duration,
                    "provider": config.PROVIDER,
                    "voice": config.VOICE,
                    "locale": config.LOCALE,
                    "generationConfigHash": config_sha256
                }
                manifest.update_manifest_entry(key, manifest_entry)
                state.save_state(st)
                reports.write_progress_report(st, inventory)
                continue
        
        # Need to generate via Azure
        item_state["status"] = "GENERATING"
        state.save_state(st)
        
        ssml_str = ssml.generate_ssml(arabic_text)
        staging_wav = config.STAGING_DIR / f"{key}.wav"
        
        item_state["attemptCount"] += 1
        
        success, error_msg = azure_provider.generate_audio_azure(ssml_str, staging_wav)
        
        if not success:
            print(f"  FAILED: {error_msg}")
            if "429" in error_msg or "RateLimit" in error_msg:
                item_state["status"] = "FAILED_RATE_LIMIT"
            elif "401" in error_msg or "Unauthorized" in error_msg or "AuthenticationFailure" in error_msg:
                item_state["status"] = "FAILED_AUTH"
            else:
                item_state["status"] = "FAILED_TRANSIENT"
            item_state["lastError"] = error_msg
            state.save_state(st)
            
            if item_state["status"] == "FAILED_AUTH":
                print("Authentication failed. Stopping generation.")
                break
                
            # Basic backoff if rate limited
            if item_state["status"] == "FAILED_RATE_LIMIT":
                print("Rate limited. Pausing for 5 seconds...")
                time.sleep(5)
            continue
            
        # Validation
        is_valid, val_err, duration = wav_validation.validate_wav(staging_wav)
        if not is_valid:
            print(f"  VALIDATION FAILED: {val_err}")
            item_state["status"] = "FAILED_PERMANENT"
            item_state["lastError"] = f"Validation failed: {val_err}"
            state.save_state(st)
            continue
            
        # Atomic replace
        target_wav = Path(item["wavPath"])
        target_wav.parent.mkdir(parents=True, exist_ok=True)
        staging_wav.replace(target_wav)
        
        # Cache for reuse
        cache_map[config_sha256] = str(target_wav)
        
        # Update manifest and state
        item_state["status"] = "GENERATED"
        item_state["wavSha256"] = file_utils.get_file_sha256(target_wav)
        item_state["durationSeconds"] = duration
        item_state["generatedAt"] = datetime.utcnow().isoformat() + "Z"
        item_state["lastError"] = None
        
        manifest_entry = {
            "src": "/audio/v1/" + target_wav.relative_to(config.PUBLIC_AUDIO_DIR).as_posix(),
            "scriptSrc": "/audio/v1/" + Path(item["scriptPath"]).relative_to(config.PUBLIC_AUDIO_DIR).as_posix(),
            "category": item["category"],
            "sha256": item_state["wavSha256"],
            "scriptSha256": script_sha256,
            "durationSeconds": duration,
            "provider": config.PROVIDER,
            "voice": config.VOICE,
            "locale": config.LOCALE,
            "generationConfigHash": config_sha256
        }
        manifest.update_manifest_entry(key, manifest_entry)
        state.save_state(st)
        reports.write_progress_report(st, inventory)
        
        print(f"  GENERATED successfully.")
        
        # Be nice to API limits
        time.sleep(0.5)
