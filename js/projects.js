/* =====================================================================
   PROJECTS.JS — Style Instagram Grid + Detail Lightbox
   12C — PROJETS — Lionel van Vyve Portfolio
   ===================================================================== */

/* ───────────────────────────────────────────────────────────────────────
   AUTO-UPDATE — le site lit js/projects-manifest.js (généré par
   generate_manifest.py) au lieu d'avoir les images codées en dur.
   Chaque projet ne référence plus qu'un "folder" ; la liste réelle
   des images de ce dossier vient de window.PROJECTS_MANIFEST, régénéré
   à chaque exécution du script à partir du vrai contenu du disque.
   Les dossiers "NON" ne sont JAMAIS inclus, à aucun niveau.
   ─────────────────────────────────────────────────────────────────────── */
const ROOT_PREFIX = 'ORDRE SITE WEB/12C - PROJETS/WEB_OPTIMIZED/';

function getManifestEntries(folder) {
  if (!folder) return [];
  const manifest = window.PROJECTS_MANIFEST || {};
  const entries = manifest[folder];
  if (!entries || !entries.length) return [];
  return entries;
}

/* Résout les entrées du manifeste (fichier + lien éventuel) en items
   utilisables par la grille / la lightbox : {type, url, path, link} */
function resolveProjectItems(proj) {
  const entries = getManifestEntries(proj.folder);
  return entries.map(entry => {
    const path = ROOT_PREFIX + proj.folder + '/' + entry.file;
    if (entry.link) {
      return { type: 'youtube', url: entry.link, path: path, thumb: path };
    }
    return { type: 'image', url: path, path: path };
  });
}

/* ───────────────────────────────────────────────────────────────────────
   HELPER — Extract YouTube video ID for thumbnail
   ─────────────────────────────────────────────────────────────────────── */
function getYouTubeVideoId(url) {
  // youtu.be/VIDEO_ID or youtube.com/watch?v=VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return longMatch[1];
  return null;
}

/* ───────────────────────────────────────────────────────────────────────
   DATA — Catégories, dossiers et ordre 100% auto-détectés par
   generate_manifest.py à partir du disque (window.PROJECTS_STRUCTURE).
   Un nouveau dossier de projet ajouté sur le disque, puis un lancement
   de mettre_a_jour_site.bat, suffit à le faire apparaître sur le site,
   dans la bonne catégorie, avec le bon titre (nom du dossier sans
   l'année) et à la bonne place (tri par année décroissante).

   Seuls le TAG et la DESCRIPTION (FR/EN/NL) de chaque carte restent à
   écrire à la main ci-dessous, dans PROJECT_OVERRIDES, indexés par
   chemin de dossier — le script Python n'y touche jamais. Un projet
   qui n'a pas (encore) d'entrée ici affiche un texte par défaut.
   ─────────────────────────────────────────────────────────────────────── */

/* Icône / couleur / nom (FR·EN·NL) de chaque catégorie, indexés par le
   nom du dossier de catégorie sur le disque (ex: '1_GEOMATIQUE'). Une
   catégorie détectée sur le disque mais absente d'ici reçoit un style
   générique de secours (voir metaForCategory) — ajoutez-la ici pour
   lui donner une icône et un nom soignés. */
const CATEGORY_META = {
  '1_GEOMATIQUE': { id: 'geomatique', icon: '🗺️', color: '#6eb5c9', label: { en: 'Geomatics', fr: 'Géomatique', nl: 'Geomatica' } },
  '2_SURVEY': { id: 'survey', icon: '📐', color: '#9b6ec9', label: { en: 'Survey', fr: 'Topographie', nl: 'Landmeten' } },
  '3_ARCHITECTURE': { id: 'architecture', icon: '🏛️', color: '#c9a96e', label: { en: 'Architecture', fr: 'Architecture', nl: 'Architectuur' } },
  '4_VIDEO': { id: 'video', icon: '🎬', color: '#c96e6e', label: { en: 'Video', fr: 'Vidéo', nl: 'Video' } },
  '5_MUSEE': { id: 'musee', icon: '🏺', color: '#c96eb5', label: { en: 'Museum', fr: 'Musée', nl: 'Museum' } },
  '6_RECHERCHE': { id: 'recherche', icon: '🔬', color: '#6ec994', label: { en: 'Research', fr: 'Recherche', nl: 'Onderzoek' } },
};

/* Couleurs de secours utilisées, dans l'ordre, pour toute nouvelle
   catégorie détectée sur le disque mais pas encore déclarée ci-dessus. */
const FALLBACK_CATEGORY_COLORS = ['#6eb5c9', '#9b6ec9', '#c9a96e', '#c96e6e', '#c96eb5', '#6ec994'];

function metaForCategory(catFolder, indexOnDisk) {
  if (CATEGORY_META[catFolder]) return CATEGORY_META[catFolder];
  const niceName = catFolder.replace(/^\d+_/, '').replace(/_/g, ' ');
  return {
    id: catFolder.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    icon: '📁',
    color: FALLBACK_CATEGORY_COLORS[indexOnDisk % FALLBACK_CATEGORY_COLORS.length],
    label: { en: niceName, fr: niceName, nl: niceName }
  };
}

/* Tag + description (FR/EN/NL) écrits à la main pour chaque projet,
   indexés par le chemin exact de son dossier (celui qui apparaît dans
   window.PROJECTS_STRUCTURE / PROJECTS_MANIFEST). */
