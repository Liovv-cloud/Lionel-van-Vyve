#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_journey.py
=====================================================================
Lit "ORDRE SITE WEB/12A -JOURNEY/journey.txt" et exporte
automatiquement js/journey-data.js.

Vous n'avez normalement RIEN À FAIRE ici : js/journey.js lit déjà
journey.txt directement dans le navigateur (fetch au chargement de
la page) — éditer le .txt puis rafraîchir la page (F5) suffit pour
voir vos changements sur le site, même sans lancer ce script.

Ce script est appelé automatiquement par "mettre_a_jour_site.bat" en
même temps que generate_manifest.py et generate_skills.py ; il sert
uniquement de sauvegarde/export statique de journey.txt, au cas où.
Vous pouvez aussi le lancer seul : "python generate_journey.py".

FORMAT DE journey.txt :
  Chaque expérience commence par une ligne "### identifiant" suivie
  de ses champs "CLE: valeur" (un champ par ligne). Voir LISEZ-MOI.txt
  pour le détail des champs.
=====================================================================
"""

import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
JOURNEY_TXT = SCRIPT_DIR / "ORDRE SITE WEB" / "12A -JOURNEY" / "journey.txt"
OUTPUT_FILE = SCRIPT_DIR / "js" / "journey-data.js"

VALID_CATEGORIES = {"VOLONTARIAT", "PROFESSIONNEL", "EDUCATION"}


def parse_journey_txt(text: str):
    lines = text.splitlines()
    raw_entries = []
    current = None

    for raw_line in lines:
        line = raw_line.strip()

        if line.startswith("### "):
            if current:
                raw_entries.append(current)
            current = {"id": line[4:].strip(), "fields": {}}
            continue

        if current is None:
            continue
        if not line or line.startswith("#"):
            continue

        sep = line.find(":")
        if sep == -1:
            continue
        key = line[:sep].strip().upper()
        value = line[sep + 1:].strip()
        current["fields"][key] = value

    if current:
        raw_entries.append(current)

    entries = []
    for e in raw_entries:
        if not e["id"]:
            continue
        f = e["fields"]
        category = (f.get("CATEGORIE") or "PROFESSIONNEL").upper()
        if category not in VALID_CATEGORIES:
            category = "PROFESSIONNEL"

        try:
            lat = float(f.get("LAT", "0") or "0")
        except ValueError:
            lat = 0.0
        try:
            lon = float(f.get("LON", "0") or "0")
        except ValueError:
            lon = 0.0

        entries.append({
            "id": e["id"],
            "category": category,
            "lat": lat,
            "lon": lon,
            "date": f.get("DATE", ""),
            "location": {
                "fr": f.get("LIEU_FR", ""),
                "en": f.get("LIEU_EN", ""),
                "nl": f.get("LIEU_NL", ""),
            },
            "year": {
                "fr": f.get("PERIODE_FR", ""),
                "en": f.get("PERIODE_EN", ""),
                "nl": f.get("PERIODE_NL", ""),
            },
            "title": {
                "fr": f.get("TITRE_FR", ""),
                "en": f.get("TITRE_EN", ""),
                "nl": f.get("TITRE_NL", ""),
            },
            "desc": {
                "fr": f.get("DESC_FR", ""),
                "en": f.get("DESC_EN", ""),
                "nl": f.get("DESC_NL", ""),
            },
        })

    # Plus récent en premier
    entries.sort(key=lambda x: x["date"], reverse=True)
    return entries


def main():
    if not JOURNEY_TXT.is_file():
        print(f"[ERREUR] Fichier introuvable : {JOURNEY_TXT}")
        print('Vérifiez que ce script est bien placé à la racine du site,')
        print('au même niveau que le dossier "ORDRE SITE WEB".')
        sys.exit(1)

    text = JOURNEY_TXT.read_text(encoding="utf-8", errors="replace")
    entries = parse_journey_txt(text)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    js_content = (
        "// Fichier généré automatiquement par generate_journey.py\n"
        "// NE PAS MODIFIER À LA MAIN — éditez journey.txt puis relancez\n"
        "// mettre_a_jour_site.bat à la place.\n"
        "window.JOURNEY_DATA = "
        + json.dumps(entries, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUTPUT_FILE.write_text(js_content, encoding="utf-8")

    by_cat = {}
    for e in entries:
        by_cat[e["category"]] = by_cat.get(e["category"], 0) + 1

    print("=" * 70)
    print(f"Export terminé : {OUTPUT_FILE}")
    print(f"  Expériences trouvées : {len(entries)}")
    for cat in ("VOLONTARIAT", "PROFESSIONNEL", "EDUCATION"):
        print(f"    - {cat} : {by_cat.get(cat, 0)}")
    print()
    print("Rappel : journey.txt est aussi lu directement par le site (F5")
    print("suffit) — ce fichier exporté n'est qu'une sauvegarde statique.")
    print("=" * 70)


if __name__ == "__main__":
    main()
