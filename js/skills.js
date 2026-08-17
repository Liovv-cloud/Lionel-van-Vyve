/* ================================================================
   SKILLS.JS — Panel Compétences et Outils
   Mock device responsive (ordinateur sur desktop, téléphone sur mobile)
   Écran d'accueil = dossiers façon iOS (aperçu 2×2 des apps à l'intérieur)
   Clic sur un dossier → il s'ouvre en grand et affiche toutes les apps
   ================================================================ */

const BASE_ICON_PATH = "ORDRE SITE WEB/12B- SKILLS (logo)";

// Emplacement du fichier texte modifiable qui pilote ce panneau : catégories,
// outils, niveau (étoiles ou CECRL) et descriptions FR/EN/NL. Aucun script à
// relancer : sauvegardez le .txt et rafraîchissez la page.
const SKILLS_DATA_URL = `${BASE_ICON_PATH}/skills.txt`;

// Extensions essayées dans l'ordre pour retrouver l'image de chaque outil,
// dans "12B- SKILLS (logo)/<categorie>/<NOM_OUTIL>.<ext>"
const SKILLS_IMG_EXTS = ["png", "jpg", "jpeg", "webp"];

// Icônes "9_ME CONTACTER" : au clic, la popup affiche directement l'adresse
// / le numéro (au lieu de la description générique du fichier skills.txt).
const SKILLS_CONTACT_INFO = {
  GMAIL: "lionelvvpro@gmail.com",
  TELEPHONE: "+32 451 08 35 82"
};

let SKILLS_DATA = [];

/* ── Charge et parse skills.txt : toujours une lecture fraîche depuis le
   disque, à CHAQUE ouverture du panneau (pas seulement au premier chargement
   de la page) — cache:'no-store' + horodatage anti-cache navigateur. Ainsi,
   modifier skills.txt ou ajouter une image, puis rouvrir le panneau (même
   sans recharger toute la page), affiche toujours la version à jour. ── */
function loadSkillsData() {
  return fetch(SKILLS_DATA_URL + "?t=" + Date.now(), { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(txt => {
      SKILLS_DATA = parseSkillsTxt(txt);
      return SKILLS_DATA;
    })
    .catch(err => {
      console.error("Impossible de charger skills.txt :", err);
      SKILLS_DATA = [];
      return SKILLS_DATA;
    });
}

/* ── Parse le format texte "## CAT_FR | CAT_EN | CAT_NL | ICONE" +
     lignes "NOM | NIVEAU | DESC_FR | DESC_EN | DESC_NL" ── */
function parseSkillsTxt(text) {
  const lines = text.split(/\r?\n/);
  const categories = [];
  let current = null;

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) return;

    if (line.startsWith("##")) {
      const parts = line.slice(2).split("|").map(s => s.trim());
      const [catFr, catEn, catNl, icon] = parts;
      const isLanguages = /LANGUE|TALEN|LANGUAGE/i.test(catFr || catEn || "");
      current = {
        category: { fr: catFr || "", en: catEn || catFr || "", nl: catNl || catFr || "" },
        icon: icon || "",
        isLanguages,
        apps: []
      };
      categories.push(current);
      return;
    }

    if (line.startsWith("#")) return; // ligne de commentaire
    if (!current) return;             // ligne avant la 1ère catégorie : ignorée

    const parts = line.split("|").map(s => s.trim());
    if (parts.length < 5) return;
    const [name, niveau, descFr, descEn, descNl] = parts;
    const folder = current.category.fr;
    current.apps.push({
      name: name,
      level: niveau,
      isLevelCode: !/^\d+$/.test(niveau), // ex: "B2" plutôt qu'un chiffre 1-5
      stars: /^\d+$/.test(niveau) ? parseInt(niveau, 10) : 0,
      img: buildSkillImgCandidates(folder, name),
      desc: { fr: descFr || "", en: descEn || "", nl: descNl || "" }
    });
  });

  return categories;
}

/* ── Construit la liste des chemins d'image à essayer, dans l'ordre ── */
function buildSkillImgCandidates(folder, name) {
  return SKILLS_IMG_EXTS.map(ext => `${BASE_ICON_PATH}/${folder}/${name}.${ext}`);
}

/* ── Applique un <img> avec repli automatique sur les extensions suivantes,
     puis sur une pastille avec l'initiale si aucune image n'est trouvée ── */
function setImgWithFallback(img, candidates, name, onAllFailed) {
  let i = 0;
  img.src = candidates[i];
  img.onerror = () => {
    i++;
    if (i < candidates.length) {
      img.src = candidates[i];
    } else if (typeof onAllFailed === "function") {
      onAllFailed();
    }
  };
}


/* ── Stars renderer ── */
function renderStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/* ── Niveau affiché : étoiles pour un score 1-5, badge CECRL (A1→C2) sinon ── */
function renderLevel(app) {
  return app.isLevelCode ? app.level.toUpperCase() : renderStars(app.stars);
}

