/* ================================================================
   SCROLL.JS — Lenis Smooth Scroll
   
   ► Modifier la vitesse : lerp (0.05 = très lent, 0.15 = rapide)
   ================================================================ */

const lenis = new Lenis({
  lerp: 0.08,           // Fluidité du smooth scroll
  smoothWheel: true,    // Lissage molette
  wheelMultiplier: 1,   // Vitesse molette (augmenter si trop lent)
  touchMultiplier: 2,   // Vitesse tactile mobile
});

// Synchroniser Lenis avec GSAP (obligatoire pour ScrollTrigger)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Mettre à jour ScrollTrigger à chaque frame Lenis
lenis.on('scroll', ScrollTrigger.update);
