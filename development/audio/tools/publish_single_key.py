import os
import sys
import json
import shutil
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print("Usage: python publish_single_key.py <key>")
        sys.exit(1)
        
    key = sys.argv[1]
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    
    # Paths
    candidate_manifest_path = project_root / "development" / "audio" / "edge-tts" / "staging" / "audio-manifest.edge.candidate.json"
    production_manifest_path = project_root / "public" / "audio" / "v1" / "audio-manifest.json"
    
    if not candidate_manifest_path.exists():
        print(f"Error: Candidate manifest not found at {candidate_manifest_path}")
        sys.exit(1)
        
    if not production_manifest_path.exists():
        print(f"Error: Production manifest not found at {production_manifest_path}")
        sys.exit(1)
        
    # Load manifests
    with open(candidate_manifest_path, "r", encoding="utf-8") as f:
        candidate_manifest = json.load(f)
        
    with open(production_manifest_path, "r", encoding="utf-8") as f:
        production_manifest = json.load(f)
        
    candidate_assets = candidate_manifest.get("assets", {})
    production_assets = production_manifest.get("assets", {})
    
    if key not in candidate_assets:
        print(f"Error: Key '{key}' not found in candidate manifest.")
        sys.exit(1)
        
    asset_info = candidate_assets[key]
    relative_src = asset_info.get("src").lstrip("/") # e.g. "audio/v1/global/welcome/01.wav"
    
    # Staging WAV path
    # Staging catalog is at development/audio/edge-tts/staging/catalog
    # The relative path from catalog matches the src part after audio/v1/
    # e.g. src is /audio/v1/global/welcome/01.wav -> relative is global/welcome/01.wav
    catalog_rel_path = relative_src.replace("audio/v1/", "")
    staging_wav = project_root / "development" / "audio" / "edge-tts" / "staging" / "catalog" / catalog_rel_path
    production_wav = project_root / "public" / relative_src
    
    if not staging_wav.exists():
        print(f"Error: Staging WAV file not found at {staging_wav}")
        sys.exit(1)
        
    # Copy file
    print(f"Copying {staging_wav.name} to {production_wav}...")
    production_wav.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(staging_wav, production_wav)
    
    # Update production manifest entry
    production_assets[key] = asset_info
    production_manifest["assets"] = production_assets
    
    # Save production manifest
    with open(production_manifest_path, "w", encoding="utf-8") as f:
        json.dump(production_manifest, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully published key '{key}' and updated production manifest.")

if __name__ == "__main__":
    main()