/* ── Nom de dossier : enlève un préfixe "3_" éventuel ──
   Si les catégories sont un jour renommées "1_GIS & Geography",
   "2_3D Point Clouds", etc. (numérotées de 1 à 9, suivies de "_"),
   cette fonction enlève automatiquement le chiffre + le tiret bas
   pour l'affichage, et le chiffre sert à trier les dossiers. ── */
function stripFolderPrefix(label) {
  return (label || '').replace(/^\s*\d+\s*_\s*/, '').trim();
}
function folderOrderNumber(cat, fallbackIndex) {
  const raw = (cat.category && (cat.category.en || cat.category.fr || cat.category.nl)) || '';
  const m = /^\s*(\d+)\s*_/.exec(raw);
  return m ? parseInt(m[1], 10) : (1000 + fallbackIndex);
}

/* ── Init Panel ── */
function initSkillsPanel() {
  const overlay     = document.getElementById('skillsOverlay');
  if (!overlay) return;

  const closeBtn    = document.getElementById('skillsClose');
  const screenEl    = document.getElementById('skillsScreen');
  const device      = document.getElementById('skillsDevice');
  const tooltip     = document.getElementById('skillsTooltip');
  const ttClose     = document.getElementById('skillsTooltipClose');
  const ttIcon      = document.getElementById('skillsTooltipIcon');
  const ttName      = document.getElementById('skillsTooltipName');
  const ttStars     = document.getElementById('skillsTooltipStars');
  const ttDesc      = document.getElementById('skillsTooltipDesc');

  // Ancienne barre d'onglets : plus utilisée (remplacée par les dossiers)
  const legacyTabs = document.getElementById('skillsTabs');
  if (legacyTabs) legacyTabs.style.display = 'none';

  // Vue "dossier ouvert" : créée dynamiquement si absente du HTML
  let folderView = document.getElementById('skillsFolderView');

  if (!folderView) {
    folderView = document.createElement('div');
    folderView.className = 'skills-folder-view hidden';
    folderView.id = 'skillsFolderView';
    folderView.innerHTML = `
      <div class="skills-folder-view-backdrop" id="skillsFolderBackdrop"></div>
      <div class="skills-folder-panel" id="skillsFolderPanel">
        <div class="skills-folder-panel-header">
          <span class="skills-folder-panel-icon" id="skillsFolderPanelIcon"></span>
          <span class="skills-folder-panel-title" id="skillsFolderTitle"></span>
          <button class="skills-folder-panel-close" id="skillsFolderBackClose" aria-label="Close folder">✕</button>
        </div>
        <div class="skills-folder-panel-grid" id="skillsFolderGrid"></div>
      </div>
    `;
    device.appendChild(folderView);
  }

  const folderTitle      = document.getElementById('skillsFolderTitle');
  const folderGrid       = document.getElementById('skillsFolderGrid');
  const folderBackClose  = document.getElementById('skillsFolderBackClose');
  const folderPanelIcon  = document.getElementById('skillsFolderPanelIcon');
  const folderBackdrop   = document.getElementById('skillsFolderBackdrop');

  let activeCategory = null; // null = écran d'accueil (dossiers)
  let orderedIndices = [];

  function getLang() {
    return document.body.getAttribute('data-lang') || 'fr';
  }

  function computeOrder() {
    orderedIndices = SKILLS_DATA.map((cat, i) => i);
    orderedIndices.sort((a, b) => {
      return folderOrderNumber(SKILLS_DATA[a], a) - folderOrderNumber(SKILLS_DATA[b], b);
    });
  }

  /* ── Écran d'accueil : grille de dossiers façon iOS ── */
  function buildFolders() {
    const lang = getLang();
    computeOrder();
    screenEl.innerHTML = '';
    screenEl.classList.add('skills-home');

    orderedIndices.forEach(i => {
      const cat = SKILLS_DATA[i];
      const label = stripFolderPrefix(cat.category[lang] || cat.category.fr);

      const folder = document.createElement('div');
      folder.className = 'skills-folder';

      const iconWrap = document.createElement('div');
      iconWrap.className = 'skills-folder-icon';

      const preview = document.createElement('div');
      preview.className = 'skills-folder-preview';

      const previewApps = cat.apps.slice(0, 4);
      previewApps.forEach(app => {
        const mini = document.createElement('div');
        mini.className = 'skills-folder-mini';
        const img = document.createElement('img');
        img.alt = app.name;
        setImgWithFallback(img, app.img, app.name, () => {
          img.style.display = 'none';
          mini.classList.add('skills-folder-mini-fallback');
          mini.textContent = app.name.charAt(0);
        });
        mini.appendChild(img);
        preview.appendChild(mini);
      });
      // Complète à 4 cases si moins de 4 apps (grille régulière comme iOS)
      for (let k = previewApps.length; k < 4; k++) {
        const empty = document.createElement('div');
        empty.className = 'skills-folder-mini skills-folder-mini-empty';
        preview.appendChild(empty);
      }

      iconWrap.appendChild(preview);

      const folderLabel = document.createElement('span');
      folderLabel.className = 'skills-folder-label';
      folderLabel.textContent = label;

      folder.appendChild(iconWrap);
      folder.appendChild(folderLabel);

      folder.addEventListener('click', () => openFolder(i));
      screenEl.appendChild(folder);
    });
  }

  /* ── Ouvrir un dossier : affiche toutes les apps qu'il contient ── */
  function openFolder(i) {
    activeCategory = i;
    buildFolderContent();
    folderView.classList.remove('hidden');
    requestAnimationFrame(() => folderView.classList.add('open'));
  }

  function buildFolderContent() {
    if (activeCategory === null) return;
    const lang = getLang();
    const cat = SKILLS_DATA[activeCategory];

    folderPanelIcon.textContent = cat.icon || '';
    folderTitle.textContent = stripFolderPrefix(cat.category[lang] || cat.category.fr);
    folderGrid.innerHTML = '';

    cat.apps.forEach(app => {
      const cell = document.createElement('div');
      cell.className = 'skills-app';

      const img = document.createElement('img');
      img.className = 'skills-app-icon';
      img.alt = app.name;
      setImgWithFallback(img, app.img, app.name, () => {
        img.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'skills-app-icon-fallback';
        fallback.textContent = app.name.charAt(0);
        cell.insertBefore(fallback, cell.firstChild);
      });

      const label = document.createElement('span');
      label.className = 'skills-app-label';
      label.textContent = app.name;

      const stars = document.createElement('span');
      stars.className = app.isLevelCode ? 'skills-app-stars skills-app-level-badge' : 'skills-app-stars';
      stars.textContent = renderLevel(app);

      cell.appendChild(img);
      cell.appendChild(label);
      cell.appendChild(stars);

      cell.addEventListener('click', () => showTooltip(app));
      folderGrid.appendChild(cell);
    });
  }

  /* ── Fermer le dossier : retour à l'écran d'accueil ── */
  function closeFolder() {
    folderView.classList.remove('open');
    setTimeout(() => {
      folderView.classList.add('hidden');
      activeCategory = null;
    }, 280);
  }

  folderBackClose.addEventListener('click', closeFolder);
  folderBackdrop.addEventListener('click', closeFolder);

  function showTooltip(app) {
    const lang = getLang();
    ttIcon.innerHTML = '';
    const img = document.createElement('img');
    img.alt = app.name;
    setImgWithFallback(img, app.img, app.name, () => { img.style.display = 'none'; });
    ttIcon.appendChild(img);
    ttName.textContent = app.name;
    ttStars.textContent = renderLevel(app);
    ttStars.className = app.isLevelCode ? 'skills-tooltip-stars skills-app-level-badge' : 'skills-tooltip-stars';

    const contactValue = SKILLS_CONTACT_INFO[app.name.toUpperCase()];
    if (contactValue) {
      ttDesc.innerHTML = '';
      const link = document.createElement('a');
      link.className = 'skills-tooltip-contact-link';
      link.href = app.name.toUpperCase() === 'GMAIL' ? `mailto:${contactValue}` : `tel:${contactValue.replace(/\s+/g, '')}`;
      link.textContent = contactValue;
      ttDesc.appendChild(link);
    } else {
      ttDesc.textContent = app.desc[lang] || app.desc.fr;
    }

    tooltip.classList.remove('hidden');
  }

  function hideTooltip() {
    tooltip.classList.add('hidden');
  }

  ttClose.addEventListener('click', hideTooltip);
  tooltip.addEventListener('click', e => { if (e.target === tooltip) hideTooltip(); });

  function openPanel() {
    activeCategory = null;
    folderView.classList.remove('open');
    folderView.classList.add('hidden');
    screenEl.innerHTML = '<div class="skills-loading">…</div>';
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
    document.body.classList.add('skills-open');

    loadSkillsData().then(() => buildFolders());
  }

  function closePanel() {
    overlay.classList.remove('visible');
    overlay.classList.add('hidden');
    document.body.classList.remove('skills-open');
    hideTooltip();
    folderView.classList.remove('open');
    folderView.classList.add('hidden');
    activeCategory = null;
  }

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });

  // Rebuild on language change
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!overlay.classList.contains('hidden')) {
        setTimeout(() => {
          buildFolders();
          if (activeCategory !== null) buildFolderContent();
        }, 50);
      }
    });
  });

  window.openSkillsPanel = openPanel;
}

document.addEventListener('DOMContentLoaded', initSkillsPanel);
