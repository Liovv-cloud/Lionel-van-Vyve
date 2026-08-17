#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_skills.py
=====================================================================
Lit "ORDRE SITE WEB/12B- SKILLS (logo)/skills.txt", VÉRIFIE sur le
disque quelle image existe réellement pour chaque outil (dans le
sous-dossier de sa catégorie), et exporte automatiquement
js/skills-data.js.

Vous n'avez normalement RIEN À FAIRE ici : js/skills.js lit déjà
skills.txt directement dans le navigateur (fetch au chargement de la
page) — éditer le .txt puis rafraîchir la page (F5) suffit pour voir
vos changements sur le site, même sans lancer ce script.

Ce script est appelé automatiquement par "mettre_a_jour_site.bat" en
même temps que generate_manifest.py et generate_journey.py ; il sert
uniquement de sauvegarde/export statique de skills.txt, au cas où.
Vous pouvez aussi le lancer seul : "python generate_skills.py".

FORMAT DE skills.txt :
  "## NOM_FR | NOM_EN | NOM_NL | ICONE"   -> nouvelle catégorie
  "NOM | NIVEAU | DESC_FR | DESC_EN | DESC_NL"  -> un outil de cette
                                                    catégorie
  Voir LISEZ-MOI.txt pour le détail.

IMAGES :
  Pour chaque outil "NOM", le script cherche dans le sous-dossier de
  sa catégorie (NOM_FR) un fichier nommé "NOM.png", puis "NOM.jpg",
  ".jpeg", ".webp" (recherche insensible à la casse). La première
  trouvée est utilisée. Si aucune n'existe, l'outil n'a pas d'image
  (le site affichera une pastille avec l'initiale à la place).
=====================================================================
"""

import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILLS_ROOT = SCRIPT_DIR / "ORDRE SITE WEB" / "12B- SKILLS (logo)"
SKILLS_TXT = SKILLS_ROOT / "skills.txt"
OUTPUT_FILE = SCRIPT_DIR / "js" / "skills-data.js"

# Préfixe utilisé dans le HTML/JS pour construire les chemins d'image
BASE_ICON_PATH = "ORDRE SITE WEB/12B- SKILLS (logo)"

IMAGE_EXTS = ("png", "jpg", "jpeg", "webp")
LEVEL_CODE_RE = re.compile(r"^[ABC][12]$", re.IGNORECASE)


def find_image(folder: Path, name: str):
    """Cherche un fichier <name>.<ext> (insensible à la casse) dans
    `folder`, essaie .png puis .jpg/.jpeg/.webp. Retourne le NOM DE
    FICHIER réel trouvé sur le disque, ou None."""
    if not folder.is_dir():
        return None
    try:
        files = {f.name.lower(): f.name for f in folder.iterdir() if f.is_file()}
    except (PermissionError, FileNotFoundError):
        return None

    for ext in IMAGE_EXTS:
        target = f"{name}.{ext}".lower()
        if target in files:
            return files[target]
    return None


def parse_skills_txt(text: str):
    lines = text.splitlines()
    categories = []
    current = None

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        if line.startswith("##"):
            parts = [p.strip() for p in line[2:].split("|")]
            while len(parts) < 4:
                parts.append("")
            cat_fr, cat_en, cat_nl, icon = parts[:4]
            is_languages = bool(re.search(r"LANGUE|TALEN|LANGUAGE", cat_fr + cat_en, re.IGNORECASE))
            current = {
                "category": {"fr": cat_fr, "en": cat_en or cat_fr, "nl": cat_nl or cat_fr},
                "icon": icon,
                "isLanguages": is_languages,
                "apps": [],
            }
            categories.append(current)
            continue

        if line.startswith("#"):
            continue  # commentaire
        if current is None:
            continue

        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 5:
            continue
        name, niveau, desc_fr, desc_en, desc_nl = parts[:5]

        folder_name = current["category"]["fr"]
        folder = SKILLS_ROOT / folder_name
        found_file = find_image(folder, name)
        img = f"{BASE_ICON_PATH}/{folder_name}/{found_file}" if found_file else None

        is_level_code = bool(LEVEL_CODE_RE.match(niveau))
        current["apps"].append({
            "name": name,
            "level": niveau,
            "isLevelCode": is_level_code,
            "stars": 0 if is_level_code else (int(niveau) if niveau.isdigit() else 0),
            "img": img,
            "desc": {"fr": desc_fr, "en": desc_en, "nl": desc_nl},
        })

    return categories


def main():
    if not SKILLS_TXT.is_file():
        print(f"[ERREUR] Fichier introuvable : {SKILLS_TXT}")
        print('Vérifiez que ce script est bien placé à la racine du site,')
        print('au même niveau que le dossier "ORDRE SITE WEB".')
        sys.exit(1)

    text = SKILLS_TXT.read_text(encoding="utf-8", errors="replace")
    categories = parse_skills_txt(text)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    js_content = (
        "// Fichier généré automatiquement par generate_skills.py\n"
        "// NE PAS MODIFIER À LA MAIN — éditez skills.txt puis relancez\n"
        "// mettre_a_jour_site.bat à la place.\n"
        "window.SKILLS_DATA = "
        + json.dumps(categories, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUTPUT_FILE.write_text(js_content, encoding="utf-8")

    total_apps = sum(len(c["apps"]) for c in categories)
    missing_imgs = [
        f"{c['category']['fr']} / {a['name']}"
        for c in categories for a in c["apps"] if a["img"] is None
    ]

    print("=" * 70)
    print("Export skills.txt -> js/skills-data.js terminé.")
    print(f"  Catégories trouvées : {len(categories)}")
    print(f"  Outils trouvés      : {total_apps}")
    print(f"  Fichier écrit       : {OUTPUT_FILE}")
    print("=" * 70)
    if missing_imgs:
        print("\n[INFO] Aucune image trouvée pour ces outils (pastille avec")
        print("initiale affichée à la place sur le site) :")
        for m in missing_imgs:
            print(f"  - {m}")
    print()
    print("Rappel : skills.txt est aussi lu directement par le site (F5")
    print("suffit) — ce fichier exporté n'est qu'une sauvegarde statique.")


if __name__ == "__main__":
    main()
