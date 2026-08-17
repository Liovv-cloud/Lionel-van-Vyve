/* ================================================================
   JOURNEY.JS — Globe Three.js avec marqueurs, zoom, rotation,
   logique de regroupement des expériences par lieu et tooltip interactif.
   ================================================================ */

// BASE DE DONNÉES COMPLÈTE TRILINGUE (33 ÉTAPES)
// BASE DE DONNÉES TRILINGUE — chargée dynamiquement depuis le fichier texte
// modifiable "ORDRE SITE WEB/12A -JOURNEY/journey.txt" (aucun script à
// relancer : sauvegardez le .txt et rafraîchissez la page).
const JOURNEY_DATA_URL = "ORDRE SITE WEB/12A -JOURNEY/journey.txt";

let EXPERIENCES_DATA = [];

// Catégories reconnues dans le champ CATEGORIE du fichier texte
const JOURNEY_CATEGORIES = ["VOLONTARIAT", "PROFESSIONNEL", "EDUCATION"];

/* ── Charge et parse journey.txt : toujours une lecture fraîche depuis le
   disque, à CHAQUE ouverture du panneau (pas seulement au premier chargement
   de la page) — cache:'no-store' + horodatage anti-cache navigateur. Ainsi,
   modifier journey.txt puis rouvrir le panneau (même sans recharger toute
   la page) affiche toujours la version à jour. ── */