const PROJECT_OVERRIDES = {
  "1_GEOMATIQUE/2026_EDUCATIONAL MOBILE APPLICATION FOR GEODESY": {
    tag: "Mobile · SIG",
    desc: {
      fr: "Application mobile éducative (Android) permettant d'explorer interactivement les concepts fondamentaux de la géodésie et de l'astronomie de position. Visualisation 3D en temps réel de la Terre avec son axe, son équateur, ses méridiens/parallèles, les trajectoires orthodromique et loxodromique entre deux points, ainsi que la simulation des saisons, de l'orbite elliptique et de la précession des équinoxes. Développée avec React Native et Three.js, navigation tactile intuitive, panneau de contrôle ajustable (rotation, inclinaison, orbite). Un globe imprimé en 3D (Blender → STL → Prusa XL) accompagne l'application pour une approche tangible et pédagogique.",
      en: "Educational mobile app (Android) for interactively exploring the fundamental concepts of geodesy and positional astronomy. Real-time 3D visualization of the Earth with its axis, equator, meridians/parallels, great-circle and rhumb-line paths between two points, as well as simulations of the seasons, the elliptical orbit, and the precession of the equinoxes. Built with React Native and Three.js, with intuitive touch navigation and an adjustable control panel (rotation, tilt, orbit). A 3D-printed globe (Blender → STL → Prusa XL) accompanies the app for a tangible, hands-on teaching approach.",
      nl: "Educatieve mobiele app (Android) om op interactieve wijze de fundamentele concepten van geodesie en positieastronomie te verkennen. Realtime 3D-visualisatie van de aarde met haar as, evenaar, meridianen/parallellen, de groot-cirkel- en loxodroombanen tussen twee punten, evenals simulaties van de seizoenen, de elliptische baan en de precessie van de equinoxen. Ontwikkeld met React Native en Three.js, met intuïtieve aanraaknavigatie en een instelbaar bedieningspaneel (rotatie, helling, baan). Een 3D-geprinte globe (Blender → STL → Prusa XL) begeleidt de app voor een tastbare, pedagogische aanpak."
    }
  },
  "1_GEOMATIQUE/2026_REMOTE SENSING": {
    tag: "Satellite · Analyse",
    desc: {
      fr: "Analyse multi-temporelle (2007-2016-2025) de la dynamique de végétation le long du corridor de la Grande Muraille Verte (11 pays sahéliens). Traitement de 9 indices spectraux MODIS (NDVI, EVI, SAVI, MSAVI, ARVI, NDWI, NDBI, NBR, GNDVI) et 12 variables biophysiques. Détection de changements par Δ-PCA (84,7% de variance capturée) et Change Vector Analysis (CVA). Construction d'un score composite de restauration (0 à 1) par site. Mise en évidence de contrastes forts : rebond végétal au Niger/Ferlo/Érythrée vs dégradation autour du lac Tchad et d'Addis-Abeba. Outils : Google Earth Engine, Python, MODIS, Sentinel-2, GEDI.",
      en: "Multi-temporal analysis (2007-2016-2025) of vegetation dynamics along the Great Green Wall corridor (11 Sahelian countries). Processing of 9 MODIS spectral indices (NDVI, EVI, SAVI, MSAVI, ARVI, NDWI, NDBI, NBR, GNDVI) and 12 biophysical variables. Change detection via Δ-PCA (84.7% of variance captured) and Change Vector Analysis (CVA). Construction of a composite restoration score (0 to 1) per site. Highlighting of strong contrasts: vegetation rebound in Niger/Ferlo/Eritrea versus degradation around Lake Chad and Addis Ababa. Tools: Google Earth Engine, Python, MODIS, Sentinel-2, GEDI.",
      nl: "Multitemporele analyse (2007-2016-2025) van vegetatiedynamiek langs de corridor van de Grote Groene Muur (11 Sahellanden). Verwerking van 9 MODIS-spectrale indexen (NDVI, EVI, SAVI, MSAVI, ARVI, NDWI, NDBI, NBR, GNDVI) en 12 biofysische variabelen. Veranderingsdetectie via Δ-PCA (84,7% van de variantie verklaard) en Change Vector Analysis (CVA). Opbouw van een samengestelde herstelscore (0 tot 1) per site. Belichting van sterke contrasten: vegetatieherstel in Niger/Ferlo/Eritrea versus degradatie rond het Tsjaadmeer en Addis Abeba. Tools: Google Earth Engine, Python, MODIS, Sentinel-2, GEDI."
    }
  },
  "1_GEOMATIQUE/2025_SPATIAL ANALYSIS": {
    tag: "Analyse · QGIS",
    desc: {
      fr: "Mise en œuvre de méthodes d'analyse spatiale sur des cas concrets : étude de l'autocorrélation de l'âge moyen des communes belges (Moran's I, Geary's C, LISA, Getis-Ord Gi*, voisinage Queen, Monte Carlo) et interpolation de l'humidité des sols en Allemagne (Thiessen, Delaunay, IDW, semivariogramme, krigeage). Croisement d'approches globales/locales et déterministes/géostatistiques pour la détection de clusters et l'estimation de variables continues. Outils : R (gstat, spdep, raster, tmap) et QGIS.",
      en: "Implementation of spatial analysis methods on real-world cases: study of the spatial autocorrelation of the average age of Belgian municipalities (Moran's I, Geary's C, LISA, Getis-Ord Gi*, Queen contiguity, Monte Carlo) and interpolation of soil moisture in Germany (Thiessen, Delaunay, IDW, semivariogram, kriging). Combining global/local and deterministic/geostatistical approaches for cluster detection and estimation of continuous variables. Tools: R (gstat, spdep, raster, tmap) and QGIS.",
      nl: "Toepassing van ruimtelijke analysemethoden op concrete cases: studie van de ruimtelijke autocorrelatie van de gemiddelde leeftijd van Belgische gemeenten (Moran's I, Geary's C, LISA, Getis-Ord Gi*, Queen-buurschap, Monte Carlo) en interpolatie van de bodemvochtigheid in Duitsland (Thiessen, Delaunay, IDW, semivariogram, kriging). Combinatie van globale/lokale en deterministische/geostatistische benaderingen voor clusterdetectie en schatting van continue variabelen. Tools: R (gstat, spdep, raster, tmap) en QGIS."
    }
  },
  "1_GEOMATIQUE/2025_SPATIAL DATA INFRASTRUCTURE AND DATABASE": {
    tag: "Données · SQL",
    desc: {
      fr: "Conception et déploiement d'un SIG complet pour la gestion des hôpitaux de Liège. Base de données PostgreSQL/PostGIS avec héritage relationnel (personne → patient/médecin), serveur GeoServer (couches WMS), interface web interactive (Leaflet, PHP, AJAX, Chart.js). Fonctionnalités : authentification, cartographie interactive, calcul d'hôpital le plus proche (ST_DistanceSphere), statistiques par tranches d'âge, prise de rendez-vous. Architecture modulaire et sécurisée (requêtes préparées, transactions).",
      en: "Design and deployment of a complete GIS for managing hospitals in Liège. PostgreSQL/PostGIS database with relational inheritance (person → patient/doctor), GeoServer server (WMS layers), interactive web interface (Leaflet, PHP, AJAX, Chart.js). Features: authentication, interactive mapping, nearest-hospital calculation (ST_DistanceSphere), age-bracket statistics, appointment booking. Modular and secure architecture (prepared statements, transactions).",
      nl: "Ontwerp en implementatie van een volledig GIS voor het beheer van ziekenhuizen in Luik. PostgreSQL/PostGIS-database met relationele overerving (persoon → patiënt/arts), GeoServer (WMS-lagen), interactieve webinterface (Leaflet, PHP, AJAX, Chart.js). Functies: authenticatie, interactieve cartografie, berekening van het dichtstbijzijnde ziekenhuis (ST_DistanceSphere), statistieken per leeftijdsgroep, afsprakenbeheer. Modulaire en beveiligde architectuur (prepared statements, transacties)."
    }
  },
  "1_GEOMATIQUE/2025_CAD-ROADS-AREA MEASUREMENT": {
    tag: "CAD · VRD · Mesurage",
    desc: {
      fr: "Mesurages de bâtiments (normes EUREL/DIN 227, surfaces utiles, privatisables, communes, lots, intramuros/extramuros) et études de voirie/réseaux sous Covadis. Modélisation numérique de terrain (MNT), profils en long, demi-profils types, plans d'aménagement et implantation des réseaux enterrés (VRD). Application aux rapports de mitoyenneté, bornage, division parcellaire et aménagements urbains.",
      en: "Building surveys (EUREL/DIN 227 standards, usable, private, common, and lot areas, intramural/extramural) and road/utility network studies using Covadis. Digital terrain modeling (DTM), longitudinal profiles, standard cross-sections, layout plans, and underground utility network (VRD) implementation. Applied to party-wall reports, boundary marking, land subdivision, and urban development.",
      nl: "Gebouwopmetingen (EUREL/DIN 227-normen, bruikbare, privé-, gemeenschappelijke en kavelopppervlakten, intra-/extramuraal) en weg-/nutsnetwerkstudies met Covadis. Digitaal terreinmodel (DTM), langsprofielen, standaard dwarsprofielen, inrichtingsplannen en aanleg van ondergrondse nutsnetwerken (VRD). Toegepast op grensscheidingsrapporten, grensbepaling, perceelsverdeling en stedelijke inrichting."
    }
  },
  "1_GEOMATIQUE/2025_GEOMARKETING": {
    tag: "Marketing · SIG",
    desc: {
      fr: "Analyse de zones de chalandise de 7 centres commerciaux en Belgique (Wavre, Gembloux, Charleroi, Châtelet, Sambreville, Namur, Docks Bruxsel). Modèle de Huff (probabilité de visite = attractivité / somme des attractivités) avec pondération par la surface commerciale et le temps de trajet (réseau OSM, Dijkstra). Krigeage universel pour l'interpolation spatiale. Identification des clients potentiels (population × probabilité de visite). Délimitation des zones primaire (60%), secondaire (90%) et tertiaire (100%). Mise en évidence d'une suroffre commerciale en Wallonie. Outils : PostGIS, QGIS, raster.",
      en: "Catchment area analysis for 7 shopping centers in Belgium (Wavre, Gembloux, Charleroi, Châtelet, Sambreville, Namur, Docks Bruxsel). Huff model (visit probability = attractiveness / sum of attractiveness) weighted by commercial floor area and travel time (OSM network, Dijkstra). Universal kriging for spatial interpolation. Identification of potential customers (population × visit probability). Delineation of primary (60%), secondary (90%), and tertiary (100%) catchment zones. Highlighting of commercial oversupply in Wallonia. Tools: PostGIS, QGIS, raster.",
      nl: "Analyse van verzorgingsgebieden voor 7 winkelcentra in België (Wavre, Gembloux, Charleroi, Châtelet, Sambreville, Namen, Docks Bruxsel). Huff-model (bezoekkans = aantrekkelijkheid / som van aantrekkelijkheden), gewogen naar handelsoppervlakte en reistijd (OSM-netwerk, Dijkstra). Universele kriging voor ruimtelijke interpolatie. Identificatie van potentiële klanten (bevolking × bezoekkans). Afbakening van primaire (60%), secundaire (90%) en tertiaire (100%) zones. Belichting van een commercieel overaanbod in Wallonië. Tools: PostGIS, QGIS, raster."
    }
  },
  "1_GEOMATIQUE/2025_GEOGRAPHIC INFORMATION SYSTEM (GIS)": {
    tag: "SIG · QGIS · Cartographie",
    desc: {
      fr: "Manipulations SIG sur cas concrets : buffers (tampon 8 m), sélections par localisation, calculs de superficie ($area), regroupement de parcelles, MNT et reclassification des pentes, statistiques zonales, calcul de chemin le plus court, union de tronçons. Applications : impact routier, zones constructibles, contournement routier, étude de ligne haute-tension (Ans). Outils : QGIS, calculatrice de champ, géotraitements.",
      en: "GIS operations on real-world cases: buffers (8 m buffer zone), location-based selections, area calculations ($area), parcel merging, DTM and slope reclassification, zonal statistics, shortest-path computation, segment union. Applications: road impact assessment, buildable land zones, road bypass planning, high-voltage line study (Ans). Tools: QGIS, field calculator, geoprocessing.",
      nl: "GIS-bewerkingen op concrete cases: buffers (buffer van 8 m), selecties op locatie, oppervlakteberekeningen ($area), samenvoeging van percelen, DTM en hellingreclassificatie, zonale statistieken, kortste-padberekening, samenvoeging van segmenten. Toepassingen: impactstudie van wegen, bebouwbare zones, omleidingsstudie, studie van een hoogspanningslijn (Ans). Tools: QGIS, veldcalculator, geoprocessing."
    }
  },
  "2_SURVEY/2026_TOPOGRAPHIC SURVEYING": {
    tag: "Topographie · Cheminement",
    desc: {
      fr: "Campagnes de cheminement topographique polygonal en Wallonie. Mesures angulaires et linéaires en chaîne, calculs de compensation par moindres carrés et report des coordonnées planimétriques. Chaque résidu contrôlé, chaque point compensé. Utilisation de station totale et nivellement.",
      en: "Polygonal topographic traversing campaigns in Wallonia. Chained angular and linear measurements, least-squares compensation calculations, and planimetric coordinate reporting. Every residual checked, every point adjusted. Use of total station and leveling.",
      nl: "Polygonale topografische traverseringscampagnes in Wallonië. Geketende hoek- en lineaire metingen, kleinste-kwadratencompensatieberekeningen en planimetrische coördinaatrapportage. Elke residu gecontroleerd, elk punt gecompenseerd. Gebruik van totaalstation en waterpassing."
    }
  },
  "2_SURVEY/2025_3D DATA ACQUISITION AND PROCESSING (WITH SMARTPHONES)": {
    tag: "3D · Acquisition · Scan",
    desc: {
      fr: "Acquisition et traitement de données 3D par photogrammétrie rapprochée utilisant des smartphones (captures d'images systématiques) et station totale (mesures de contrôle et géoréférencement). Traitement et nettoyage des modèles sous Agisoft Metashape (alignement des photos, construction du nuage dense, filtrage du bruit, texturage). Les modèles 3D générés sont comparés à des relevés par scanner laser (LiDAR) pour évaluer les écarts de précision et identifier les limites de chaque méthode. Mise en évidence des forces et faiblesses des capteurs mobiles face aux scanners professionnels. Applications : relevés patrimoniaux, statues, bâtiments, sites complexes.",
      en: "Acquisition and processing of 3D data through close-range photogrammetry using smartphones (systematic image capture) and a total station (control measurements and georeferencing). Model processing and cleanup in Agisoft Metashape (photo alignment, dense cloud construction, noise filtering, texturing). The resulting 3D models are compared to laser scanner (LiDAR) surveys to assess accuracy discrepancies and identify the limits of each method. Highlighting the strengths and weaknesses of mobile sensors compared to professional scanners. Applications: heritage surveys, statues, buildings, complex sites.",
      nl: "Acquisitie en verwerking van 3D-gegevens via close-range fotogrammetrie met smartphones (systematische beeldopname) en totaalstation (controlemetingen en georeferentie). Modelverwerking en -opschoning in Agisoft Metashape (foto-uitlijning, opbouw van de dichte puntenwolk, ruisfiltering, texturering). De gegenereerde 3D-modellen worden vergeleken met laserscanner (LiDAR)-opnamen om nauwkeurigheidsafwijkingen te beoordelen en de beperkingen van elke methode te identificeren. Belichting van de sterke en zwakke punten van mobiele sensoren tegenover professionele scanners. Toepassingen: erfgoedopnamen, standbeelden, gebouwen, complexe sites."
    }
  },
  "2_SURVEY/2025_REAL-TIME KINEMATIC (RTK)": {
    tag: "GNSS · RTK · Terrain",
    desc: {
      fr: "Traitement et analyse de données GNSS en mode RTK cinématique (Mosaic X5, 5 Hz) sur parcours pédestre en environnement mixte. Post-traitement sous RTKLIB avec comparaison des paramètres : modes (Kinematic/DGPS), fréquences (mono/bi/tri), filtres (Forward/Backward/Combined), masques d'élévation et SNR, dynamique du récepteur, corrections (marées, iono/tropo), éphémérides (broadcast/précises), et constellations (GPS/Galileo/GLONASS/BeiDou). Optimisation de la résolution d'ambiguïtés (Fix and Hold GPS / ON GLONASS), du ratio de validation (3), et des seuils de cycle-slips (Doppler 2,5 Hz, Geometry-Free 0,04 m). Configuration finale : filtre Combined, EM 25°, tri-fréquence, PDOP 1,7, taux fixed 69%. Validation par orthophoto.",
      en: "Processing and analysis of GNSS data in kinematic RTK mode (Mosaic X5, 5 Hz) on a pedestrian route through a mixed environment. Post-processing in RTKLIB with comparison of parameters: modes (Kinematic/DGPS), frequencies (single/dual/triple), filters (Forward/Backward/Combined), elevation and SNR masks, receiver dynamics, corrections (tides, iono/tropo), ephemerides (broadcast/precise), and constellations (GPS/Galileo/GLONASS/BeiDou). Optimization of ambiguity resolution (Fix and Hold GPS / ON GLONASS), validation ratio (3), and cycle-slip thresholds (Doppler 2.5 Hz, Geometry-Free 0.04 m). Final configuration: Combined filter, 25° elevation mask, triple-frequency, PDOP 1.7, 69% fixed rate. Validation by orthophoto.",
      nl: "Verwerking en analyse van GNSS-gegevens in kinematische RTK-modus (Mosaic X5, 5 Hz) op een voetgangersroute in een gemengde omgeving. Naverwerking in RTKLIB met vergelijking van parameters: modi (Kinematic/DGPS), frequenties (enkel/dubbel/drievoudig), filters (Forward/Backward/Combined), elevatie- en SNR-maskers, ontvangerdynamiek, correcties (getijden, iono/tropo), efemeriden (broadcast/precies) en constellaties (GPS/Galileo/GLONASS/BeiDou). Optimalisatie van ambiguïteitsresolutie (Fix and Hold GPS / ON GLONASS), validatieratio (3) en cycle-slipdrempels (Doppler 2,5 Hz, Geometry-Free 0,04 m). Uiteindelijke configuratie: Combined-filter, elevatiemasker 25°, drievoudige frequentie, PDOP 1,7, 69% fixed-percentage. Validatie via orthofoto."
    }
  },
  "2_SURVEY/2024_PARTY WALL REPORT": {
    tag: "Géomètre · Mitoyenneté",
    desc: {
      fr: "Établissement du rapport de mitoyenneté entre deux propriétés riveraines. Relevé des limites de propriété, calcul des surfaces et rédaction du rapport technique officiel.",
      en: "Establishment of a party-wall/boundary report between two adjacent properties. Survey of property boundaries, area calculation, and drafting of the official technical report.",
      nl: "Opstelling van een grensscheidingsrapport tussen twee aangrenzende eigendommen. Eigendomsgrensopname, oppervlakteberekening en opstelling van het officieel technisch rapport."
    }
  },
  "2_SURVEY/2023_NAVVIS VLX - SLAM": {
    tag: "Scan Mobile · Navvis",
    desc: {
      fr: "Utilisation du scanner mobile Navvis VLX pour la capture de nuages de points denses en intérieur. Technologie SLAM (Simultaneous Localization and Mapping). Reconstruction de plans et de maquettes numériques à partir des données. Le VLX2 embarque un capteur photo 360° intégré, capturant simultanément géométrie et image.",
      en: "Use of the Navvis VLX mobile scanner for dense indoor point cloud capture. SLAM (Simultaneous Localization and Mapping) technology. Reconstruction of floor plans and digital models from the captured data. The VLX2 features a built-in 360° camera sensor, capturing geometry and imagery simultaneously.",
      nl: "Gebruik van de Navvis VLX mobiele scanner voor dichte binnenshuis puntenwolkopname. SLAM-technologie (Simultaneous Localization and Mapping). Reconstructie van plattegronden en digitale modellen op basis van de vastgelegde gegevens. De VLX2 beschikt over een geïntegreerde 360°-camerasensor die geometrie en beeld tegelijk vastlegt."
    }
  },
  "2_SURVEY/2023_STATIONARY SCANNING": {
    tag: "Scan 3D · Stationnaire",
    desc: {
      fr: "Acquisition par scanner laser stationnaire (scan fixe). Mise en station, visées sur cibles réflectorisées et recalage de nuages de points multiples. Comparaison photogrammétrie/LiDAR pour validation des données.",
      en: "Acquisition via stationary laser scanner (fixed scan). Station setup, sightings on reflective targets, and registration of multiple point clouds. Photogrammetry/LiDAR comparison for data validation.",
      nl: "Acquisitie via stationaire laserscanner (vaste scan). Stationsopstelling, waarnemingen op reflectordoelwitten en registratie van meerdere puntenwolken. Vergelijking fotogrammetrie/LiDAR voor gegevensvalidatie."
    }
  },
  "2_SURVEY/2023_REAL ESTATE AND VIRTUAL TOURS": {
    tag: "Visite Virtuelle · 360°",
    desc: {
      fr: "Réalisation de visites virtuelles immersives à 360° pour des biens immobiliers. Prises de vue panoramiques, assemblage et publication sur plateformes dédiées. Utilisation de la caméra Insta360 Titan, du scanner NavVis VLX2 et de la plateforme IVION pour des maquettes 3D géoréférencées, navigables et mesurables.",
      en: "Creation of immersive 360° virtual tours for real estate properties. Panoramic photography, stitching, and publication on dedicated platforms. Use of the Insta360 Titan camera, the NavVis VLX2 scanner, and the IVION platform for georeferenced, navigable, and measurable 3D models.",
      nl: "Realisatie van meeslepende 360°-virtuele rondleidingen voor vastgoedobjecten. Panoramische opnamen, stitching en publicatie op speciale platforms. Gebruik van de Insta360 Titan-camera, de NavVis VLX2-scanner en het IVION-platform voor georefereerde, navigeerbare en meetbare 3D-modellen."
    }
  },
  "2_SURVEY/2022_RESERVE NIBIISCHII – CENSUS": {
    tag: "Recensement · Terrain · Canada",
    desc: {
      fr: "Mission de recensement topographique et cartographique dans la réserve autochtone Nibiischii (nord du Québec, Canada). Collecte et structuration des données géographiques pour la gestion du territoire. Plus de 10 000 km² documentés par drones et caméras 360° pour sensibiliser à la conservation de ce patrimoine naturel.",
      en: "Topographic and cartographic census mission in the Nibiischii indigenous reserve (northern Quebec, Canada). Collection and structuring of geographic data for territorial management. Over 10,000 km² documented using drones and 360° cameras to raise awareness of the conservation of this natural heritage.",
      nl: "Topografische en cartografische censusmissie in de inheemse reserve Nibiischii (noordelijk Quebec, Canada). Verzameling en structurering van geografische gegevens voor territoriaal beheer. Meer dan 10.000 km² gedocumenteerd met drones en 360°-camera's om bewustzijn te creëren rond het behoud van dit natuurlijk erfgoed."
    }
  },
  "2_SURVEY/SURVEY - GEOTOP": {
    tag: "Station Totale · Géotop",
    desc: {
      fr: "Relevés topographiques avec station totale et logiciel Géotop. Calcul de coordonnées, report de points et production de plans topographiques de précision.",
      en: "Topographic surveys using total station and Géotop software. Coordinate computation, point staking, and production of precision topographic plans.",
      nl: "Topografische opnames met totaalstation en Géotop-software. Coördinatenberekening, puntenuitstekking en productie van nauwkeurige topografische plannen."
    }
  },
  "3_ARCHITECTURE/2026_SINGLE-FAMILY HOUSING – HOUSE IN BRUSSELS – PLANS+SCAN+BIM": {
    tag: "Plans · BIM · Scan",
    desc: {
      fr: "Relevé laser complet d'une maison bruxelloise suivi de la production des plans détaillés et d'un modèle 3D BIM sous Revit. Fidélité millimétrique du bâti historique existant. Combinaison nuages de points + Revit. Exports CAD avec couleurs et ombres pour une meilleure lisibilité et communication.",
      en: "Complete laser survey of a Brussels townhouse followed by the production of detailed plans and a 3D BIM model in Revit. Millimeter-level fidelity to the existing historic structure. Combination of point clouds and Revit. CAD exports with colors and shading for improved readability and communication.",
      nl: "Volledige lasermeting van een Brussels herenhuis gevolgd door de productie van gedetailleerde plannen en een 3D BIM-model in Revit. Millimeternauwkeurige weergave van het bestaande historische gebouw. Combinatie van puntenwolken en Revit. CAD-exports met kleuren en schaduwen voor betere leesbaarheid en communicatie."
    }
  },
  "3_ARCHITECTURE/2025_COMMERCIAL BUILDING AND 3D SCAN – BRUSSELS – BIM MODEL": {
    tag: "BIM · Scan 3D",
    desc: {
      fr: "Numérisation 3D et modélisation BIM (Building Information Modeling) d'un bâtiment commercial complexe à Bruxelles. Utilisation de technologies de scan laser de pointe (NavVis VLX2) pour une reconstruction numérique fidèle. Combinaison nuages de points + Revit pour une maquette exploitable.",
      en: "3D digitization and BIM (Building Information Modeling) of a complex commercial building in Brussels. Use of state-of-the-art laser scanning technology (NavVis VLX2) for a faithful digital reconstruction. Combination of point clouds and Revit for a usable model.",
      nl: "3D-digitalisering en BIM (Building Information Modeling) van een complex commercieel gebouw in Brussel. Gebruik van geavanceerde laserscantechnologie (NavVis VLX2) voor een getrouwe digitale reconstructie. Combinatie van puntenwolken en Revit voor een bruikbaar model."
    }
  },
  "3_ARCHITECTURE/2023_SINGLE-FAMILY HOUSE – ZAVENTEM": {
    tag: "Architecture · Résidentiel",
    desc: {
      fr: "Conception architecturale et dossier de plans complets pour une maison individuelle contemporaine à Zaventem. Recherche de compacité spatiale et optimisation énergétique. Plans techniques d'exécution et élévations.",
      en: "Architectural design and complete plans package for a contemporary single-family home in Zaventem. Focus on spatial compactness and energy optimization. Technical construction plans and elevations.",
      nl: "Architectonisch ontwerp en compleet plannenpakket voor een eigentijdse eengezinswoning in Zaventem. Focus op ruimtelijke compactheid en energie-optimalisatie. Technische bouwplannen en gevels."
    }
  },
  "3_ARCHITECTURE/2022_STUDY FOR AN OPEN-AIR CINEMA SCREEN": {
    tag: "Étude · Design",
    desc: {
      fr: "Étude structurelle et conception technique pour l'implantation d'un écran de cinéma en plein air temporaire. Optimisation de la visibilité et étude d'impact au vent.",
      en: "Structural study and technical design for the installation of a temporary outdoor cinema screen. Optimization of sightlines and wind load analysis.",
      nl: "Structurele studie en technisch ontwerp voor de installatie van een tijdelijk bioscoopscherm in de open lucht. Optimalisatie van zichtlijnen en windbelastingsanalyse."
    }
  },
  "3_ARCHITECTURE/2020_COLLECTIVE HOUSING – SLAB-TYPE BUILDING PROJECT – BRUSSELS – REHABILITATION AND RESTRUCTURING": {
    tag: "Réhabilitation · Restructuration",
    desc: {
      fr: "Projet de réhabilitation lourde et restructuration spatiale d'un immeuble de logement collectif de type barre à Bruxelles (Rempart des Moines). Amélioration thermique et réorganisation des typologies d'appartements. Intégration d'un pied-à-terre, repensé les circulations et les espaces publics. Étude des vues piétonnes.",
      en: "Heavy rehabilitation and spatial restructuring project of a linear collective housing block (barre) in Brussels (Rempart des Moines). Thermal upgrade and reorganization of apartment layouts. Integration of a small pied-à-terre unit, redesigned circulation and public spaces. Pedestrian view study.",
      nl: "Grootschalig rehabilitatie- en ruimtelijk herstructureringsproject van een collectief woongebouw (barre) in Brussel (Rempart des Moines). Thermische upgrade en reorganisatie van appartementsindelingen. Integratie van een pied-à-terre, herdachte circulatie en publieke ruimtes. Studie van voetgangerszichten."
    }
  },
  "3_ARCHITECTURE/2020_SINGLE-FAMILY HOUSING – HOUSE PROJECT IN TOURNAI": {
    tag: "Projet · Plans",
    desc: {
      fr: "Projet de maison individuelle inspiré de la Maison 4×4 de Tadao Ando (bac 2) : dégager les étages supérieurs pour ouvrir la vue, libérer la lumière, créer une relation entre espace intérieur et paysage. Travail sur la cohabitation de deux familles sous un même toit, organisant l'espace pour concilier intimité et partage. Plans, élévations et coupes réalisés sous AutoCAD.",
      en: "Single-family house project inspired by Tadao Ando's House 4×4 (second-year bachelor project): opening up the upper floors to free the view, let in light, and create a relationship between interior space and landscape. Work on the cohabitation of two families under one roof, organizing the space to reconcile privacy and sharing. Plans, elevations, and sections produced in AutoCAD.",
      nl: "Eengezinswoningproject geïnspireerd op het Huis 4×4 van Tadao Ando (bachelorjaar 2): de bovenverdiepingen openen om het uitzicht vrij te maken, licht binnen te laten en een relatie te creëren tussen binnenruimte en landschap. Werk rond de samenwoning van twee gezinnen onder één dak, waarbij de ruimte zo is georganiseerd dat privacy en delen worden verzoend. Plannen, gevels en doorsneden gemaakt in AutoCAD."
    }
  },
  "3_ARCHITECTURE/2019_SCHOOL CONSTRUCTION IN TOGO": {
    tag: "Architecture · Humanitaire",
    desc: {
      fr: "Projet à vocation sociale et humanitaire consistant en la conception et la planification d'une école primaire durable au Togo. Intégration de matériaux locaux et techniques d'architecture bioclimatique.",
      en: "Social and humanitarian project focusing on the design and planning of a sustainable primary school in Togo. Integration of local materials and bioclimatic architecture techniques.",
      nl: "Sociaal en humanitair project gericht op het ontwerp en de planning van een duurzame basisschool in Togo. Integratie van lokale materialen en bioclimatische architectuurtechnieken."
    }
  },
  "3_ARCHITECTURE/2018_DRAWINGS": {
    tag: "Dessin · Plans",
    desc: {
      fr: "Collection de croquis architecturaux, études de perspectives et dessins à main levée. Exploration graphique des textures, de la lumière et du rapport d'échelle urbain.",
      en: "Collection of architectural sketches, perspective studies, and hand-drawn designs. Graphic exploration of textures, light, and urban scale relationships.",
      nl: "Verzameling van architectonische schetsen, perspectiefstudies en handgetekende ontwerpen. Grafische verkenning van texturen, licht en stedelijke schaalverhoudingen."
    }
  },
  "3_ARCHITECTURE/2018_POTTERY, ART, AND FORMS": {
    tag: "Art · Design",
    desc: {
      fr: "Étude et modélisation plastique de formes de poterie traditionnelle. Travail conceptuel sur les proportions, le volume et le vide fonctionnel. Six objets créés au tour et par d'autres méthodes (pinching) en collaboration avec ma sœur.",
      en: "Study and sculptural modeling of traditional pottery shapes. Conceptual work on proportions, volume, and functional negative space. Six objects created on the wheel and using other techniques (pinching), in collaboration with my sister.",
      nl: "Studie en beeldhouwkundige modellering van traditionele aardewerkvormen. Conceptueel werk rond proporties, volume en functionele negatieve ruimte. Zes objecten gemaakt op de draaischijf en met andere technieken (pinching), in samenwerking met mijn zus."
    }
  },
  "4_VIDEO/2024_MAGNOLIA": {
    tag: "Court-métrage · Cinéma",
    desc: {
      fr: "Production, scénarisation et réalisation technique d'un court-métrage documentaire intitulé Magnolia. Collaboration avec ma sœur Roxane, ergothérapeute, pour capturer le quotidien des résidents d'une maison de repos. Témoignages des résidents, ambiance et vie quotidienne. Équipement modeste : appareil photo, deux téléphones, stabilisateur.",
      en: "Production, scriptwriting, and technical direction of a documentary short film entitled Magnolia. Collaboration with my sister Roxane, an occupational therapist, to capture the daily life of residents in a retirement home. Resident testimonials, atmosphere, and everyday life. Modest equipment: a camera, two phones, and a stabilizer.",
      nl: "Productie, scriptschrijven en technische regie van een documentaire kortfilm getiteld Magnolia. Samenwerking met mijn zus Roxane, ergotherapeute, om het dagelijks leven van bewoners van een rusthuis vast te leggen. Getuigenissen van bewoners, sfeer en dagelijks leven. Bescheiden uitrusting: een camera, twee telefoons en een stabilizer."
    }
  },
  "4_VIDEO/2023_LE CIMETIERE MARIN": {
    tag: "Documentaire · Patrimoine",
    desc: {
      fr: "Captation d'images et montage pour un reportage documentaire sur le cimetière marin de Saint-Jean-de-l'Île-d'Orléans (Québec). Entretien avec Pierre Lahoud, historien et photographe local. Combinaison de la cartographie (QGIS) et du montage vidéo (Final Cut) pour valoriser ce patrimoine religieux exceptionnel.",
      en: "Footage capture and editing for a documentary report on the marine cemetery of Saint-Jean-de-l'Île-d'Orléans (Quebec). Interview with Pierre Lahoud, local historian and photographer. Combination of mapping (QGIS) and video editing (Final Cut) to showcase this exceptional religious heritage.",
      nl: "Beeldopname en montage voor een documentaire reportage over de zeebegraafplaats van Saint-Jean-de-l'Île-d'Orléans (Quebec). Interview met Pierre Lahoud, lokaal historicus en fotograaf. Combinatie van cartografie (QGIS) en videomontage (Final Cut) om dit uitzonderlijke religieuze erfgoed in de kijker te zetten."
    }
  },
  "4_VIDEO/2022_CRASSIERS": {
    tag: "Documentaire · Paysage",
    desc: {
      fr: "Reportage et prise de vue vidéo sur le paysage industriel singulier des crassiers de charbonnage de Saint-Étienne. Regard sur la reconversion de la nature et la mémoire industrielle de cette région.",
      en: "Video report and footage on the unique industrial landscape of the coal slag heaps of Saint-Étienne. A perspective on nature's reclamation and the industrial memory of this region.",
      nl: "Videoreportage en opnamen van het unieke industriële landschap van de kolenslakkenbergen van Saint-Étienne. Een blik op de terugkeer van de natuur en het industriële geheugen van deze streek."
    }
  },
  "4_VIDEO/2022_LES COULISSES DE L'HISTORIAL": {
    tag: "Musée · Coulisses · Vidéo",
    desc: {
      fr: "Série de capsules vidéo dévoilant les coulisses, les réserves et le travail invisible de conservation au sein de l'Historial. Projet mené de A à Z pendant un stage de 3 mois. Six métiers présentés : conservateur, médiateur, chargé de missions multimédias, directeur, technicien polyvalent, chargé de gestion et valorisation des collections.",
      en: "Series of short video segments revealing the behind-the-scenes areas, storage collections, and invisible preservation work at the Historial. Project managed from A to Z during a 3-month internship. Six professions featured: curator, mediator, multimedia project officer, director, all-round technician, and collections management and enhancement officer.",
      nl: "Reeks korte videoreportages die een blik werpen achter de schermen, in de depots en het onzichtbare behoudswerk binnen het Historial. Project van A tot Z geleid tijdens een stage van 3 maanden. Zes beroepen belicht: conservator, bemiddelaar, multimediaverantwoordelijke, directeur, allround technicus, en verantwoordelijke voor collectiebeheer en -valorisatie."
    }
  },
  "4_VIDEO/2020_ART ANIMATION": {
    tag: "Animation · Art",
    desc: {
      fr: "Création d'animations numériques poétiques à partir de toiles picturales de maîtres (Caspar David Friedrich, Claude Monet). Évocation de la peinture en mouvement. Rendre l'œuvre accessible par la médiation numérique : barque qui bouge, lumière qui ondule, dézoom progressif. Donner du mouvement à une image fixe pour inviter le regard à entrer dans l'œuvre.",
      en: "Creation of poetic digital animations based on paintings by master artists (Caspar David Friedrich, Claude Monet). An evocation of painting in motion. Making the artwork accessible through digital mediation: a boat drifting, light rippling, a gradual zoom-out. Bringing movement to a still image to invite the eye into the artwork.",
      nl: "Creatie van poëtische digitale animaties gebaseerd op meesterwerken (Caspar David Friedrich, Claude Monet). Een evocatie van schilderkunst in beweging. Het kunstwerk toegankelijk maken via digitale bemiddeling: een bootje dat beweegt, licht dat golft, een geleidelijke uitzoom. Beweging geven aan een stilstaand beeld om de blik uit te nodigen het kunstwerk binnen te treden."
    }
  },
  "5_MUSEE/2022_FURNITURE ARRANGEMENT": {
    tag: "Design · Mobilier",
    desc: {
      fr: "3 nouveaux meubles d'exposition muséographique (vitrines, socles, présentoirs) avec étude de leur intégration scénographique. Réflexion sur le choix des œuvres à exposer en fonction des contraintes techniques et esthétiques de chaque meuble. Assemblage et mise en scène des objets via photomontage sous Photoshop pour visualiser le rendu final avant fabrication. Optimisation des flux de visiteurs, de la sécurité des œuvres et de la mise en valeur des collections.",
      en: "3 new museographic exhibition furniture pieces (display cases, plinths, stands) with a study of their scenographic integration. Reflection on the choice of works to display based on the technical and aesthetic constraints of each piece. Assembly and staging of objects via Photoshop photomontage to visualize the final result before fabrication. Optimization of visitor flow, artwork security, and collection enhancement.",
      nl: "3 nieuwe museale tentoonstellingsmeubelen (vitrines, sokkels, standaards) met een studie van hun scenografische integratie. Reflectie over de keuze van de tentoon te stellen werken op basis van de technische en esthetische beperkingen van elk meubelstuk. Assemblage en enscenering van objecten via Photoshop-fotomontage om het eindresultaat te visualiseren vóór productie. Optimalisatie van bezoekersstromen, veiligheid van de kunstwerken en waardering van de collecties."
    }
  },
  "5_MUSEE/2022_COMIC STRIP – CHATRLIE": {
    tag: "Bande Dessinée · Illustration",
    desc: {
      fr: "Scénarisation, encrage et mise en couleur d'une bande dessinée originale. Travail d'illustration narrative et d'expression séquentielle des personnages. Raconter l'histoire de la Première Guerre mondiale à travers les yeux de Chatrlie, un chat dont le maître s'est engagé dans l'armée. La BD comme outil de médiation historique.",
      en: "Scriptwriting, inking, and coloring of an original comic strip. Narrative illustration work and sequential expression of characters. Telling the story of World War I through the eyes of Chatrlie, a cat whose owner enlisted in the army. Comics as a tool for historical mediation.",
      nl: "Scriptschrijven, inktwerk en inkleuren van een origineel stripverhaal. Narratief illustratiewerk en sequentiële expressie van personages. Het verhaal van de Eerste Wereldoorlog vertellen door de ogen van Chatrlie, een kat wiens baasje dienst nam in het leger. Het stripverhaal als instrument voor historische bemiddeling."
    }
  },
  "5_MUSEE/2022_ SCAVENGER HUNT – MYSMARTJOURNEY": {
    tag: "Jeu · Médiation · Numérique",
    desc: {
      fr: "Création d'un parcours de visite ludique et interactif sur mobile en utilisant la plateforme MySmartJourney. Médiation culturelle par QR codes pour valoriser le patrimoine de Château-Richer (Canada). Croiser technologie mobile et découverte culturelle : transformer un parcours en expérience interactive.",
      en: "Creation of a playful and interactive mobile visitor trail using the MySmartJourney platform. Cultural mediation via QR codes to showcase the heritage of Château-Richer (Canada). Combining mobile technology and cultural discovery: turning a walking trail into an interactive experience.",
      nl: "Creatie van een speelse en interactieve mobiele bezoekersroute met het MySmartJourney-platform. Culturele bemiddeling via QR-codes om het erfgoed van Château-Richer (Canada) in de kijker te zetten. Mobiele technologie en culturele ontdekking combineren: een wandelroute omzetten in een interactieve ervaring."
    }
  },
  "5_MUSEE/2022_MUSEUM GUIDE AND LECTURER": {
    tag: "Médiation · Patrimoine",
    desc: {
      fr: "Conception de visites guidées thématiques, médiation en face-à-face et conférences pour divers publics. Transmission active de l'histoire et des valeurs patrimoniales.",
      en: "Design of themed guided tours, face-to-face mediation, and lectures for various audiences. Active transmission of history and heritage values.",
      nl: "Ontwerp van thematische rondleidingen, face-to-face bemiddeling en lezingen voor diverse doelgroepen. Actieve overdracht van geschiedenis en erfgoedwaarden."
    }
  },
  "5_MUSEE/2022_PASSAGES INSOLITES": {
    tag: "Patrimoine · Médiation",
    desc: {
      fr: "Projet de mise en valeur d'espaces urbains insolites par l'art public et la médiation culturelle. Création de parcours reliant l'insolite urbain à l'histoire collective.",
      en: "Valuing unusual urban spaces through public art installations and cultural mediation. Creating trails connecting unusual city spaces with collective history.",
      nl: "Waardering van ongebruikelijke stedelijke ruimtes door middel van openbare kunstinstallaties en culturele bemiddeling. Routes creëren die ongewone stadsruimtes verbinden met de collectieve geschiedenis."
    }
  },
  "5_MUSEE/2021_QUEIXOPERRA MUSEUM": {
    tag: "Musée · Exposition",
    desc: {
      fr: "Définition du projet scientifique et culturel d'une nouvelle institution muséale à Queixoperra (Portugal). Projet de co-construction avec les habitants, valorisation d'une culture de subsistance (vin, poterie, laine). Première expérience de cartographie QGIS sur le terrain. Interviews, vues du village, ambiances capturées en vidéo.",
      en: "Definition of the scientific and cultural project for a new museum institution in Queixoperra (Portugal). A co-construction project with local residents, valuing a subsistence culture (wine, pottery, wool). First hands-on field experience with QGIS mapping. Interviews, village views, and atmosphere captured on video.",
      nl: "Definitie van het wetenschappelijk en cultureel project voor een nieuwe museuminstelling in Queixoperra (Portugal). Een co-constructieproject met de lokale bewoners, ter waardering van een bestaanscultuur (wijn, aardewerk, wol). Eerste praktijkervaring met QGIS-cartografie in het veld. Interviews, dorpsgezichten en sfeer vastgelegd op video."
    }
  },
  "6_RECHERCHE/2026_THESIS ON 3D MODEL FEATURE EXTRACTATIONS": {
    tag: "3D · Recherche · Signes",
    desc: {
      fr: "Mémoire de recherche ULG (2025-2026) portant sur l'extraction et la segmentation semi-automatique de signes graphiques à partir de modèles 3D de tablettes Rongorongo (Rapa Nui). Le pipeline combine des rendus 2D issus de la photogrammétrie (MSII, Radiance Scaling, orthophotos) avec le modèle de segmentation SAM 3 (Segment Anything Model) et des méthodes classiques de vision par ordinateur (binarisation, squelettisation Zhang-Suen, analyse de composantes connexes). L'objectif est de produire des inventaires morphologiques de signes reproductibles et exploitables en paléographie numérique, en s'affranchissant de la subjectivité des fac-similés dessinés à la main.",
      en: "ULG research thesis (2025-2026) on the semi-automatic extraction and segmentation of graphic signs from 3D models of Rongorongo tablets (Rapa Nui). The pipeline combines 2D renderings from photogrammetry (MSII, Radiance Scaling, orthophotos) with the SAM 3 (Segment Anything Model) segmentation model and classic computer vision methods (binarization, Zhang-Suen skeletonization, connected component analysis). The goal is to produce reproducible morphological sign inventories usable in digital paleography, moving away from the subjectivity of hand-drawn facsimiles.",
      nl: "ULG-onderzoeksscriptie (2025-2026) over de semi-automatische extractie en segmentatie van grafische tekens uit 3D-modellen van Rongorongo-tabletten (Rapa Nui). De pipeline combineert 2D-renders afkomstig van fotogrammetrie (MSII, Radiance Scaling, orthofoto's) met het SAM 3-segmentatiemodel (Segment Anything Model) en klassieke computer-visiemethoden (binarisatie, Zhang-Suen-skeletvorming, analyse van verbonden componenten). Het doel is reproduceerbare morfologische teken-inventarissen te produceren die bruikbaar zijn in digitale paleografie, los van de subjectiviteit van handgetekende facsimile's."
    }
  },
  "6_RECHERCHE/2022_ARTICLE ON THE HOUSE AT CÔTE-DE-BEAUPRÉ": {
    tag: "Article · Publication",
    desc: {
      fr: "Article d'analyse historique et constructive sur l'évolution de la Maison de la Côte-de-Beaupré (Québec). Étude des techniques de préservation du patrimoine bâti local, de l'architecture traditionnelle québécoise (toits à deux versants, galeries, matériaux locaux) à son adaptation contemporaine, en lien avec l'identité territoriale et le climat rigoureux.",
      en: "Historical and structural analysis article on the evolution of the Maison de la Côte-de-Beaupré (Quebec). Study of local built heritage preservation techniques, from traditional Quebec architecture (gable roofs, galleries, local materials) to its contemporary adaptation, in relation to territorial identity and the harsh climate.",
      nl: "Historisch en structureel analyseartikel over de evolutie van het Huis van de Côte-de-Beaupré (Quebec). Studie van technieken voor het behoud van lokaal bouwkundig erfgoed, van de traditionele Quebecse architectuur (zadeldaken, galerijen, lokale materialen) tot de hedendaagse aanpassing ervan, in verband met territoriale identiteit en het strenge klimaat."
    }
  },
  "6_RECHERCHE/2022_RESEARCH ON EUROPEAN IDENTITY": {
    tag: "Identité · Europe · Recherche",
    desc: {
      fr: "Mémoire de master DYCLAM+ (2021) portant sur la scénographie de l'identité européenne à travers quatre institutions muséales : le Deutsches Historisches Museum (Berlin), le Musée européen Schengen (Luxembourg), le Lieu d'Europe (Strasbourg) et la Maison de l'histoire européenne (Bruxelles). L'étude analyse les phases d'émergence, les partis pris architecturaux et scénographiques, ainsi que la réception médiatique et publique de ces musées. Elle explore les tensions entre récit national et européen, la place des valeurs communes (paix, démocratie, droits de l'homme), et propose une réflexion sur les conditions de possibilité d'un \"musée idéal\" de l'identité européenne.",
      en: "DYCLAM+ master's thesis (2021) on the scenography of European identity through four museum institutions: the Deutsches Historisches Museum (Berlin), the European Museum Schengen (Luxembourg), the Lieu d'Europe (Strasbourg), and the House of European History (Brussels). The study analyzes the emergence phases, architectural and scenographic choices, and the media and public reception of these museums. It explores the tensions between national and European narratives, the place of shared values (peace, democracy, human rights), and offers a reflection on the conditions for a possible \"ideal museum\" of European identity.",
      nl: "DYCLAM+ masterscriptie (2021) over de scenografie van de Europese identiteit aan de hand van vier museuminstellingen: het Deutsches Historisches Museum (Berlijn), het Europees Museum Schengen (Luxemburg), het Lieu d'Europe (Straatsburg) en het Huis van de Europese Geschiedenis (Brussel). De studie analyseert de ontstaansfasen, de architecturale en scenografische keuzes, en de mediatieke en publieke ontvangst van deze musea. Ze verkent de spanningen tussen nationaal en Europees narratief, de plaats van gedeelde waarden (vrede, democratie, mensenrechten), en biedt een reflectie over de voorwaarden voor een mogelijk \"ideaal museum\" van de Europese identiteit."
    }
  },
};

