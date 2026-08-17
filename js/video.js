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
     1. GESTION DES CLICS INTRO (0 -> 1 -> 2 -> 3 -> 4)
     ────────────────────────────────────────────────────────────── */
  charClickZone.addEventListener('click', () => {

    if (currentIntroStep === 0) {
      currentIntroStep = 1;
      hideClickHint();
      charClickZone.style.pointerEvents = 'none';
      strongVignette.classList.remove('hidden');

      // Premier geste utilisateur de la page : on en profite pour débloquer
      // le son d'ambiance (autoplay audio interdit sans interaction directe).
      if (window.AmbientSound) window.AmbientSound.init();

      img0.classList.add('hidden');
      video1.classList.remove('hidden');
      video1.currentTime = 0;
      video1.play().catch(() => { });
    }

    else if (currentIntroStep === 2) {
      currentIntroStep = 3;
      hideClickHint();
      charClickZone.style.pointerEvents = 'none';
      strongVignette.classList.remove('hidden');

      img2.classList.add('hidden');
      video3.classList.remove('hidden');
      video3.currentTime = 0;
      video3.play().catch(() => { });
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
    });
  }

  // BOUTON MUTE/UNMUTE DU SON D'AMBIANCE
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.AmbientSound) window.AmbientSound.init(); // débloque l'audio si pas encore fait
      const nowMuted = !(window.AmbientSound && window.AmbientSound.isMuted());
      if (window.AmbientSound) window.AmbientSound.setMuted(nowMuted);
      soundToggleBtn.setAttribute('aria-pressed', String(!nowMuted));
      soundToggleBtn.textContent = nowMuted ? '🔇' : '🔊';
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

      // Tant qu'on n'est pas dans le segment 4, on réinitialise tout son état pour
      // repartir proprement (vidéo depuis le début) la prochaine fois qu'on l'atteint.
      if (p < SEG3_END) {
        video13Played = false;
        telRevealed = false;
        video13.classList.remove('hidden');
        img14.classList.add('hidden');
        telClickZone.classList.add('hidden');
        img15.classList.add('hidden');
        info15.classList.add('hidden');
      }

      // Image 4 (intro / qui suis-je)
      if (p < SEG_INTRO_END) {
        activateSlide(slideIntro);
        img4.classList.remove('hidden');
        info4.classList.remove('hidden');
        bureauLayer.classList.add('hidden');
      }

      // SCROLL 1 : Vidéo 5 -> Image 6 (+ Info 6)
      else if (p >= SEG_INTRO_END && p < SEG1_END) {
        activateSlide(slideScroll1);
        bureauLayer.classList.add('hidden');
        const subP = (p - SEG_INTRO_END) / (SEG1_END - SEG_INTRO_END);

        if (subP >= 0.80) {
          video5.classList.add('hidden');
          img6.classList.remove('hidden');
          info6.classList.remove('hidden');
        } else {
          video5.classList.remove('hidden');
          img6.classList.add('hidden');
          info6.classList.add('hidden');
          if (video5.duration) video5.currentTime = subP * video5.duration;
        }
      }

      // SCROLL 2 : Vidéo 7 -> Image 8 (+ Info 8)
      else if (p >= SEG1_END && p < SEG2_END) {
        activateSlide(slideScroll2);
        bureauLayer.classList.add('hidden');
        const subP = (p - SEG1_END) / (SEG2_END - SEG1_END);

        if (subP >= 0.80) {
          video7.classList.add('hidden');
          img8.classList.remove('hidden');
          info8.classList.remove('hidden');
        } else {
          video7.classList.remove('hidden');
          img8.classList.add('hidden');
          info8.classList.add('hidden');
          if (video7.duration) video7.currentTime = subP * video7.duration;
        }
      }

      // SCROLL 3 : Vidéo 9 -> Image 10 (Active les zones de survol 11A, 11B, 11C)
      else if (p >= SEG2_END && p < SEG3_END) {
        activateSlide(slideScroll3);
        const subP = (p - SEG2_END) / (SEG3_END - SEG2_END);

        if (subP >= 0.80) {
          video9.classList.add('hidden');
          bureauLayer.classList.remove('hidden'); // Activer les hotspots interactifs sur le bureau
          if (img10.classList.contains('hidden') && img11A.classList.contains('hidden') && img11B.classList.contains('hidden') && img11C.classList.contains('hidden')) {
            resetBureauImages();
          }
        } else {
          video9.classList.remove('hidden');
          bureauLayer.classList.add('hidden');
          hideAllBureauImages();
          if (video9.duration) video9.currentTime = subP * video9.duration;
        }
      }

      // SCROLL 4 : Vidéo 13 (lecture auto, une seule fois) -> Image 14 (clic) -> Image 15 (contact final)
      else if (p >= SEG3_END) {
        activateSlide(slideScroll4);
        bureauLayer.classList.add('hidden');

        if (!video13Played) {
          video13Played = true;
          telRevealed = false;
          img14.classList.add('hidden');
          telClickZone.classList.add('hidden');
          img15.classList.add('hidden');
          info15.classList.add('hidden');
          video13.classList.remove('hidden');
          try { video13.currentTime = 0; } catch (e) { /* pas encore prête, sans conséquence */ }
          video13.play().catch(() => { });
        }
      }

      // SON D'AMBIANCE — actif uniquement pendant la lecture scrubée des
      // vidéos 5/7/9 (celles pilotées directement par la vitesse de scroll) ;
      // sa hauteur/vitesse suit la vitesse de scroll mesurée ci-dessous.
      if (window.AmbientSound) {
        const scrubbedVideoVisible =
          !video5.classList.contains('hidden') ||
          !video7.classList.contains('hidden') ||
          !video9.classList.contains('hidden');
        window.AmbientSound.onScrollUpdate(scrubbedVideoVisible, p);
      }
    }
  });

  // BOUTON "ALLER AU BUREAU" — saute directement dans le segment 3
  // (subP >= 0.80, cf. onUpdate ci-dessus), là où la vidéo 9 est terminée et
  // où l'image 10 + les zones interactives du bureau sont affichées. Permet
  // à un visiteur pressé de ne pas re-scroller les 3 vidéos précédentes.
  if (jumpToBureauBtn) {
    jumpToBureauBtn.addEventListener('click', () => {
      if (currentIntroStep < 4) return; // rien à faire pendant l'intro verrouillée

      const targetProgress = SEG2_END + 0.85 * (SEG3_END - SEG2_END);
      const start = mainScrollTrigger.start;
      const end = mainScrollTrigger.end;
      const targetY = start + targetProgress * (end - start);

      window.scrollTo(0, targetY);
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
