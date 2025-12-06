#!/usr/bin/env python3
"""
Sync frontend-accessible data files from data/ to public/data/
This script ensures frontend can access the training data files.
"""

import os
import shutil
from pathlib import Path

# Get project root directory (parent of utils/)
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent

# Files that should be synced from data/ to public/data/
FRONTEND_DATA_FILES = [
    'course_finetune.jsonl',
    'course_finetune_kg_rag.jsonl',
    'spring_2026_courses.csv',  # For frontend CSV exploration
    'bulletin_courses.csv',     # For frontend CSV exploration
]

def sync_data_files():
    """Copy frontend-accessible files from data/ to public/data/"""
    data_dir = PROJECT_ROOT / 'data'
    public_data_dir = PROJECT_ROOT / 'public' / 'data'
    
    # Ensure public/data directory exists
    public_data_dir.mkdir(parents=True, exist_ok=True)
    
    synced_files = []
    skipped_files = []
    
    for filename in FRONTEND_DATA_FILES:
        source = data_dir / filename
        destination = public_data_dir / filename
        
        if source.exists():
            shutil.copy2(source, destination)
            synced_files.append(filename)
            print(f"✓ Synced {filename}")
        else:
            skipped_files.append(filename)
            print(f"⚠ Skipped {filename} (not found in data/)")
    
    print("\n" + "="*60)
    print("📦 DATA SYNC SUMMARY")
    print("="*60)
    print(f"Synced files: {len(synced_files)}")
    for f in synced_files:
        print(f"  • {f}")
    
    if skipped_files:
        print(f"\nSkipped files (not found): {len(skipped_files)}")
        for f in skipped_files:
            print(f"  • {f}")
    
    print("="*60)
    print("✅ Sync complete! Frontend can now access the updated files.")
    print("="*60)

if __name__ == "__main__":
    sync_data_files()