function loadJourneyData() {
  return fetch(JOURNEY_DATA_URL + "?t=" + Date.now(), { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(txt => {
      EXPERIENCES_DATA = parseJourneyTxt(txt);
      return EXPERIENCES_DATA;
    })
    .catch(err => {
      console.error("Impossible de charger journey.txt :", err);
      EXPERIENCES_DATA = [];
      return EXPERIENCES_DATA;
    });
}

/* ── Parse le format texte "### id" + "CLE: valeur" ── */
function parseJourneyTxt(text) {
  const lines = text.split(/\r?\n/);
  const rawEntries = [];
  let current = null;

  lines.forEach(rawLine => {
    const line = rawLine.trim();

    if (line.startsWith("### ")) {
      if (current) rawEntries.push(current);
      current = { id: line.slice(4).trim(), fields: {} };
      return;
    }
    if (!current) return;             // texte avant la 1ère entrée : ignoré
    if (!line || line.startsWith("#")) return;  // ligne vide ou commentaire

    const sep = line.indexOf(":");
    if (sep === -1) return;
    const key = line.slice(0, sep).trim().toUpperCase();
    const value = line.slice(sep + 1).trim();
    current.fields[key] = value;
  });
  if (current) rawEntries.push(current);

  const parsed = rawEntries
    .filter(e => e.id)
    .map(e => {
      const f = e.fields;
      let category = (f.CATEGORIE || "PROFESSIONNEL").toUpperCase();
      if (!JOURNEY_CATEGORIES.includes(category)) category = "PROFESSIONNEL";
      return {
        id: e.id,
        category: category,
        lat: parseFloat(f.LAT) || 0,
        lon: parseFloat(f.LON) || 0,
        date: f.DATE || "",
        location: { fr: f.LIEU_FR || "", en: f.LIEU_EN || "", nl: f.LIEU_NL || "" },
        year: { fr: f.PERIODE_FR || "", en: f.PERIODE_EN || "", nl: f.PERIODE_NL || "" },
        title: { fr: f.TITRE_FR || "", en: f.TITRE_EN || "", nl: f.TITRE_NL || "" },
        desc: { fr: f.DESC_FR || "", en: f.DESC_EN || "", nl: f.DESC_NL || "" }
      };
    });

  // Plus récent en premier (comme l'ordre d'origine du site)
  parsed.sort((a, b) => b.date.localeCompare(a.date));
  return parsed;
}

/* ── Lat/Lon → Position 3D sur la surface du globe ── */
function getCorrectedLat(lat) {
  // Offset vertical constant de -20 degrés (décalage vers le bas)
  return lat - 18.5;
}

function getCorrectedLon(lon) {
  // Offset horizontal constant de -4 degrés (décalage vers l'ouest)
  return lon - 4.0;
}

function latLonTo3D(lat, lon, radius) {
  const correctedLat = getCorrectedLat(lat);
  const correctedLon = getCorrectedLon(lon);
  const phi   = (correctedLon + 180) * Math.PI / 180;  // texture mapping
  const theta = (90 - correctedLat) * Math.PI / 180;   // polaire

  return new THREE.Vector3(
    -Math.cos(phi) * Math.sin(theta) * radius,
     Math.cos(theta) * radius,
     Math.sin(phi) * Math.sin(theta) * radius
  );
}

function lonToRotY(lon) {
  // Three.js SphereGeometry mapping correction
  return -(lon + 90) * (Math.PI / 180);
}

/* ──────────────────────────────────────────────────────────────
   Init Panel & Globe
   ────────────────────────────────────────────────────────────── */
function initJourneyPanel() {
  const overlay    = document.getElementById('journeyOverlay');
  if (!overlay) return;

  const closeBtn   = document.getElementById('journeyClose');
  const timelineEl = document.getElementById('journeyTimeline');
  const canvas     = document.getElementById('journeyGlobe');
  const tabButtons = document.querySelectorAll('.journey-tab');

  // Tooltip éléments
  const tooltip    = document.getElementById('globeTooltip');
  const ttHeader   = document.getElementById('globeTooltipHeader');
  const ttBody     = document.getElementById('globeTooltipBody');
  const ttClose    = document.getElementById('globeTooltipClose');

  let activeId       = null;    // Premier élément (le plus récent) par défaut, choisi une fois les données chargées
  let activeCategory = 'ALL';   // 'ALL' | 'VOLONTARIAT' | 'PROFESSIONNEL' | 'EDUCATION'

  /* ── Liste actuellement affichée (toutes ou filtrée par catégorie) ── */
  function getVisibleExperiences() {
    if (activeCategory === 'ALL') return EXPERIENCES_DATA;
    return EXPERIENCES_DATA.filter(e => e.category === activeCategory);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      if (cat === activeCategory) return;
      activeCategory = cat;
      tabButtons.forEach(b => b.classList.toggle('active', b === btn));

      const visible = getVisibleExperiences();
      if (visible.length && !visible.some(e => e.id === activeId)) {
        activeId = visible[0].id;
      }
      buildTimeline();
      addMarkers();
      if (activeId) setActiveExperience(activeId, true);
    });
  });

  // THREE.JS
  let scene, camera, renderer, globeGroup, markers = [];
  let rafId       = null;
  let globeInited = false;

  // Rotation
  let isDragging  = false;
  let prevMouse   = { x: 0, y: 0 };
  let targetRotY  = lonToRotY(4.35); // Bruxelles par défaut
  let currentRotY = targetRotY;
  let targetRotX  = 50.85 * (Math.PI / 180) * 0.65; // Bruxelles latitude
  let currentRotX = targetRotX;
  const ROT_X_MAX = Math.PI * 0.42;
  let floatTime   = 0;

  // Distance fixe du globe (plus éloignée pour garder la courbure 3D visible)
  const GLOBE_DIST = 3.3;
  const GLOBE_RADIUS = 1.15;

  function initGlobe() {
    if (globeInited || !window.THREE) return;
    globeInited = true;

    const wrap = canvas.parentElement;
    const size = Math.max(wrap.getBoundingClientRect().width || 0, 300);
    canvas.width  = size;
    canvas.height = size;

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, GLOBE_DIST);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size, false);
    renderer.setClearColor(0x000000, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 0.4);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Chargement de la carte de texture illustrée continents et couleurs
    const loader = new THREE.TextureLoader();
    loader.load(
      'ORDRE SITE WEB/WEB_OPTIMIZED/12A -continents et couleur.webp',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32);
        const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1.0, metalness: 0.0 });
        const globeMesh = new THREE.Mesh(geo, mat);
        globeGroup.add(globeMesh);

        // Atmosphère légèrement bleutée
        const atmMat = new THREE.MeshBasicMaterial({ color: 0x7ab8d4, transparent: true, opacity: 0.12, side: THREE.BackSide });
        globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 32), atmMat));

        // Marqueurs géographiques groupés
        addMarkers();

        globeGroup.rotation.y = currentRotY;
        globeGroup.rotation.x = currentRotX;
        animate();
      },
      undefined,
      () => {
        // Fallback en cas d'erreur
        const mat = new THREE.MeshStandardMaterial({ color: 0x7ab8d4, roughness: 0.9 });
        globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32), mat));
        addMarkers();
        globeGroup.rotation.y = currentRotY;
        globeGroup.rotation.x = currentRotX;
        animate();
      }
    );

    // Interaction drag souris
    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      targetRotY += (e.clientX - prevMouse.x) * 0.005;
      targetRotX += (e.clientY - prevMouse.y) * 0.005;
      targetRotX  = Math.max(-ROT_X_MAX, Math.min(ROT_X_MAX, targetRotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Clic sur le globe (Raycast/détection de distance du marqueur le plus proche)
    canvas.addEventListener('click', handleGlobeClick);

    // Touch
    canvas.addEventListener('touchstart', e => {
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    canvas.addEventListener('touchmove', e => {
      if (!isDragging) return;
      targetRotY += (e.touches[0].clientX - prevMouse.x) * 0.005;
      targetRotX += (e.touches[0].clientY - prevMouse.y) * 0.005;
      targetRotX  = Math.max(-ROT_X_MAX, Math.min(ROT_X_MAX, targetRotX));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    canvas.addEventListener('touchend', () => { isDragging = false; });
  }

  // ── Raycasting manuel sur les marqueurs ──
  function handleGlobeClick(e) {
    if (!globeGroup) return;

    // Convertit les coords du clic en coordonnées normalisées NDC (-1 à +1)
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // Intersecte avec les meshs enfants de globeGroup
    const intersects = raycaster.intersectObjects(globeGroup.children);
    if (intersects.length === 0) return;

    // Trouve le point d'intersection local sur la sphère
    const intersectPoint = globeGroup.worldToLocal(intersects[0].point.clone());

    // Cherche le marqueur le plus proche du point d'intersection
    let closestMarker = null;
    let minDist = 0.15; // Tolérance de clic (distance 3D)

    markers.forEach(m => {
      const dist = m.localPos.distanceTo(intersectPoint);
      if (dist < minDist) {
        minDist = dist;
        closestMarker = m;
      }
    });

    if (closestMarker) {
      showLocationTooltip(closestMarker);
    } else {
      hideLocationTooltip();
    }
  }

  // ── Regroupement des expériences par pays ──
  function getGroupedLocations() {
    const groups = {};
    getVisibleExperiences().forEach(item => {
      let country = "Belgium"; // par défaut
      const locLower = item.location.en.toLowerCase();
      if (locLower.includes("canada")) country = "Canada";
      else if (locLower.includes("france")) country = "France";
      else if (locLower.includes("portugal")) country = "Portugal";
      else if (locLower.includes("romania")) country = "Romania";
      else if (locLower.includes("togo")) country = "Togo";
      else if (locLower.includes("easter island")) country = "Easter Island";
      else if (locLower.includes("netherlands")) country = "Netherlands";
      else if (locLower.includes("belgium")) country = "Belgium";

      if (!groups[country]) {
        let lat = item.lat;
        let lon = item.lon;

        // Position géographique représentative par pays
        if (country === "Belgium") { lat = 50.85; lon = 4.35; }
        else if (country === "Canada") { lat = 46.81; lon = -71.21; }
        else if (country === "France") { lat = 46.5; lon = 2.5; }
        else if (country === "Portugal") { lat = 39.50; lon = -8.00; }
        else if (country === "Romania") { lat = 45.94; lon = 24.96; }
        else if (country === "Togo") { lat = 8.61; lon = 1.22; }
        else if (country === "Easter Island") { lat = -27.11; lon = -109.35; }
        else if (country === "Netherlands") { lat = 52.13; lon = 5.29; }

        groups[country] = {
          country,
          lat,
          lon,
          items: []
        };
      }
      groups[country].items.push(item);
    });

    // Trie chaque groupe par ordre chronologique inversé (le plus récent d'abord)
    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => b.date.localeCompare(a.date));
    });

    return Object.values(groups);
  }

  // ── Ajout des marqueurs uniques sur le globe ──
  function addMarkers() {
    if (!globeGroup) return; // le globe n'est pas encore initialisé (1er chargement)

    // Retire les marqueurs précédents (utile lors d'un changement d'onglet/catégorie)
    markers.forEach(m => {
      globeGroup.remove(m.ring);
      globeGroup.remove(m.dot);
    });

    const locations = getGroupedLocations();
    markers = [];

    locations.forEach((loc, index) => {
      const pos = latLonTo3D(loc.lat, loc.lon, GLOBE_RADIUS * 1.015);

      // Ring d'impact
      const ringGeo = new THREE.RingGeometry(0.024, 0.046, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(ring);

      // Point central cliquable
      const dotGeo = new THREE.CircleGeometry(0.018, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dot.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(dot);

      markers.push({
        ring,
        dot,
        localPos: pos,
        lat: loc.lat,
        lon: loc.lon,
        experiences: loc.items // Liste des expériences de ce lieu (déjà triée)
      });
    });
  }

  // ── Met à jour l'état visuel des marqueurs ──
  function updateMarkersGlow(activeMarker) {
    markers.forEach(m => {
      const isSelected = (m === activeMarker);
      m.dot.material.color.set(isSelected ? 0x0066ff : 0x111111);
      m.ring.material.color.set(isSelected ? 0x0066ff : 0x111111);
      m.ring.scale.setScalar(isSelected ? 1.4 : 1.0);
    });
  }

  // ── TOOLTIP FLOTTANT : Affiche les expériences du lieu ──
  function showLocationTooltip(marker) {
    if (!marker || marker.experiences.length === 0) return;

    const lang = document.body.getAttribute('data-lang') || 'en';
    const firstExp = marker.experiences[0];
    
    // Titre de la localisation
    ttHeader.textContent = `📍 ${firstExp.location[lang]}`;
    ttBody.innerHTML = '';

    // Liste des liens expériences
    marker.experiences.forEach(exp => {
      const a = document.createElement('a');
      a.className = 'gtooltip-item';
      a.href = '#';
      a.innerHTML = `
        <span class="gtooltip-item-year">${exp.year[lang]}</span>
        <span class="gtooltip-item-title">${exp.title[lang]}</span>
      `;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveExperience(exp.id, true);
        hideLocationTooltip();
      });
      ttBody.appendChild(a);
    });

    tooltip.classList.remove('hidden');
    updateMarkersGlow(marker);

    // Zoom/Pivote le globe vers ce lieu
    flyToLocation(marker.lat, marker.lon);

    // Au clic sur le point du globe, on sélectionne TOUJOURS la dernière expérience en date (le premier élément de la liste triée)
    setActiveExperience(firstExp.id, true);
  }

  function hideLocationTooltip() {
    tooltip.classList.add('hidden');
    updateMarkersGlow(null);
  }

  if (ttClose) {
    ttClose.addEventListener('click', (e) => {
      e.stopPropagation();
      hideLocationTooltip();
    });
  }

  // ── Animation Frame loop ──
  function animate() {
    rafId = requestAnimationFrame(animate);
    floatTime += 0.01;

    // Rotation et inclinaison fluides
    currentRotY += (targetRotY - currentRotY) * 0.06;
    currentRotX += (targetRotX - currentRotX) * 0.06;

    if (globeGroup) {
      globeGroup.rotation.y = currentRotY;
      globeGroup.rotation.x = currentRotX;
      globeGroup.position.y = Math.sin(floatTime) * 0.02; // flottement léger
    }

    // Pulsation des anneaux non-sélectionnés
    markers.forEach((m) => {
      const isSelected = (m.dot.material.color.getHex() === 0x0066ff);
      if (!isSelected) {
        const pulse = 0.85 + 0.15 * Math.sin(floatTime * 2.5 + m.lat);
        m.ring.material.opacity = 0.5 * pulse;
      } else {
        m.ring.material.opacity = 0.9;
      }
    });

    renderer.render(scene, camera);
  }

  function destroyGlobe() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (renderer) { renderer.dispose(); renderer = null; }
    globeGroup = null; scene = null; markers = [];
    globeInited = false;
  }

  function flyToLocation(lat, lon) {
    const correctedLat = getCorrectedLat(lat);
    const correctedLon = getCorrectedLon(lon);
    targetRotY = lonToRotY(correctedLon);
    targetRotX = correctedLat * (Math.PI / 180) * 0.65;
    targetRotX = Math.max(-ROT_X_MAX, Math.min(ROT_X_MAX, targetRotX));
  }

  // ── GESTION DE LA TIMELINE DE GAUCHE (filtrée par l'onglet catégorie actif) ──
  function buildTimeline() {
    const lang = document.body.getAttribute('data-lang') || 'en';
    timelineEl.innerHTML = '';

    // Liste filtrée (ou tout), triée par date inversée (déjà fait dans EXPERIENCES_DATA)
    getVisibleExperiences().forEach(exp => {
      const el = document.createElement('div');
      el.className = 'journey-entry';
      el.id = `entry-${exp.id}`;
      el.innerHTML = `
        <div class="journey-dot"></div>
        <div class="journey-content">
          <span class="journey-year">${exp.year[lang]}</span>
          <h3 class="journey-title">${exp.title[lang]}</h3>
          <span class="journey-place">📍 ${exp.location[lang]}</span>
          <p class="journey-desc">${exp.desc[lang] || ''}</p>
        </div>`;

      el.addEventListener('click', () => {
        setActiveExperience(exp.id, true);
      });
      timelineEl.appendChild(el);
    });

    setActiveExperience(activeId, false);
  }

  // Active un élément de la timeline, l'illumine, scrolle dessus, et oriente le globe
  function setActiveExperience(id, animateGlobe = true) {
    activeId = id;
    
    // Highlight
    document.querySelectorAll('.journey-entry').forEach(el => {
      const currentId = el.id.replace('entry-', '');
      el.classList.toggle('active', currentId === activeId);
    });

    // Scroll lisse
    const activeEl = document.getElementById(`entry-${activeId}`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Globe
    const exp = EXPERIENCES_DATA.find(e => e.id === activeId);
    if (exp && animateGlobe) {
      flyToLocation(exp.lat, exp.lon);

      // Illumine le marqueur correspondant sur la carte.
      // Les marqueurs sont regroupés par PAYS (voir getGroupedLocations) et
      // utilisent une position représentative fixe (ex: Bruxelles pour la
      // Belgique) qui ne correspond presque jamais aux lat/lon exactes de
      // chaque expérience individuelle : comparer les coordonnées ne
      // fonctionnait donc que pour les rares expériences situées pile sur
      // ce point représentatif. On cherche désormais le marqueur qui
      // contient réellement cette expérience dans sa liste — ça marche
      // pour toutes, quel que soit le lieu exact.
      const matchedMarker = markers.find(m =>
        m.experiences.some(item => item.id === exp.id)
      );
      if (matchedMarker) {
        updateMarkersGlow(matchedMarker);
      }
    }
  }

  // ── OUVRIR / FERMER ──
  function openJourney() {
    if (window.lenisInstance) window.lenisInstance.stop();
    document.documentElement.classList.add('panel-open', 'journey-open');
    document.body.classList.add('panel-open', 'journey-open');
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
    timelineEl.innerHTML = '<div class="journey-loading">…</div>';

    loadJourneyData().then(data => {
      // Rétablit la vue "Toutes" + le dernier élément en date au départ
      activeCategory = 'ALL';
      tabButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'ALL'));
      activeId = data.length ? data[0].id : null;

      buildTimeline();
      setTimeout(() => {
        initGlobe();
        const first = data[0];
        flyToLocation(first ? first.lat : 50.85, first ? first.lon : 4.35);
      }, 100);
    });
  }

  function closeJourney() {
    overlay.classList.remove('visible');
    overlay.classList.add('hidden');
    document.documentElement.classList.remove('panel-open', 'journey-open');
    document.body.classList.remove('panel-open', 'journey-open');
    hideLocationTooltip();
    destroyGlobe();
    if (typeof window.returnToBureau === 'function') window.returnToBureau();
  }

  closeBtn.addEventListener('click', closeJourney);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeJourney(); });

  // Changement de langue dynamique
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!overlay.classList.contains('hidden')) {
        setTimeout(buildTimeline, 50);
      }
    });
  });

  window.openJourneyPanel = openJourney;
}

document.addEventListener('DOMContentLoaded', initJourneyPanel);
