/* ================================================================
   AMBIENT-SOUND.JS — Piste d'ambiance en boucle (fichier audio)
   Joue "audio/ambiance-fond.mp3" en boucle continue et discrète,
   dès le 1er geste utilisateur (règle des navigateurs), avec un
   fondu d'entrée doux. Contrôlable via le bouton 🔊/🔇
   (#soundToggleBtn dans index.html), qui appelle déjà setMuted().

   ► RÉGLAGES RAPIDES :
     VOLUME_CIBLE   → volume max une fois lancé (0 à 1)
     FADE_IN_SEC    → durée du fondu d'entrée au démarrage
     AUDIO_SRC      → chemin du fichier audio (mp3 + repli webm)
   ================================================================ */

(function () {
  const VOLUME_CIBLE = 0.35;   // Discret, en fond — augmenter si trop faible
  const FADE_IN_SEC = 2.5;

  // Chemins relatifs à index.html — adapte si tu déplaces le dossier
  const AUDIO_SRC_MP3 = 'audio/ambiance-fond.mp3';
  const AUDIO_SRC_WEBM = 'audio/ambiance-fond.webm';

  let ctx = null;
  let master = null;
  let sourceNode = null;
  let buffer = null;
  let muted = false;
  let unlocked = false;
  let startedAt = 0;
  let loadingPromise = null;

  function createEngine() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }

  // Charge le fichier (webm si supporté par le navigateur, sinon mp3)
  function loadBuffer() {
    if (loadingPromise) return loadingPromise;

    const canWebm = !!(new Audio().canPlayType && new Audio().canPlayType('audio/webm; codecs="opus"'));
    const url = canWebm ? AUDIO_SRC_WEBM : AUDIO_SRC_MP3;

    loadingPromise = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(decoded => { buffer = decoded; return buffer; })
      .catch(err => {
        console.error('Impossible de charger le son d\'ambiance :', err);
        loadingPromise = null;
      });

    return loadingPromise;
  }

  function startPlayback() {
    if (!ctx || !buffer || sourceNode) return;
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = true;
    sourceNode.connect(master);
    sourceNode.start();
    startedAt = ctx.currentTime;
  }

  // ── API attendue par video.js ───────────────────────────────────

  function init() {
    if (!ctx) createEngine();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    unlocked = true;

    loadBuffer().then(() => {
      if (!buffer) return;
      startPlayback();
      if (!muted) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(VOLUME_CIBLE, ctx.currentTime + FADE_IN_SEC);
      }
    });
  }

  function isMuted() {
    return muted;
  }

  function setMuted(value) {
    muted = !!value;
    if (!ctx || !master) return;
    const target = muted ? 0 : (unlocked ? VOLUME_CIBLE : 0);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.6);
  }

  // Gardée pour compatibilité avec video.js (appelée pendant le scroll) ;
  // la piste étant une ambiance continue, on ne modifie rien ici.
  function onScrollUpdate() {}

  window.AmbientSound = {
    init,
    isMuted,
    setMuted,
    onScrollUpdate
  };

})();
