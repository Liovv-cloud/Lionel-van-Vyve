#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_manifest.py
=====================================================================
Scanne le dossier "ORDRE SITE WEB/12C - PROJETS" et régénère
automatiquement js/projects-manifest.js, le fichier que le site lit
pour savoir quelles images (et quels liens vidéo) afficher.

Ce script est nécessaire car le navigateur ne peut pas lister seul
les fichiers d'un dossier — contrairement au Parcours et aux
Compétences, qui se lisent directement depuis leurs .txt. Il est
appelé automatiquement par "mettre_a_jour_site.bat", en même temps
que generate_journey.py et generate_skills.py.

À LANCER À CHAQUE FOIS que vous ajoutez, renommez ou enlevez un
dossier de projet, ou une image (.png / .jpg / .jpeg / .webp) dedans,
ou un .txt de lien vidéo. Le site n'a plus besoin d'être modifié à la
main — ni pour les images, ni pour la liste des dossiers/catégories.

RÈGLES APPLIQUÉES (automatiquement, aucune exception) :
  - Tout dossier nommé "NON" (quelle que soit la casse : non, Non...)
    est totalement ignoré, lui et tout son contenu, à n'importe quel
    niveau de profondeur.
  - Seuls les fichiers dont le nom COMMENCE par un chiffre et se
    termine par .png/.jpg/.jpeg/.webp sont pris en compte
    (ex: "0.png", "3. excel.jpg", "11.chaine de traitement.png").
  - Les fichiers dont le nom contient un suffixe de copie Windows du
    type "(1)", "(2)"... (ex: "2 (1).png") sont ignorés — seule
    l'image d'origine compte.
  - Les fichiers sont triés numériquement (0,1,2,...,10,11...), pas
    alphabétiquement.
  - Si un fichier "{N}.txt" existe à côté de l'image "{N}.xxx" (même
    numéro), son contenu est lu et le premier lien http(s) trouvé
    dedans est utilisé comme lien vidéo YouTube pour cette image.
  - Chaque dossier de catégorie ("1_GEOMATIQUE", "2_SURVEY", ...) est
    scanné pour ses sous-dossiers directs (hors "NON") : chacun
    devient un projet, avec pour titre le nom du dossier SANS le
    préfixe "AAAA_" (ex: "2025_ANALYSE SPATIALE" -> "ANALYSE
    SPATIALE"). Un dossier de projet sans image reste invisible sur
    le site (comportement existant, inchangé).
  - Dans chaque catégorie, les projets sont triés par année décrois-
    sante (le préfixe "AAAA_" du nom de dossier), du plus récent au
    plus ancien. Les dossiers sans année en préfixe sont placés à la
    fin, dans l'ordre où ils apparaissent sur le disque.
  - Le titre, l'année et le tri sont 100% automatiques. Le tag et la
    description (FR/EN/NL) affichés sur chaque carte restent à
    éditer à la main dans js/projects.js, dans la table
    PROJECT_OVERRIDES (par chemin de dossier) — le script ne les
    touche jamais.

UTILISATION :
  1) Placez ce script à la racine du site (à côté de "index.html"
     et du dossier "ORDRE SITE WEB").
  2) Double-cliquez sur "mettre_a_jour_site.bat" (ou lancez
     "python generate_manifest.py" dans un terminal).
  3) C'est tout : js/projects-manifest.js est régénéré, images ET
     structure des dossiers/catégories incluses.
