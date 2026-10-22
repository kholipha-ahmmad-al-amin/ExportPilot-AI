import zipfile
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ZIP_OUT = BASE_DIR / "deploy.zip"

INCLUDE_DIRS = ["backend", "scripts", "docs", "frontend/dist", "frontend/public"]
INCLUDE_FILES = ["requirements.txt", "exportpilot.db"]

with zipfile.ZipFile(ZIP_OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    # Include standalone files
    for f in INCLUDE_FILES:
        p = BASE_DIR / f
        if p.exists():
            print(f"Adding file: {f}")
            zf.write(p, arcname=f)

    # Include directories
    for d in INCLUDE_DIRS:
        dp = BASE_DIR / d
        if dp.exists():
            for root, dirs, files in os.walk(dp):
                for file in files:
                    full_path = Path(root) / file
                    # Skip pyc, cache
                    if "__pycache__" in str(full_path) or file.endswith(".pyc"):
                        continue
                    rel_path = full_path.relative_to(BASE_DIR)
                    print(f"Adding: {rel_path}")
                    zf.write(full_path, arcname=str(rel_path))

print(f"Deploy zip successfully created at: {ZIP_OUT} (Size: {ZIP_OUT.stat().st_size} bytes)")