/* Texte affiché quand un projet n'a pas encore d'entrée dans
   PROJECT_OVERRIDES (ex: dossier tout juste ajouté sur le disque). */
const DEFAULT_TAG = { fr: 'Nouveau projet', en: 'New project', nl: 'Nieuw project' };
const DEFAULT_DESC = {
  fr: 'Description à venir — ajoutez ce projet dans PROJECT_OVERRIDES (js/projects.js) pour personnaliser ce texte.',
  en: 'Description coming soon — add this project to PROJECT_OVERRIDES (js/projects.js) to customize this text.',
  nl: 'Beschrijving volgt — voeg dit project toe aan PROJECT_OVERRIDES (js/projects.js) om deze tekst aan te passen.'
};

/* Construit PROJECTS_DATA (même forme qu'avant : un tableau de
   catégories, chacune avec ses projets) à partir de la structure
   auto-détectée + des overrides manuels ci-dessus. */
function buildProjectsData() {
  const structure = window.PROJECTS_STRUCTURE || {};
  const catFolders = Object.keys(structure).sort((a, b) => {
    const na = parseInt(a, 10); const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
    return a.localeCompare(b);
  });

  return catFolders.map((catFolder, catIndex) => {
    const meta = metaForCategory(catFolder, catIndex);
    const projects = (structure[catFolder] || []).map(entry => {
      const override = PROJECT_OVERRIDES[entry.folder] || {};
      return {
        title: override.title || entry.title,
        tag: override.tag || DEFAULT_TAG.fr,
        desc: override.desc || DEFAULT_DESC,
        folder: entry.folder
      };
    });
    return {
      id: meta.id,
      icon: meta.icon,
      label: meta.label,
      color: meta.color,
      projects
    };
  });
}

