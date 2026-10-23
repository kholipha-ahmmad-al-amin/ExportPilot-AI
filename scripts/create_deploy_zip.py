import zipfile
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ZIP_OUT = BASE_DIR / "deploy.zip"

INCLUDE_DIRS = ["backend", "scripts", "frontend/dist", "frontend/public"]
INCLUDE_FILES = ["requirements.txt"]
FORBIDDEN_SUFFIXES = {".db", ".sqlite", ".sqlite3"}
FORBIDDEN_NAMES = {".env", "exportpilot.db"}

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
                    relative = full_path.relative_to(BASE_DIR)
                    # Keep local documentation, credentials, and database files out of releases.
                    if (
                        "__pycache__" in relative.parts
                        or ".git" in relative.parts
                        or file.endswith(".pyc")
                        or file.lower() in FORBIDDEN_NAMES
                        or full_path.suffix.lower() in FORBIDDEN_SUFFIXES
                        or any(part.lower().startswith(".env") for part in relative.parts)
                    ):
                        continue
                    if relative.parts[0].lower() == "docs":
                        continue
                    print(f"Adding: {relative}")
                    zf.write(full_path, arcname=relative.as_posix())

with zipfile.ZipFile(ZIP_OUT, "r") as zf:
    archive_names = zf.namelist()
    leaked_files = [
        name for name in archive_names
        if name.lower().startswith("docs/")
        or Path(name).suffix.lower() in FORBIDDEN_SUFFIXES
        or Path(name).name.lower() in FORBIDDEN_NAMES
        or any(part.lower().startswith(".env") for part in Path(name).parts)
    ]
    if leaked_files:
        raise RuntimeError(f"Deployment archive contains local-only files: {leaked_files}")

print(f"Deploy zip successfully created at: {ZIP_OUT} (Size: {ZIP_OUT.stat().st_size} bytes)")
