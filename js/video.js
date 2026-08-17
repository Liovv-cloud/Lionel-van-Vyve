/* ================================================================
   VIDEO.JS — Survol interactif de l'Image 10 pour 11A, 11B et 11C
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;

  // Éléments Intro
  const img0 = document.getElementById('img0');
  const video1 = document.getElementById('video1');
  const img2 = document.getElementById('img2');
  const video3 = document.getElementById('video3');
  const img4 = document.getElementById('img4');
  const info4 = document.getElementById('info4');
  const strongVignette = document.getElementById('strongVignette');
  const mobileVignette = document.getElementById('mobileVignette');

  const charClickZone = document.getElementById('charClickZone');
  const clickHint = document.getElementById('clickHint');
  const scrollNotice = document.getElementById('scrollNotice');
  const skipIntroBtn = document.getElementById('skipIntroBtn');
  const restartIntroBtn = document.getElementById('restartIntroBtn');
  const siteNav = document.getElementById('siteNav');
  const jumpToBureauBtn = document.getElementById('jumpToBureauBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  // Indicateur "Scroll ↓" affiché pendant la lecture des vidéos 5/7/9
  const videoScrollHint = document.getElementById('videoScrollHint');

  // Traduction logic
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      langBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      body.setAttribute('data-lang', e.target.getAttribute('data-lang'));
    });
  });

  // Slides Scroll & Overlays d'infos
  const slideIntro = document.getElementById('slide-intro');
  const slideScroll1 = document.getElementById('slide-scroll-1');
  const slideScroll2 = document.getElementById('slide-scroll-2');
  const slideScroll3 = document.getElementById('slide-scroll-3');

  const video5 = document.getElementById('video5');
  const img6 = document.getElementById('img6');
  const info6 = document.getElementById('info6');

  const video7 = document.getElementById('video7');
  const img8 = document.getElementById('img8');
  const info8 = document.getElementById('info8');

  const video9 = document.getElementById('video9');
  const img10 = document.getElementById('img10');
  const img11A = document.getElementById('img11A');
  const img11B = document.getElementById('img11B');
  const img11C = document.getElementById('img11C');
  const bureauLayer = document.getElementById('bureauLayer');

  const zone11A_map = document.getElementById('zone11A_map');
  const zone11A_globe = document.getElementById('zone11A_globe');
  const zone11B_screen = document.getElementById('zone11B_screen');
  const zone11B_controls = document.getElementById('zone11B_controls');
  const zone11C_shelf = document.getElementById('zone11C_shelf');
  const zone11C_station = document.getElementById('zone11C_station');

  // Slide scroll 4 : Vidéo 13 -> Image 14 (clic) -> Image 15 (contact final)
  const slideScroll4 = document.getElementById('slide-scroll-4');
  const video13 = document.getElementById('video13');
  const img14 = document.getElementById('img14');
  const telClickZone = document.getElementById('telClickZone');
  const img15 = document.getElementById('img15');
  const info15 = document.getElementById('info15');
  let telRevealed = false; // true une fois que l'utilisateur a cliqué sur le téléphone (image 15 affichée)
  let video13Played = false; // true une fois que la vidéo 13 a été lancée (évite de la relancer en boucle)

  // Couper le son
  document.querySelectorAll('audio, video').forEach(m => m.muted = true);

  let currentIntroStep = 0;
  body.classList.add('lock-scroll');
  window.scrollTo(0, 0);

  let clickHintTimeout;
  function startClickHintTimer() {
    clearTimeout(clickHintTimeout);
    clickHint.style.opacity = '0';
    clickHintTimeout = setTimeout(() => {
      clickHint.style.opacity = '1';
    }, 3000);
  }
  function hideClickHint() {
    clearTimeout(clickHintTimeout);
    clickHint.style.opacity = '0';
  }

  startClickHintTimer();

  /* ──────────────────────────────────────────────────────────────
     INDICATEUR "SCROLL ↓"
     - Pendant les vidéos 5/7/9 : apparaît 5s après le début de la vidéo.
     - Sur les images statiques 4/6/8/10 : apparaît 5s sans scroll.
     Disparaît dès que l'utilisateur rescrolle.
     ────────────────────────────────────────────────────────────── */
  let idleScrollHintTimer = null;

  // Démarre (ou repart) le timer d'inactivité. Après 5s sans appel à
  // resetIdleScrollHint(), l'indicateur devient visible.
  function startIdleScrollHint() {
    if (!videoScrollHint) return;
    clearTimeout(idleScrollHintTimer);

    // Absolument AUCUN logo/indicateur scroll sur l'intro (images 0, 2) ni sur le contact final (images 14, 15)
    if (currentIntroStep < 4) return;
    if (currentSegment === 4) return;

    idleScrollHintTimer = setTimeout(() => {
      const p = mainScrollTrigger ? mainScrollTrigger.progress : 0;
      const isStatic =
        (p < SEG_INTRO_END && currentIntroStep >= 4) ||
        (p >= SEG_INTRO_END && p < SEG1_END && videoStates.v5 === 'done') ||
        (p >= SEG1_END && p < SEG2_END && videoStates.v7 === 'done') ||
        (p >= SEG2_END && p < SEG3_END && videoStates.v9 === 'done');

      if (isStatic && currentIntroStep >= 4 && currentSegment !== 4) {
        videoScrollHint.classList.add('visible');
      }
    }, 1000);
  }

  function hideVideoScrollHint() {
    if (!videoScrollHint) return;
    clearTimeout(idleScrollHintTimer);
    videoScrollHint.classList.remove('visible');
  }

  // Réinitialise le timer à chaque scroll actif (appelé dans onUpdate)
  function resetIdleScrollHint() {
    hideVideoScrollHint();
    if (currentIntroStep < 4 || currentSegment === 4) return;
    startIdleScrollHint();
  }

  /* ──────────────────────────────────────────────────────────────
     ÉTAT DES VIDÉOS SCROLL (5, 7, 9)
     Chaque vidéo a son propre état : idle | playing | done
     - idle   : pas encore démarrée (ou réinitialisée après retour)
     - playing: en cours de lecture
     - done   : terminée, image de transition affichée
     ────────────────────────────────────────────────────────────── */
  const videoStates = { v5: 'idle', v7: 'idle', v9: 'idle' };

  // ── Vidéo 5 ──
  video5.addEventListener('ended', () => {
    videoStates.v5 = 'done';
    hideVideoScrollHint();
    video5.classList.add('hidden');
    img6.classList.remove('hidden');
    info6.classList.remove('hidden');
    // Déverrouiller le scroll, puis sauter à la fin du segment 1
    if (window.lenisInstance) window.lenisInstance.start();
    requestAnimationFrame(() => {
      if (mainScrollTrigger) {
        const targetY = mainScrollTrigger.start + (SEG1_END - 0.005) * (mainScrollTrigger.end - mainScrollTrigger.start);
        window.scrollTo({ top: targetY });
      }
      // Démarrer le timer idle sur l'image 6
      startIdleScrollHint();
    });
  });

  // ── Vidéo 7 ──
  video7.addEventListener('ended', () => {
    videoStates.v7 = 'done';
    hideVideoScrollHint();
    video7.classList.add('hidden');
    img8.classList.remove('hidden');
    info8.classList.remove('hidden');
    if (window.lenisInstance) window.lenisInstance.start();
    requestAnimationFrame(() => {
      if (mainScrollTrigger) {
        const targetY = mainScrollTrigger.start + (SEG2_END - 0.005) * (mainScrollTrigger.end - mainScrollTrigger.start);
        window.scrollTo({ top: targetY });
      }
      // Démarrer le timer idle sur l'image 8
      startIdleScrollHint();
    });
  });

  // ── Vidéo 9 ──
  video9.addEventListener('ended', () => {
    videoStates.v9 = 'done';
    hideVideoScrollHint();
    video9.classList.add('hidden');
    bureauLayer.classList.remove('hidden');
    if (img10.classList.contains('hidden') && img11A.classList.contains('hidden') &&
      img11B.classList.contains('hidden') && img11C.classList.contains('hidden')) {
      resetBureauImages();
    }
    if (window.lenisInstance) window.lenisInstance.start();
    requestAnimationFrame(() => {
      if (mainScrollTrigger) {
        const targetY = mainScrollTrigger.start + (SEG3_END - 0.005) * (mainScrollTrigger.end - mainScrollTrigger.start);
        window.scrollTo({ top: targetY });
      }
      // Démarrer le timer idle sur l'image 10 (bureau)
      startIdleScrollHint();
    });
  });

  /* Retourne true si le son global est actuellement coupé (bouton 🔇). */
  function isGlobalMuted() {
    return !!(window.AmbientSound && window.AmbientSound.isMuted());
  }

  /* Lance une vidéo scroll (5, 7 ou 9) en mode lecture normale avec du son.
     key : 'v5' | 'v7' | 'v9'
     video : l'élément <video> */
  function startScrollVideo(key, video) {
    if (videoStates[key] !== 'idle') return;
    videoStates[key] = 'playing';
    video.currentTime = 0;
    video.muted = isGlobalMuted();
    video.volume = 1.0;
    video.classList.remove('hidden');
    video.play().catch(() => {
      // Fallback si le navigateur exige le mode muet au tout début
      video.muted = true;
      video.play().catch(() => { });
    });
    hideVideoScrollHint();
    // Bloquer le scroll pendant la lecture (Lenis)
    if (window.lenisInstance) window.lenisInstance.stop();
  }

  /* Réinitialise une vidéo scroll quand on remonte (scroll back). */
  function resetScrollVideo(key, video, imgNext, infoNext) {
    if (videoStates[key] === 'idle') return;
    videoStates[key] = 'idle';
    video.pause();
    video.currentTime = 0;
    video.classList.remove('hidden');
    if (imgNext) imgNext.classList.add('hidden');
    if (infoNext) infoNext.classList.add('hidden');
    hideVideoScrollHint();
    if (window.lenisInstance) window.lenisInstance.start();
  }

  /* ──────────────────────────────────────────────────────────────
     1. GESTION DES CLICS INTRO (0 -> 1 -> 2 -> 3 -> 4)
     ────────────────────────────────────────────────────────────── */
  charClickZone.addEventListener('click', () => {

    if (currentIntroStep === 0) {
      currentIntroStep = 1;
      hideClickHint();
      charClickZone.style.pointerEvents = 'none';
      strongVignette.classList.remove('hidden');

      // Premier geste utilisateur de la page : on en profite pour débloquer
      // le son d'ambiance et le son des vidéos.
      if (window.AmbientSound) window.AmbientSound.init();

      img0.classList.add('hidden');
      video1.classList.remove('hidden');
      video1.currentTime = 0;
      video1.muted = isGlobalMuted();
      video1.volume = 1.0;
      video1.play().catch(() => {
        video1.muted = true;
        video1.play().catch(() => { });
      });
    }

    else if (currentIntroStep === 2) {
      currentIntroStep = 3;
      hideClickHint();
      charClickZone.style.pointerEvents = 'none';
      strongVignette.classList.remove('hidden');

      img2.classList.add('hidden');
      video3.classList.remove('hidden');
      video3.currentTime = 0;
      video3.muted = isGlobalMuted();
      video3.volume = 1.0;
      video3.play().catch(() => {
        video3.muted = true;
        video3.play().catch(() => { });
      });
    }

  });

  video1.addEventListener('ended', () => {
    currentIntroStep = 2;
    strongVignette.classList.add('hidden');
    video1.classList.add('hidden');
    img2.classList.remove('hidden');

    charClickZone.style.pointerEvents = 'auto';
    startClickHintTimer();
  });

  video3.addEventListener('ended', () => {
    currentIntroStep = 4;
    strongVignette.classList.add('hidden');
    video3.classList.add('hidden');

    img4.classList.remove('hidden');
    info4.classList.remove('hidden');

    charClickZone.classList.add('hidden');
    if (skipIntroBtn) skipIntroBtn.classList.add('hidden');
    if (siteNav) siteNav.classList.remove('hidden');
    scrollNotice.classList.remove('hidden');
    body.classList.remove('lock-scroll');

    // Démarrer le timer 5s d'absence de scroll pour l'image 4
    startIdleScrollHint();
  });

  // SKIP INTRO BUTTON
  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', () => {
      if (currentIntroStep >= 4) return;
      hideClickHint();
      if (window.AmbientSound) window.AmbientSound.init();

      video1.pause(); video1.classList.add('hidden');
      video3.pause(); video3.classList.add('hidden');
      img0.classList.add('hidden');
      img2.classList.add('hidden');
      strongVignette.classList.add('hidden');

      currentIntroStep = 4;
      img4.classList.remove('hidden');
      info4.classList.remove('hidden');

      charClickZone.classList.add('hidden');
      skipIntroBtn.classList.add('hidden');
      if (siteNav) siteNav.classList.remove('hidden');
      scrollNotice.classList.remove('hidden');
      body.classList.remove('lock-scroll');

      // Démarrer le timer 5s d'absence de scroll pour l'image 4
      startIdleScrollHint();
    });
  }

  // BOUTON MUTE/UNMUTE DU SON D'AMBIANCE + VIDÉOS
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.AmbientSound) window.AmbientSound.init(); // débloque l'audio si pas encore fait
      const nowMuted = !(window.AmbientSound && window.AmbientSound.isMuted());
      if (window.AmbientSound) window.AmbientSound.setMuted(nowMuted);
      soundToggleBtn.setAttribute('aria-pressed', String(!nowMuted));
      soundToggleBtn.textContent = nowMuted ? '🔇' : '🔊';

      // Synchroniser le son de toutes les vidéos avec le bouton
      [video1, video3, video5, video7, video9, video13].forEach(v => {
        if (v) v.muted = nowMuted;
      });
    });
  }

  // RESTART INTRO BUTTON (sur image 4)
  if (restartIntroBtn) {
    restartIntroBtn.addEventListener('click', () => {
      window.scrollTo(0, 0);

      currentIntroStep = 0;
      body.classList.add('lock-scroll');

      img4.classList.add('hidden');
      info4.classList.add('hidden');
      scrollNotice.classList.add('hidden');
      if (siteNav) siteNav.classList.add('hidden');

      img0.classList.remove('hidden');
      charClickZone.classList.remove('hidden');
      charClickZone.style.pointerEvents = 'auto';
      if (skipIntroBtn) skipIntroBtn.classList.remove('hidden');

      // Réinitialiser les états des vidéos scroll
      resetScrollVideo('v5', video5, img6, info6);
      resetScrollVideo('v7', video7, img8, info8);
      resetScrollVideo('v9', video9, null, null);
      hideAllBureauImages();

      startClickHintTimer();
    });
  }


  /* ──────────────────────────────────────────────────────────────
     2. INTERACTION SURVOL DES OBJETS DU BUREAU (11A, 11B, 11C)
     ────────────────────────────────────────────────────────────── */
  function hideAllBureauImages() {
    img10.classList.add('hidden');
    img11A.classList.add('hidden');
    img11B.classList.add('hidden');
    img11C.classList.add('hidden');
    body.classList.remove('show-11A', 'show-11B', 'show-11C');
  }

  function resetBureauImages() {
    hideAllBureauImages();
    img10.classList.remove('hidden');
  }

  function showBureauImage(targetImg, showClass) {
    hideAllBureauImages();
    targetImg.classList.remove('hidden');
    body.classList.add(showClass);
  }

  // 11A : Carte du Monde & Globe terrestre → ouvre le panel Journey au clic
  [zone11A_map, zone11A_globe].forEach(zone => {
    zone.addEventListener('mouseenter', () => showBureauImage(img11A, 'show-11A'));
    zone.addEventListener('mouseleave', () => resetBureauImages());
    zone.addEventListener('click', () => {
      if (typeof window.openJourneyPanel === 'function') window.openJourneyPanel();
    });
  });

  // 11B : Écran ordinateur & Clavier / Souris → ouvre le panel Skills au clic
  [zone11B_screen, zone11B_controls].forEach(zone => {
    zone.addEventListener('mouseenter', () => showBureauImage(img11B, 'show-11B'));
    zone.addEventListener('mouseleave', () => resetBureauImages());
    zone.addEventListener('click', () => {
      if (typeof window.openSkillsPanel === 'function') window.openSkillsPanel();
    });
  });

  // 11C : Étagère (drone & appareil photo) & Station totale de géomètre → ouvre le panel Projects au clic
  [zone11C_shelf, zone11C_station].forEach(zone => {
    zone.addEventListener('mouseenter', () => showBureauImage(img11C, 'show-11C'));
    zone.addEventListener('mouseleave', () => resetBureauImages());
    zone.addEventListener('click', () => {
      if (typeof window.openProjects === 'function') window.openProjects();
    });
  });

  // Zone téléphone (image 14) → révèle l'image 15 + la carte de contact finale
  if (telClickZone) {
    telClickZone.addEventListener('click', () => {
      telRevealed = true;
      img14.classList.add('hidden');
      telClickZone.classList.add('hidden');
      img15.classList.remove('hidden');
      info15.classList.remove('hidden');
    });
  }

  // Vidéo 13 : lecture automatique une seule fois (comme les vidéos d'intro 1 et 3),
  // pas de scroll-scrubbing ici — plus fiable. À la fin, affiche l'image 14 (téléphone).
  if (video13) {
    video13.addEventListener('ended', () => {
      video13.classList.add('hidden');
      img14.classList.remove('hidden');
      telClickZone.classList.remove('hidden');
    });
  }



  /* ──────────────────────────────────────────────────────────────
     3. PILOTAGE DU SCROLL (Activé après l'image 4)
     ────────────────────────────────────────────────────────────── */
  // Seuils de progression du scrollTrack (4 segments après l'intro) — sortis
  // du onUpdate pour être réutilisables par le bouton "Aller au bureau".
  //   0        → SEG_INTRO_END : Image 4 (intro)
  //   SEG_INTRO_END → SEG1_END : Vidéo 5 -> Image 6
  //   SEG1_END → SEG2_END      : Vidéo 7 -> Image 8
  //   SEG2_END → SEG3_END      : Vidéo 9 -> Image 10 (bureau interactif)
  //   SEG3_END → 1             : Vidéo 13 (lecture auto) -> Image 14 (clic) -> Image 15 (contact final)
  const SEG_INTRO_END = 0.027;
  const SEG1_END = 0.295;
  const SEG2_END = 0.589;
  const SEG3_END = 0.893;

  // Zone courante : pour détecter les transitions entre segments
  let currentSegment = -1;

  const mainScrollTrigger = ScrollTrigger.create({
    trigger: '#scrollTrack',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (currentIntroStep < 4) {
        window.scrollTo(0, 0);
        return;
      }

      strongVignette.classList.add('hidden');
      const p = self.progress;

      if (mobileVignette) {
        if (p >= SEG_INTRO_END) {
          mobileVignette.classList.remove('hidden');
        } else {
          mobileVignette.classList.add('hidden');
        }
      }

      if (p > 0.02) {
        scrollNotice.classList.add('hidden');
      }

      // Réinitialise l'état du segment 4 quand on remonte avant lui
      if (p < SEG3_END) {
        video13Played = false;
        telRevealed = false;
        video13.classList.remove('hidden');
        img14.classList.add('hidden');
        telClickZone.classList.add('hidden');
        img15.classList.add('hidden');
        info15.classList.add('hidden');
      }

      // L'indicateur "scroll ↓" est autorisé UNIQUEMENT sur les images statiques (4, 6, 8, 10).
      // Jamais sur les vidéos (5, 7, 9, 13) ni sur les images finales (14, 15).
      const isStaticImage =
        (p < SEG_INTRO_END && currentIntroStep >= 4) ||
        (p >= SEG_INTRO_END && p < SEG1_END && videoStates.v5 === 'done') ||
        (p >= SEG1_END && p < SEG2_END && videoStates.v7 === 'done') ||
        (p >= SEG2_END && p < SEG3_END && videoStates.v9 === 'done');

      if (isStaticImage) {
        resetIdleScrollHint();
      } else {
        hideVideoScrollHint();
      }

      // ── Segment 0 : Image 4 (intro / qui suis-je) ──
      if (p < SEG_INTRO_END) {
        if (currentSegment !== 0) {
          currentSegment = 0;
          video5.classList.add('hidden');
          startIdleScrollHint();
        }
        activateSlide(slideIntro);
        img4.classList.remove('hidden');
        info4.classList.remove('hidden');
        bureauLayer.classList.add('hidden');
      }

      // ── Segment 1 : Vidéo 5 -> Image 6 ──
      else if (p >= SEG_INTRO_END && p < SEG1_END) {
        if (currentSegment !== 1) {
          currentSegment = 1;
          activateSlide(slideScroll1);
        }
        bureauLayer.classList.add('hidden');

        // Si la vidéo est idle, la démarrer au premier scroll descendant
        if (videoStates.v5 === 'idle') {
          startScrollVideo('v5', video5);
        }
        // Si la vidéo est terminée (done), garder l'image 6 affichée
        else if (videoStates.v5 === 'done') {
          video5.classList.add('hidden');
          img6.classList.remove('hidden');
          info6.classList.remove('hidden');
        }
      }

      // ── Segment 2 : Vidéo 7 -> Image 8 ──
      else if (p >= SEG1_END && p < SEG2_END) {
        if (currentSegment !== 2) {
          currentSegment = 2;
          activateSlide(slideScroll2);
        }
        bureauLayer.classList.add('hidden');

        if (videoStates.v7 === 'idle') {
          startScrollVideo('v7', video7);
        } else if (videoStates.v7 === 'done') {
          video7.classList.add('hidden');
          img8.classList.remove('hidden');
          info8.classList.remove('hidden');
        }
      }

      // ── Segment 3 : Vidéo 9 -> Image 10 (bureau interactif) ──
      else if (p >= SEG2_END && p < SEG3_END) {
        if (currentSegment !== 3) {
          currentSegment = 3;
          activateSlide(slideScroll3);
        }

        if (videoStates.v9 === 'idle') {
          startScrollVideo('v9', video9);
          bureauLayer.classList.add('hidden');
        } else if (videoStates.v9 === 'done') {
          video9.classList.add('hidden');
          bureauLayer.classList.remove('hidden');
          if (img10.classList.contains('hidden') && img11A.classList.contains('hidden') &&
            img11B.classList.contains('hidden') && img11C.classList.contains('hidden')) {
            resetBureauImages();
          }
        }
        else if (videoStates.v9 === 'playing') {
          bureauLayer.classList.add('hidden');
        }
      }

      // ── Segment 4 : Vidéo 13 (auto) -> Image 14 -> Image 15 ──
      else if (p >= SEG3_END) {
        if (currentSegment !== 4) {
          currentSegment = 4;
          activateSlide(slideScroll4);
        }
        bureauLayer.classList.add('hidden');

        if (!video13Played) {
          video13Played = true;
          telRevealed = false;
          img14.classList.add('hidden');
          telClickZone.classList.add('hidden');
          img15.classList.add('hidden');
          info15.classList.add('hidden');
          video13.classList.remove('hidden');
          try { video13.currentTime = 0; } catch (e) { }
          video13.muted = isGlobalMuted();
          video13.volume = 1.0;
          video13.play().catch(() => {
            video13.muted = true;
            video13.play().catch(() => { });
          });
        }
      }

      // Mise à jour de la barre d'étapes verticale (droite)
      let activeStep = 0;
      if (currentIntroStep < 4) {
        activeStep = 0;
      } else if (p < SEG_INTRO_END) {
        activeStep = 1;
      } else if (p >= SEG_INTRO_END && p < SEG1_END) {
        activeStep = 2;
      } else if (p >= SEG1_END && p < SEG2_END) {
        activeStep = 3;
      } else if (p >= SEG2_END && p < SEG3_END) {
        activeStep = 4;
      } else if (p >= SEG3_END) {
        activeStep = 5;
      }
      updateStepNav(activeStep);

      // SON D'AMBIANCE
      if (window.AmbientSound) {
        const videoPlaying =
          videoStates.v5 === 'playing' ||
          videoStates.v7 === 'playing' ||
          videoStates.v9 === 'playing';
        window.AmbientSound.onScrollUpdate(videoPlaying, p);
      }
    }
  });

  // GESTION DE LA BARRE D'ÉTAPES VERTICALE (DROITE)
  const stepNavItems = document.querySelectorAll('.step-nav__item');

  function updateStepNav(stepIdx) {
    if (!stepNavItems || !stepNavItems.length) return;
    stepNavItems.forEach((item, idx) => {
      if (idx === stepIdx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function goToStep(step) {
    // Si un modal est ouvert, le fermer proprement
    if (document.documentElement.classList.contains('panel-open') || document.body.classList.contains('panel-open')) {
      if (typeof closeJourney === 'function') closeJourney();
      if (typeof closePanel === 'function') closePanel();
      if (typeof closeProjects === 'function') closeProjects();
    }

    if (window.lenisInstance) window.lenisInstance.start();

    // Stopper et masquer immédiatement les vidéos de transition
    [video1, video3, video5, video7, video9, video13].forEach(v => {
      if (v) { try { v.pause(); } catch (e) { } v.classList.add('hidden'); }
    });

    const start = mainScrollTrigger ? mainScrollTrigger.start : 0;
    const end = mainScrollTrigger ? mainScrollTrigger.end : 1;

    if (step === 0) {
      // Step 0: Image 0 (Intro)
      currentIntroStep = 0;
      activateSlide(slideIntro);
      if (img2) img2.classList.add('hidden');
      if (img4) img4.classList.add('hidden');
      if (info4) info4.classList.add('hidden');
      if (img6) img6.classList.add('hidden');
      if (info6) info6.classList.add('hidden');
      if (img8) img8.classList.add('hidden');
      if (info8) info8.classList.add('hidden');
      if (bureauLayer) bureauLayer.classList.add('hidden');
      if (img14) img14.classList.add('hidden');
      if (telClickZone) telClickZone.classList.add('hidden');
      if (img15) img15.classList.add('hidden');
      if (info15) info15.classList.add('hidden');

      img0.classList.remove('hidden');
      if (charClickZone) {
        charClickZone.classList.remove('hidden');
        charClickZone.style.pointerEvents = 'auto';
      }
      if (skipIntroBtn) skipIntroBtn.classList.remove('hidden');
      if (siteNav) siteNav.classList.add('hidden');
      document.body.classList.add('lock-scroll');

      window.scrollTo(0, 0);
    } else if (step === 1) {
      // Image 4 (Qui suis-je)
      if (currentIntroStep < 4) {
        if (skipIntroBtn) skipIntroBtn.click();
      }
      activateSlide(slideIntro);
      img4.classList.remove('hidden');
      info4.classList.remove('hidden');
      if (img6) img6.classList.add('hidden');
      if (info6) info6.classList.add('hidden');
      if (img8) img8.classList.add('hidden');
      if (info8) info8.classList.add('hidden');
      if (bureauLayer) bureauLayer.classList.add('hidden');
      if (img14) img14.classList.add('hidden');
      if (telClickZone) telClickZone.classList.add('hidden');
      if (img15) img15.classList.add('hidden');
      if (info15) info15.classList.add('hidden');

      const targetY = start + (SEG_INTRO_END - 0.005) * (end - start);
      window.scrollTo(0, Math.max(0, targetY));
    } else if (step === 2) {
      // Step 2: Opportunities -> lance d'abord la vidéo 5 avec du son
      if (currentIntroStep < 4) {
        if (skipIntroBtn) skipIntroBtn.click();
      }
      activateSlide(slideScroll1);
      if (img6) img6.classList.add('hidden');
      if (info6) info6.classList.add('hidden');
      if (bureauLayer) bureauLayer.classList.add('hidden');

      const targetY = start + (SEG_INTRO_END + 0.001) * (end - start);
      window.scrollTo(0, targetY);

      videoStates.v5 = 'idle';
      startScrollVideo('v5', video5);
    } else if (step === 3) {
      // Step 3: Expertise -> lance d'abord la vidéo 7 avec du son
      if (currentIntroStep < 4) {
        if (skipIntroBtn) skipIntroBtn.click();
      }
      videoStates.v5 = 'done';
      activateSlide(slideScroll2);
      if (img8) img8.classList.add('hidden');
      if (info8) info8.classList.add('hidden');
      if (bureauLayer) bureauLayer.classList.add('hidden');

      const targetY = start + (SEG1_END + 0.001) * (end - start);
      window.scrollTo(0, targetY);

      videoStates.v7 = 'idle';
      startScrollVideo('v7', video7);
    } else if (step === 4) {
      // Step 4: Desk / Bureau -> lance d'abord la vidéo 9 avec du son
      if (currentIntroStep < 4) {
        if (skipIntroBtn) skipIntroBtn.click();
      }
      videoStates.v5 = 'done';
      videoStates.v7 = 'done';
      activateSlide(slideScroll3);
      if (bureauLayer) bureauLayer.classList.add('hidden');

      const targetY = start + (SEG2_END + 0.001) * (end - start);
      window.scrollTo(0, targetY);

      videoStates.v9 = 'idle';
      startScrollVideo('v9', video9);
    } else if (step === 5) {
      // Step 5: Contact -> lance d'abord la vidéo 13 avec du son
      if (currentIntroStep < 4) {
        if (skipIntroBtn) skipIntroBtn.click();
      }
      videoStates.v5 = 'done';
      videoStates.v7 = 'done';
      videoStates.v9 = 'done';

      activateSlide(slideScroll4);
      video13Played = true;
      telRevealed = false;

      if (img14) img14.classList.add('hidden');
      if (telClickZone) telClickZone.classList.add('hidden');
      if (img15) img15.classList.add('hidden');
      if (info15) info15.classList.add('hidden');
      if (bureauLayer) bureauLayer.classList.add('hidden');

      const targetY = start + (SEG3_END + 0.001) * (end - start);
      window.scrollTo(0, targetY);

      video13.classList.remove('hidden');
      try { video13.currentTime = 0; } catch (e) { }
      video13.muted = isGlobalMuted();
      video13.volume = 1.0;
      video13.play().catch(() => {
        video13.muted = true;
        video13.play().catch(() => { });
      });
    }
  }

  stepNavItems.forEach((item) => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'), 10);
      goToStep(step);
    });
  });

  window.returnToBureau = function () {
    if (currentIntroStep < 4) return;
    if (window.lenisInstance) window.lenisInstance.start();

    videoStates.v5 = 'done';
    videoStates.v7 = 'done';
    videoStates.v9 = 'done';

    if (video9) video9.classList.add('hidden');
    if (bureauLayer) bureauLayer.classList.remove('hidden');
    if (typeof resetBureauImages === 'function') resetBureauImages();

    if (mainScrollTrigger) {
      const targetProgress = SEG2_END + 0.85 * (SEG3_END - SEG2_END);
      const start = mainScrollTrigger.start;
      const end = mainScrollTrigger.end;
      const targetY = start + targetProgress * (end - start);
      window.scrollTo(0, targetY);
    }
  };

  // BOUTON "ALLER AU BUREAU" — saute directement dans le segment 3
  if (jumpToBureauBtn) {
    jumpToBureauBtn.addEventListener('click', () => {
      window.returnToBureau();
    });
  }

  function activateSlide(targetSlide) {
    [slideIntro, slideScroll1, slideScroll2, slideScroll3, slideScroll4].forEach(s => {
      if (s === targetSlide) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

});
