import fnmatch
import json
import os
from pathlib import Path
from zipfile import ZipFile
with open("manifest_v3.json") as f:
    manifest = json.load(f)
    version = manifest["version"]

IGNORE_FILES = [
    "icons/icon512.png",
    "docs/*",
    ".gitignore",
    ".git/*",
    "README.md",
    "build/*",
    "manifest_*",
    "build.py",
    ".DS_Store"
]

def ignore_file(file: Path):
    if file.is_dir():
        return True
    for ignore in IGNORE_FILES:
        if fnmatch.fnmatch(str(file), ignore):
            return True
    

os.makedirs("build", exist_ok=True)
with ZipFile(f"build/sc-filter-{version}-mv2.zip", "w") as zip:
    files = [file for file in Path(".").rglob("*") if not ignore_file(file)]
    for file in files:
        zip.write(file)
    with open("manifest_v2.json") as f:
        zip.writestr("manifest.json", f.read())
with ZipFile(f"build/sc-filter-{version}-mv3.zip", "w") as zip:
    files = [file for file in Path(".").rglob("*") if not ignore_file(file)]
    for file in files:
        zip.write(file)
    with open("manifest_v3.json") as f:
        zip.writestr("manifest.json", f.read())
    