=====================================================================
"""

import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent

# Dossier racine des projets sur le disque (relatif à ce script)
PROJECTS_ROOT = SCRIPT_DIR / "ORDRE SITE WEB" / "12C - PROJETS"

# Où écrire le fichier généré que le site charge
OUTPUT_FILE = SCRIPT_DIR / "js" / "projects-manifest.js"

# Préfixe utilisé dans le HTML/JS pour construire les chemins d'image
# (doit correspondre à ROOT_PREFIX dans js/projects.js)
ROOT_PREFIX = "ORDRE SITE WEB/12C - PROJETS/"

IMAGE_EXT = ("png", "jpg", "jpeg", "webp")
IMAGE_RE = re.compile(r"^(\d+).*\.(?:" + "|".join(IMAGE_EXT) + r")$", re.IGNORECASE)
DUPLICATE_RE = re.compile(r"\(\d+\)")  # ex: "2 (1).png" -> copie Windows, à ignorer
URL_RE = re.compile(r"https?://\S+")

# Nom de dossier de projet -> (année, titre sans le préfixe "AAAA_")
YEAR_PREFIX_RE = re.compile(r"^(\d{4})_(.+)$")

# ---------------------------------------------------------------------


def find_link_for(folder: Path, number_str: str):
    """Cherche un fichier '{N}.txt' (avec ou sans zéro initial) et
    retourne le premier lien http(s) trouvé dedans, sinon None."""
    candidates = [f"{number_str}.txt"]
    try:
        n_int = int(number_str)
        candidates.append(f"{n_int}.txt")
    except ValueError:
        pass

    for cand in candidates:
        txt_path = folder / cand
        if txt_path.is_file():
            try:
                content = txt_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            m = URL_RE.search(content)
            if m:
                return m.group(0).strip().rstrip(").,;")
    return None


def scan_folder(folder: Path):
    """Retourne la liste triée numériquement des images valides d'un
    dossier (fichiers directs uniquement, pas de récursion)."""
    entries = []
    for item in folder.iterdir():
        if not item.is_file():
            continue
        m = IMAGE_RE.match(item.name)
        if not m:
            continue
        if DUPLICATE_RE.search(item.name):
            # Copie Windows du type "2 (1).png" -> on ignore, seule
            # l'image d'origine "2.png" compte.
            continue
        number_str = m.group(1)
        link = find_link_for(folder, number_str)
        entries.append(
            {
                "file": item.name,
                "num": int(number_str),
                "link": link,
            }
        )
    entries.sort(key=lambda e: (e["num"], e["file"].lower()))
    for e in entries:
        del e["num"]
    return entries


def walk(root: Path):
    """Parcourt récursivement l'arborescence en excluant TOUT dossier
    nommé 'NON' (insensible à la casse), et retourne un manifeste
    {chemin_relatif_posix: [ {file, link}, ... ]} pour chaque dossier
    contenant au moins une image numérotée valide."""
    manifest = {}
    skipped_non = []

    def _walk(current: Path):
        try:
            subdirs = [d for d in current.iterdir() if d.is_dir()]
        except (PermissionError, FileNotFoundError):
            return

        kept_subdirs = []
        for d in subdirs:
            if d.name.strip().lower() == "non":
                skipped_non.append(d.relative_to(root).as_posix())
                continue
            kept_subdirs.append(d)

        images = scan_folder(current)
        if images:
            rel = current.relative_to(root).as_posix()
            manifest[rel] = images

        for d in kept_subdirs:
            _walk(d)

    _walk(root)
    return manifest, skipped_non


def parse_year_title(folder_name: str):
    """'2025_ANALYSE SPATIALE' -> (2025, 'ANALYSE SPATIALE').
    Pas de préfixe année reconnu -> (None, nom_du_dossier_tel_quel)."""
    m = YEAR_PREFIX_RE.match(folder_name)
    if m:
        return int(m.group(1)), m.group(2)
    return None, folder_name


def build_structure(root: Path, manifest: dict):
    """Reconstruit, à partir des dossiers de catégorie présents sur le
    disque, la liste ordonnée des projets par catégorie :
        { "1_GEOMATIQUE": [ {"folder": "...", "title": "...",
                              "year": 2025 or None}, ... ], ... }
    Seuls les dossiers de projet qui ont effectivement des images
    (donc présents dans `manifest`) sont inclus, pour que le site
    masque toujours automatiquement les dossiers vides — exactement
    comme avant. Le tri se fait par année décroissante ; les dossiers
    sans année en préfixe passent en dernier, dans leur ordre
    d'apparition sur le disque."""
    structure = {}
    try:
        category_dirs = [d for d in root.iterdir() if d.is_dir()]
    except (PermissionError, FileNotFoundError):
        return structure

    for cat_dir in sorted(category_dirs, key=lambda d: d.name):
        if cat_dir.name.strip().lower() == "non":
            continue
        try:
            project_dirs = [d for d in cat_dir.iterdir() if d.is_dir()]
        except (PermissionError, FileNotFoundError):
            continue

        entries = []
        for order, proj_dir in enumerate(project_dirs):
            if proj_dir.name.strip().lower() == "non":
                continue
            rel = proj_dir.relative_to(root).as_posix()
            if rel not in manifest:
                # Dossier sans image valide : reste invisible sur le
                # site, comme avant. On ne l'ajoute pas à la structure.
                continue
            year, title = parse_year_title(proj_dir.name)
            entries.append(
                {
                    "folder": rel,
                    "title": title,
                    "year": year,
                    "_order": order,
                }
            )

        entries.sort(
            key=lambda e: (
                0 if e["year"] is not None else 1,
                -(e["year"] or 0),
                e["_order"],
            )
        )
        for e in entries:
            del e["_order"]

        if entries:
            structure[cat_dir.name] = entries

    return structure