const PROJECTS_DATA = buildProjectsData();


/* ───────────────────────────────────────────────────────────────────────
   STATE
   ─────────────────────────────────────────────────────────────────────── */
let currentLang = () => document.body.dataset.lang || 'fr';
let activeCategoryId = PROJECTS_DATA[0].id;
let lightboxItems = [];  // array of parsed {type, url, path}
let lightboxIndex = 0;
let currentProject = null;

/* ───────────────────────────────────────────────────────────────────────
   INIT — Called once when Projects panel is first opened
   ─────────────────────────────────────────────────────────────────────── */
function initProjects() {
  if (document.getElementById('projectsOverlay')) {
    console.log('[Projects] overlay already exists, skipping init');
    return;
  }
  console.log('[Projects] building HTML...');
  try {
    buildProjectsHTML();
    bindProjectsEvents();
    console.log('[Projects] init OK');
  } catch (e) {
    console.error('[Projects] init ERROR:', e);
    throw e;
  }
}

/* ───────────────────────────────────────────────────────────────────────
   BUILD HTML
   ─────────────────────────────────────────────────────────────────────── */
function buildProjectsHTML() {
  const overlay = document.createElement('div');
  overlay.className = 'projects-overlay hidden';
  overlay.id = 'projectsOverlay';
  overlay.setAttribute('data-lenis-prevent', 'true');

  overlay.innerHTML = `
    <div class="projects-panel" data-lenis-prevent="true">
      <!-- Close -->
      <button class="projects-close" id="projectsClose" aria-label="Close">✕</button>

      <!-- Header identical to 12a / 12b -->
      <h2 class="projects-heading">
        <span class="lang-en">Projects</span>
        <span class="lang-fr">Projets</span>
        <span class="lang-nl">Projecten</span>
      </h2>

      <!-- Category tabs -->
      <div class="projects-cats-wrap" id="projectsCatsWrap">
        <nav class="projects-cats" id="projectsCats">
          ${PROJECTS_DATA.map(cat => `
            <button class="projects-cat-btn${cat.id === activeCategoryId ? ' active' : ''}"
                    data-cat="${cat.id}"
                    style="--cat-color:${cat.color}">
              <span class="projects-cat-icon">${cat.icon}</span>
              <span class="lang-en">${cat.label.en}</span>
              <span class="lang-fr">${cat.label.fr}</span>
              <span class="lang-nl">${cat.label.nl}</span>
            </button>
          `).join('')}
        </nav>
      </div>

      <!-- Grid area -->
      <div class="projects-body" id="projectsBody" data-lenis-prevent="true">
        ${buildCategoryGrid(PROJECTS_DATA[0])}
      </div>
    </div>

    <!-- Lightbox with Split Layout (Instagram post style) -->
    <div class="proj-lightbox hidden" id="projLightbox" data-lenis-prevent="true">
      <div class="proj-lb-backdrop" id="projLbBackdrop"></div>
      <div class="proj-lb-card" data-lenis-prevent="true">
        <button class="proj-lb-close" id="projLbClose">✕</button>
        
        <div class="proj-lb-split">
          <!-- Left side: Image/Video viewport -->
          <div class="proj-lb-media-section">
            <button class="proj-lb-nav proj-lb-prev" id="projLbPrev">‹</button>
            <div class="proj-lb-img-wrap" id="projLbMediaWrap">
              <img class="proj-lb-img" id="projLbImg" src="" alt="">
            </div>
            <button class="proj-lb-nav proj-lb-next" id="projLbNext">›</button>
            <div class="proj-lb-counter" id="projLbCounter">1 / 1</div>
          </div>
          
          <!-- Right side: Instagram-style description sidebar -->
          <div class="proj-lb-info-section">
            <div class="proj-lb-profile">
              <div class="proj-lb-avatar">LV</div>
              <div class="proj-lb-user-details">
                <div class="proj-lb-username">Lionel van Vyve</div>
                <div class="proj-lb-user-role">Geomatics &amp; Heritage</div>
              </div>
            </div>
            
            <div class="proj-lb-details-content" data-lenis-prevent="true">
              <h3 class="proj-lb-project-title" id="projLbTitle"></h3>
              <div class="proj-lb-tag-badge" id="projLbTag"></div>
              <p class="proj-lb-desc" id="projLbDesc"></p>
            </div>
            
            <div class="proj-lb-footer">
              <span class="lang-fr">📍 Région de Bruxelles / Wallonie</span>
              <span class="lang-en">📍 Brussels Area / Wallonia</span>
              <span class="lang-nl">📍 Brussels Gewest / Wallonië</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function buildCategoryGrid(cat) {
  // Seuls les projets ayant au moins une image réelle sur le disque
  // sont affichés — un projet sans image (dossier vide, déplacé, ou
  // exclu via NON) disparaît automatiquement de la grille, et
  // réapparaît tout seul dès que des images existent et que le
  // script de mise à jour est relancé.
  const visible = cat.projects
    .map((proj, pi) => ({ proj, pi }))
    .filter(({ proj }) => resolveProjectItems(proj).length > 0);

  return `
    <div class="projects-grid" id="projectsGrid" data-cat="${cat.id}">
      ${visible.map(({ proj, pi }) => buildProjectCard(proj, pi, cat)).join('')}
    </div>
  `;
}

function buildProjectCard(proj, pi, cat) {
  const parsedItems = resolveProjectItems(proj);
  const hasItems = parsedItems.length > 0;
  const count = parsedItems.length;

  // Thumbnail : toujours la vraie image fournie (photo de la même
  // catégorie/numéro que le lien vidéo), affichée exactement comme
  // les autres images du site (format portrait, ajustée pile dedans).
  let thumbHtml = '';
  if (hasItems) {
    const first = parsedItems[0];
    if (first.type === 'youtube') {
      const localThumb = first.thumb || first.path;
      if (localThumb) {
        thumbHtml = `<img src="${localThumb}" alt="${proj.title}" loading="lazy">`;
      } else {
        const vid = getYouTubeVideoId(first.url);
        const ytThumb = vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : '';
        thumbHtml = ytThumb
          ? `<img src="${ytThumb}" alt="${proj.title}" loading="lazy">`
          : `<div class="proj-card-placeholder proj-card-yt-placeholder">🎬</div>`;
      }
    } else {
      thumbHtml = `<img src="${first.url}" alt="${proj.title}" loading="lazy">`;
    }
  }

  // Petit badge triangle "vidéo" si le premier visuel est un lien vidéo
  const firstIsYt = hasItems && parsedItems[0].type === 'youtube';

  return `
    <div class="proj-card${hasItems ? ' proj-card--has-images' : ' proj-card--no-image'}"
         data-project-idx="${pi}"
         data-cat="${cat.id}"
         style="--cat-color:${cat.color}"
         ${hasItems ? 'role="button" tabindex="0"' : ''}>
      <div class="proj-card-thumb">
        ${hasItems ? thumbHtml : `<div class="proj-card-placeholder">${cat.icon}</div>`}
        ${count > 1 ? `<div class="proj-card-count">⊞ ${count}</div>` : ''}
        ${firstIsYt ? `<div class="proj-card-play-badge"><svg viewBox="0 0 24 24" width="12" height="12"><polygon points="6,4 20,12 6,20" fill="#111"/></svg></div>` : ''}
        ${hasItems ? `<div class="proj-card-overlay"><span class="proj-card-overlay-icon">⊕</span></div>` : ''}
      </div>
      <div class="proj-card-info">
        <div class="proj-card-title">${proj.title}</div>
        <div class="proj-card-tag">${proj.tag}</div>
      </div>
    </div>
  `;
}

/* ───────────────────────────────────────────────────────────────────────
   EVENTS
   ─────────────────────────────────────────────────────────────────────── */
function bindProjectsEvents() {
  document.getElementById('projectsClose').addEventListener('click', closeProjects);
  document.getElementById('projectsOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('projectsOverlay')) closeProjects();
  });

  document.getElementById('projectsCats').addEventListener('click', e => {
    const btn = e.target.closest('.projects-cat-btn');
    if (!btn) return;
    const catId = btn.dataset.cat;
    if (catId === activeCategoryId) return;
    activeCategoryId = catId;
    document.querySelectorAll('.projects-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = PROJECTS_DATA.find(c => c.id === catId);
    const body = document.getElementById('projectsBody');
    body.style.opacity = '0';
    body.style.transform = 'translateY(12px)';
    setTimeout(() => {
      body.innerHTML = buildCategoryGrid(cat);
      bindGridEvents();
      body.style.opacity = '';
      body.style.transform = '';
    }, 180);
  });

  bindGridEvents();
  bindCatsScrollFade();

  document.getElementById('projLbClose').addEventListener('click', closeLightbox);
  document.getElementById('projLbBackdrop').addEventListener('click', closeLightbox);
  document.getElementById('projLbPrev').addEventListener('click', () => moveLightbox(-1));
  document.getElementById('projLbNext').addEventListener('click', () => moveLightbox(1));
  document.addEventListener('keydown', projectsKeyHandler);
}

/* Shows a soft fade on whichever edge(s) of the category row still have
   hidden content, so users know there's more to scroll to. Re-checked on
   scroll and on resize (e.g. rotating a phone or resizing the browser). */
function bindCatsScrollFade() {
  const wrap = document.getElementById('projectsCatsWrap');
  const nav = document.getElementById('projectsCats');
  if (!wrap || !nav) return;

  const update = () => {
    const maxScroll = nav.scrollWidth - nav.clientWidth;
    const atStart = nav.scrollLeft <= 2;
    const atEnd = nav.scrollLeft >= maxScroll - 2;
    wrap.classList.toggle('scroll-start-hidden', !atStart && maxScroll > 2);
    wrap.classList.toggle('scroll-end-hidden', !atEnd && maxScroll > 2);
  };

  nav.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // Run after layout settles (fonts/icons can shift widths slightly).
  requestAnimationFrame(update);
  setTimeout(update, 250);
}

function bindGridEvents() {
  document.querySelectorAll('.proj-card--has-images').forEach(card => {
    card.addEventListener('click', () => openLightboxFromCard(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightboxFromCard(card); });
  });
}

/* ───────────────────────────────────────────────────────────────────────
   LIGHTBOX
   ─────────────────────────────────────────────────────────────────────── */
function openLightboxFromCard(card) {
  const pi = parseInt(card.dataset.projectIdx, 10);
  const catId = card.dataset.cat;
  const cat = PROJECTS_DATA.find(c => c.id === catId);
  if (!cat) return;
  const proj = cat.projects[pi];
  if (!proj) return;
  const items = resolveProjectItems(proj);
  if (!items.length) return;

  currentProject = proj;
  lightboxItems = items;
  lightboxIndex = 0;

  document.getElementById('projLbTitle').textContent = proj.title;
  document.getElementById('projLbTag').textContent = proj.tag;
  updateLightboxDesc();
  updateLightboxMedia();

  document.getElementById('projLightbox').classList.remove('hidden');
  setTimeout(() => document.getElementById('projLightbox').classList.add('proj-lb-visible'), 10);
}

function updateLightboxDesc() {
  if (!currentProject) return;
  const lang = currentLang();
  const desc = currentProject.desc[lang] || currentProject.desc['fr'] || '';
  document.getElementById('projLbDesc').textContent = desc;
}

function updateLightboxMedia() {
  const wrap = document.getElementById('projLbMediaWrap');
  const item = lightboxItems[lightboxIndex];

  if (item.type === 'youtube') {
    // Vignette = la vraie image fournie par l'utilisateur, ajustée
    // exactement comme les autres images (même format portrait).
    // Un petit triangle play permet de lancer la vidéo ICI, dans le
    // site (iframe intégrée), sans ouvrir YouTube dans un nouvel onglet.
    let thumbUrl = item.thumb || item.path || '';
    if (!thumbUrl) {
      const vid = getYouTubeVideoId(item.url);
      thumbUrl = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : '';
    }

    wrap.innerHTML = `
      <div class="proj-lb-video-wrap" id="projLbVideoWrap">
        ${thumbUrl
          ? `<img class="proj-lb-img" src="${thumbUrl}" alt="${currentProject ? currentProject.title : ''}">`
          : `<div class="proj-lb-yt-fallback">🎬</div>`
        }
        <button class="proj-lb-play-btn" id="projLbPlayBtn" type="button" aria-label="Lire la vidéo">
          <svg viewBox="0 0 24 24" width="22" height="22"><polygon points="7,4 20,12 7,20" fill="#111"/></svg>
        </button>
      </div>
    `;
    const playBtn = document.getElementById('projLbPlayBtn');
    if (playBtn) playBtn.addEventListener('click', () => playInlineVideo(item.url));
  } else {
    wrap.innerHTML = `<img class="proj-lb-img" id="projLbImg" src="${item.url}" alt="${currentProject ? currentProject.title : ''}">`;
  }

  document.getElementById('projLbCounter').textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;

  const prevBtn = document.getElementById('projLbPrev');
  const nextBtn = document.getElementById('projLbNext');
  prevBtn.style.visibility = lightboxIndex > 0 ? 'visible' : 'hidden';
  nextBtn.style.visibility = lightboxIndex < lightboxItems.length - 1 ? 'visible' : 'hidden';
}

/* ───────────────────────────────────────────────────────────────────────
   LECTURE VIDÉO INTÉGRÉE — remplace la vignette par un lecteur intégré
   au site (iframe), sans jamais rediriger vers YouTube directement.
   ─────────────────────────────────────────────────────────────────────── */
function getEmbedUrl(url) {
  const vid = getYouTubeVideoId(url);
  if (vid) return `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`;
  // Lien vidéo non-YouTube : on tente quand même l'intégration directe.
  return url;
}

function playInlineVideo(url) {
  const wrap = document.getElementById('projLbVideoWrap');
  if (!wrap) return;
  const embedUrl = getEmbedUrl(url);
  wrap.innerHTML = `
    <iframe class="proj-lb-video-iframe"
            src="${embedUrl}"
            title="Vidéo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
  `;
}

function moveLightbox(dir) {
  const newIdx = lightboxIndex + dir;
  lightboxIndex = newIdx;
  updateLightboxMedia();
}

function closeLightbox() {
  const lb = document.getElementById('projLightbox');
  lb.classList.remove('proj-lb-visible');
  setTimeout(() => lb.classList.add('hidden'), 300);
}

function projectsKeyHandler(e) {
  const lb = document.getElementById('projLightbox');
  if (!lb || lb.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') moveLightbox(-1);
  if (e.key === 'ArrowRight') moveLightbox(1);
  if (e.key === 'Escape') closeLightbox();
}

/* ───────────────────────────────────────────────────────────────────────
   OPEN / CLOSE
   ─────────────────────────────────────────────────────────────────────── */
function openProjects() {
  console.log('[Projects] openProjects() called');
  if (window.lenisInstance) window.lenisInstance.stop();
  document.documentElement.classList.add('panel-open', 'projects-open');
  document.body.classList.add('panel-open', 'projects-open');
  try {
    initProjects();
    const overlay = document.getElementById('projectsOverlay');
    if (!overlay) {
      console.error('[Projects] projectsOverlay element not found after init!');
      return;
    }
    overlay.classList.remove('hidden');
    void overlay.offsetWidth;
    overlay.classList.add('projects-visible');
    console.log('[Projects] panel opened');
  } catch (e) {
    console.error('[Projects] openProjects ERROR:', e);
  }
}

function closeProjects() {
  document.documentElement.classList.remove('panel-open', 'projects-open');
  document.body.classList.remove('panel-open', 'projects-open');
  const overlay = document.getElementById('projectsOverlay');
  if (!overlay) return;
  overlay.classList.remove('projects-visible');
  setTimeout(() => overlay.classList.add('hidden'), 400);
  if (typeof window.returnToBureau === 'function') window.returnToBureau();
}

/* ───────────────────────────────────────────────────────────────────────
   EXPORT + auto-hook zone11C once DOM is ready
   ─────────────────────────────────────────────────────────────────────── */
window.openProjects = openProjects;
window.closeProjects = closeProjects;

document.addEventListener('DOMContentLoaded', function () {
  console.log('[Projects] DOMContentLoaded — hooking zone11C fallback');
  var zones = ['zone11C_shelf', 'zone11C_station'];
  zones.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function () {
        console.log('[Projects] zone11C clicked via fallback listener:', id);
        openProjects();
      });
      console.log('[Projects] fallback listener attached to', id);
    } else {
      console.warn('[Projects] element not found:', id);
    }
  });
});
