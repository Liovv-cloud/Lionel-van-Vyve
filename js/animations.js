/* ================================================================
   ANIMATIONS.JS — Révélations au scroll (GSAP ScrollTrigger)
   
   ► TYPES D'ANIMATION DISPONIBLES (classes CSS) :
     .reveal-up      → apparaît depuis le bas + fade in
     .reveal-left    → apparaît depuis la gauche + fade in
     .reveal-right   → apparaît depuis la droite + fade in
     .reveal-scale   → apparaît avec un zoom depuis 90% + fade in
     .reveal-stagger → les enfants directs apparaissent en cascade
   
   ► MODIFIER LES TIMINGS :
     - duration  → durée de l'animation (secondes)
     - delay     → délai avant démarrage
     - stagger   → délai entre chaque enfant (.reveal-stagger)
     - start     → seuil de déclenchement ('top 85%' = 85% du viewport)
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Rafraîchir ScrollTrigger après que Lenis a initialisé
  // (important pour que les positions soient correctes)
  ScrollTrigger.refresh();


  /* ──────────────────────────────────────────────────────────────
     ANIMATION HERO — Se joue au chargement de la page (pas au scroll)
     Modifier : duration, delay, ease
     ────────────────────────────────────────────────────────────── */
  const heroTl = gsap.timeline({ delay: 0.4 });

  heroTl
    // Eyebrow ("Bienvenue")
    .to('#heroEyebrow', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out'
    })
    // Titre principal (léger chevauchement avec -=0.5)
    .to('#heroTitle', {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power4.out'
    }, '-=0.5')
    // Sous-titre
    .to('#heroSubtitle', {
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');


  /* ──────────────────────────────────────────────────────────────
     REVEAL DEPUIS LE BAS — .reveal-up
     ────────────────────────────────────────────────────────────── */
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.fromTo(el,
      {
        opacity: 0,
        y: 60             // Distance de départ (px) — augmenter pour plus d'effet
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,   // Durée
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',   // Déclenche quand l'élément est à 88% du viewport
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
          // play = joue quand visible
          // reverse = repart quand on remonte (changer 'none' pour désactiver)
        }
      }
    );
  });


  /* ──────────────────────────────────────────────────────────────
     REVEAL DEPUIS LA GAUCHE — .reveal-left
     ────────────────────────────────────────────────────────────── */
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.fromTo(el,
      {
        opacity: 0,
        x: -80            // Distance horizontale de départ
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });


  /* ──────────────────────────────────────────────────────────────
     REVEAL DEPUIS LA DROITE — .reveal-right
     ────────────────────────────────────────────────────────────── */
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.fromTo(el,
      {
        opacity: 0,
        x: 80             // Distance horizontale de départ
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });


  /* ──────────────────────────────────────────────────────────────
     REVEAL AVEC SCALE — .reveal-scale
     Chaque élément a un délai progressif (délai × index)
     ────────────────────────────────────────────────────────────── */
  gsap.utils.toArray('.reveal-scale').forEach((el, index) => {
    gsap.fromTo(el,
      {
        opacity: 0,
        scale: 0.88       // Taille de départ (0.88 = légèrement plus petit)
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.95,
        delay: index * 0.06,  // Délai progressif entre chaque item — modifier ici
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });


  /* ──────────────────────────────────────────────────────────────
     STAGGER (CASCADE) — .reveal-stagger
     Les enfants directs apparaissent les uns après les autres
     ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.reveal-stagger').forEach(container => {
    const children = Array.from(container.children);

    gsap.fromTo(children,
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.15,    // Délai entre chaque enfant (secondes) — modifier ici
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });


  /* ──────────────────────────────────────────────────────────────
     PARALLAX SUR LES IMAGES (effet de profondeur subtil)
     Les images se déplacent légèrement en scrollant
     ────────────────────────────────────────────────────────────── */
  gsap.utils.toArray('.section__img').forEach(img => {
    gsap.to(img, {
      y: -30,           // Déplacement max en px (augmenter pour plus d'effet)
      ease: 'none',
      scrollTrigger: {
        trigger: img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true       // Scrub = synchro avec le scroll
      }
    });
  });


  /* ──────────────────────────────────────────────────────────────
     RAFRAÎCHISSEMENT FINAL
     Nécessaire si des images se chargent et changent la hauteur de page
     ────────────────────────────────────────────────────────────── */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 600);

});