def main():
    if not PROJECTS_ROOT.is_dir():
        print(f"[ERREUR] Dossier introuvable : {PROJECTS_ROOT}")
        print("Vérifiez que ce script est bien placé à la racine du site,")
        print('au même niveau que le dossier "ORDRE SITE WEB".')
        sys.exit(1)

    manifest, skipped_non = walk(PROJECTS_ROOT)
    structure = build_structure(PROJECTS_ROOT, manifest)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    js_content = (
        "// Fichier généré automatiquement par generate_manifest.py\n"
        "// NE PAS MODIFIER À LA MAIN — relancez le script à la place.\n"
        "window.PROJECTS_MANIFEST = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n\n"
        "// Structure auto-détectée : catégories -> projets (dossier, titre,\n"
        "// année), déjà triée par année décroissante. js/projects.js s'en\n"
        "// sert pour construire les cartes automatiquement ; le tag et la\n"
        "// description de chaque projet restent définis à la main dans\n"
        "// PROJECT_OVERRIDES (js/projects.js).\n"
        "window.PROJECTS_STRUCTURE = "
        + json.dumps(structure, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUTPUT_FILE.write_text(js_content, encoding="utf-8")

    total_images = sum(len(v) for v in manifest.values())
    total_links = sum(1 for v in manifest.values() for e in v if e["link"])
    total_projects = sum(len(v) for v in structure.values())
    known_categories = {
        "1_GEOMATIQUE", "2_SURVEY", "3_ARCHITECTURE",
        "4_VIDEO", "5_MUSEE", "6_RECHERCHE",
    }
    unknown_categories = [c for c in structure if c not in known_categories]

    print("=" * 70)
    print("Mise à jour terminée.")
    print(f"  Dossiers de projet détectés : {len(manifest)}")
    print(f"  Images/photos trouvées      : {total_images}")
    print(f"  Liens vidéo détectés (.txt) : {total_links}")
    print(f"  Dossiers 'NON' ignorés      : {len(skipped_non)}")
    print(f"  Catégories détectées        : {len(structure)}")
    print(f"  Projets listés (avec image) : {total_projects}")
    print(f"  Fichier écrit               : {OUTPUT_FILE}")
    print("=" * 70)
    if unknown_categories:
        print(
            "\n[INFO] Nouvelle(s) catégorie(s) détectée(s) sans icône/couleur "
            "définie (fallback générique utilisé) :"
        )
        for c in unknown_categories:
            print(f"  - {c}")
        print(
            "  -> Ajoutez-la à CATEGORY_META dans js/projects.js pour lui "
            "donner une icône, une couleur et un nom propres."
        )
    if manifest:
        print("\nDétail par dossier :")
        for k in sorted(manifest):
            n_link = sum(1 for e in manifest[k] if e["link"])
            extra = f" ({n_link} lien(s) vidéo)" if n_link else ""
            print(f"  - {k} : {len(manifest[k])} image(s){extra}")
    if structure:
        print("\nOrdre des projets par catégorie (le plus récent en premier) :")
        for cat in sorted(structure):
            print(f"  {cat} :")
            for e in structure[cat]:
                year_txt = e["year"] if e["year"] is not None else "?"
                print(f"    - [{year_txt}] {e['title']}")


if __name__ == "__main__":
    main()
