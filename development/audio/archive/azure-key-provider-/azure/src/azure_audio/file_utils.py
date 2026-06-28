import hashlib
from pathlib import Path
import json

def get_file_sha256(filepath: Path) -> str:
    if not filepath.exists():
        return ""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_string_sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()
