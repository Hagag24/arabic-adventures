import os
import csv
import json
from pathlib import Path

project_root = Path("D:/arabic-adventures")

def get_git_status(path: Path) -> str:
    # Helper to check git status based on standard ignores
    p_str = str(path.relative_to(project_root)).replace("\\", "/")
    if any(part in p_str.split("/") for part in ["node_modules", ".next", ".venv", "coverage", ".tmp", "temp", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache"]):
        return "IGNORED"
    if p_str.startswith("development/audio/staging") or p_str.startswith("development/audio/review") or p_str.startswith("development/audio/backups"):
        return "IGNORED"
    return "TRACKED"

def classify_file(path: Path):
    rel = path.relative_to(project_root)
    parts = rel.parts
    ext = path.suffix.lower()
    
    # Classifications: PRODUCTION_RUNTIME, APPLICATION_SOURCE, BUILD_CONFIGURATION, DEVELOPMENT_TOOL, TEST_SOURCE, PRODUCTION_ASSET, GENERATED_BUILD_OUTPUT, GENERATED_CACHE, GENERATED_REVIEW_ARTIFACT, BACKUP, LEGACY, DUPLICATE, UNUSED, UNKNOWN
    # Decisions: KEEP, MOVE, DELETE, EXTERNAL_ARCHIVE, MANUAL_REVIEW
    
    if "node_modules" in parts:
        return "GENERATED_CACHE", "DELETE", "Node.js dependency package", "pnpm", "Build & Runtime", "Rebuildable package dependency"
    elif ".next" in parts:
        return "GENERATED_BUILD_OUTPUT", "DELETE", "Next.js build output", "Next.js", "Production deployment", "Generated build artifact"
    elif ".venv" in parts:
        return "GENERATED_CACHE", "DELETE", "Python virtual environment", "Python", "Audio generation", "Rebuildable Python environment"
    elif "coverage" in parts:
        return "GENERATED_CACHE", "DELETE", "Test coverage report", "Vitest", "Development", "Generated test coverage"
    elif "__pycache__" in parts or ext in [".pyc", ".pyo"]:
        return "GENERATED_CACHE", "DELETE", "Python compiled bytecode", "Python", "Runtime", "Generated Python cache"
    elif ".pytest_cache" in parts or ".mypy_cache" in parts or ".ruff_cache" in parts:
        return "GENERATED_CACHE", "DELETE", "Python linter/compiler cache", "Python tools", "Development", "Generated tool cache"
    elif "public" in parts and "audio" in parts and "v1" in parts:
        if "backups" in parts:
            return "BACKUP", "DELETE", "Audio backup before voice unification", "Developer", "None", "Superceded audio backup"
        return "PRODUCTION_ASSET", "KEEP", "Production spoken audio WAV file", "Next.js Runtime", "User audio playback", "Required runtime asset"
    elif "development" in parts and "audio" in parts and "backups" in parts:
        return "BACKUP", "EXTERNAL_ARCHIVE", "Audio backup before voice unification", "Developer", "None", "Superceded audio backup"
    elif "development" in parts and "audio" in parts and "staging" in parts:
        return "GENERATED_REVIEW_ARTIFACT", "DELETE", "Staging WAV file for review", "Developer", "Audio review", "Temporary review audio"
    elif "development" in parts and "audio" in parts and "review" in parts:
        if ext == ".html":
            return "DEVELOPMENT_TOOL", "KEEP", "HTML review playlist generator output", "Developer", "Audio review", "Audio review tool"
        return "GENERATED_REVIEW_ARTIFACT", "DELETE", "Review WAV file", "Developer", "Audio review", "Temporary review audio"
    elif "development" in parts and ("tools" in parts or "scripts" in parts):
        return "DEVELOPMENT_TOOL", "KEEP", "Audio pipeline script or utility", "Developer", "Audio generation & validation", "Pipeline tool"
    elif "src" in parts:
        if "tests" in parts or "test" in parts or ext == ".test.ts" or ext == ".test.tsx":
            return "TEST_SOURCE", "KEEP", "Application unit test file", "Vitest", "Testing", "Unit test suite"
        return "APPLICATION_SOURCE", "KEEP", "Application source code", "Next.js Build", "Application runtime", "Core application code"
    elif "prisma" in parts:
        if ext == ".db":
            return "GENERATED_CACHE", "KEEP", "SQLite database file", "Prisma", "Runtime database", "Application local database"
        return "BUILD_CONFIGURATION", "KEEP", "Prisma database schema & migrations", "Prisma", "Database setup", "Core database config"
    elif len(parts) == 1:
        # Root files
        if ext in [".json", ".js", ".ts", ".yaml", ".lock", ".toml"]:
            return "BUILD_CONFIGURATION", "KEEP", "Project build configuration file", "Build system", "Build & Linting", "Core project configuration"
        elif ext == ".md":
            return "BUILD_CONFIGURATION", "KEEP", "Project documentation", "Developer", "Documentation", "Project readme"
        elif rel.name == ".gitignore" or rel.name == ".env.example" or rel.name == ".env":
            return "BUILD_CONFIGURATION", "KEEP", "Environment or Git configuration", "Git/Runtime", "Configuration", "Core environment config"
            
    return "UNKNOWN", "MANUAL_REVIEW", "Unclassified file", "Unknown", "Unknown", "Unclassified"

def generate_reports():
    reports_dir = project_root / "development" / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    file_inventory = []
    dir_sizes = {}
    total_size = 0
    total_files = 0
    total_dirs = 0
    
    # Traverse project
    for root, dirs, files in os.walk(project_root):
        # Count directories
        total_dirs += len(dirs)
        
        for file in files:
            path = Path(root) / file
            try:
                size = path.stat().st_size
            except Exception:
                size = 0
                
            total_size += size
            total_files += 1
            
            # Accumulate directory sizes (recursively for all parent directories)
            rel_dir = path.parent.relative_to(project_root)
            parts = rel_dir.parts
            for i in range(len(parts) + 1):
                p_dir = Path(*parts[:i])
                p_dir_str = str(p_dir).replace("\\", "/")
                if p_dir_str == ".":
                    p_dir_str = "root"
                dir_sizes[p_dir_str] = dir_sizes.get(p_dir_str, 0) + size
                
            # Classify file
            git_status = get_git_status(path)
            classif, decision, purpose, used_by, req_for, reason = classify_file(path)
            
            file_inventory.append({
                "Path": str(path.relative_to(project_root)).replace("\\", "/"),
                "SizeBytes": size,
                "Extension": path.suffix.lower(),
                "GitStatus": git_status,
                "Classification": classif,
                "UsedBy": used_by,
                "Purpose": purpose,
                "RequiredFor": req_for,
                "Regeneratable": "YES" if classif in ["GENERATED_CACHE", "GENERATED_BUILD_OUTPUT", "GENERATED_REVIEW_ARTIFACT"] else "NO",
                "Decision": decision,
                "Reason": reason
            })
            
    # Sort files by size
    sorted_files = sorted(file_inventory, key=lambda x: x["SizeBytes"], reverse=True)
    
    # Sort directories by size
    sorted_dirs = sorted(dir_sizes.items(), key=lambda x: x[1], reverse=True)
    
    import sys
    mode = "before"
    if len(sys.argv) > 1 and sys.argv[1] == "--after":
        mode = "after"
        
    # Write CSV Inventory
    csv_inventory_path = reports_dir / "project-file-inventory.csv"
    with open(csv_inventory_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Path", "SizeBytes", "Extension", "GitStatus", "Classification", "UsedBy", "Purpose", "RequiredFor", "Regeneratable", "Decision", "Reason"])
        writer.writeheader()
        writer.writerows(sorted_files)
        
    # Write Markdown Inventory
    md_inventory_path = reports_dir / "project-file-inventory.md"
    with open(md_inventory_path, "w", encoding="utf-8") as f:
        f.write(f"# Project File Inventory - {mode.capitalize()}\n\n")
        f.write(f"Total Files: {total_files} | Total Size: {total_size / 1024 / 1024:.2f} MB\n\n")
        f.write("| Path | Size (Bytes) | Classification | Decision | Reason |\n")
        f.write("| --- | --- | --- | --- | --- |\n")
        for file in sorted_files[:200]: # Show top 200 files in MD for readability
            f.write(f"| {file['Path']} | {file['SizeBytes']:,} | {file['Classification']} | {file['Decision']} | {file['Reason']} |\n")
        if len(sorted_files) > 200:
            f.write(f"\n... and {len(sorted_files) - 200} more files (see [project-file-inventory.csv](file:///{csv_inventory_path}) for the full list).\n")
            
    # Write Storage Cleanup MD
    md_storage_path = reports_dir / f"storage-{mode}-cleanup.md"
    with open(md_storage_path, "w", encoding="utf-8") as f:
        f.write(f"# Storage Report - {mode.capitalize()} Cleanup\n\n")
        f.write(f"- **Total Project Size**: {total_size:,} Bytes ({total_size / 1024 / 1024:.2f} MB)\n")
        f.write(f"- **Total Files**: {total_files}\n")
        f.write(f"- **Total Directories**: {total_dirs}\n\n")
        
        f.write("## Top 30 Largest Directories\n\n")
        f.write("| Directory Path | Size (MB) | Percentage |\n")
        f.write("| --- | --- | --- |\n")
        for d, s in sorted_dirs[:30]:
            f.write(f"| {d} | {s / 1024 / 1024:.2f} MB | {(s / total_size) * 100:.2f}% |\n")
            
        f.write("\n## Top 100 Largest Files\n\n")
        f.write("| File Path | Size (MB) | Classification | Decision |\n")
        f.write("| --- | --- | --- | --- |\n")
        for file in sorted_files[:100]:
            f.write(f"| {file['Path']} | {file['SizeBytes'] / 1024 / 1024:.2f} MB | {file['Classification']} | {file['Decision']} |\n")
            
    # Write Storage Cleanup CSV
    csv_storage_path = reports_dir / f"storage-{mode}-cleanup.csv"
    with open(csv_storage_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Type", "Path", "SizeBytes", "SizeMB", "Percentage"])
        for d, s in sorted_dirs:
            writer.writerow(["DIRECTORY", d, s, s / 1024 / 1024, (s / total_size) * 100])
        for file in sorted_files:
            writer.writerow(["FILE", file["Path"], file["SizeBytes"], file["SizeBytes"] / 1024 / 1024, (file["SizeBytes"] / total_size) * 100])
            
    print(f"{mode.capitalize()} reports generated successfully:")
    print(f"- {md_storage_path}")
    print(f"- {csv_storage_path}")
    print(f"- {md_inventory_path}")
    print(f"- {csv_inventory_path}")

if __name__ == "__main__":
    generate_reports()
