/* =====================================================
   Marcos Garcia — Hero depth (parallax / 3D float)
   Moves the hero's picture layers and headline at different
   depths as the pointer moves and the page scrolls.
   On touch screens it drifts slowly on its own instead.
   Only sets CSS custom properties; styles live in hero-immersive.css.
   ===================================================== */

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const hero = document.querySelector(".hero--immersive");
    if (!hero) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0, s: 0 };
    let pointerActive = false;
    let visible = true;
    let frame = 0;

    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        pointerActive = true;
        target.x = (e.clientX / window.innerWidth) * 2 - 1;
        target.y = (e.clientY / window.innerHeight) * 2 - 1;
        wake();
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", function () {
        pointerActive = false;
        wake();
      });
    }

    window.addEventListener("scroll", wake, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) wake();
      }).observe(hero);
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function tick(t) {
      frame = 0;
      if (!pointerActive) {
        // slow idle orbit, so the depth still shows without a mouse
        target.x = Math.sin(t / 4200) * 0.55;
        target.y = Math.cos(t / 5300) * 0.4;
      }
      const h = hero.offsetHeight || 1;
      const s = Math.min(Math.max(window.scrollY / h, 0), 1);

      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      current.s += (s - current.s) * 0.2;

      hero.style.setProperty("--px", current.x.toFixed(4));
      hero.style.setProperty("--py", current.y.toFixed(4));
      hero.style.setProperty("--scroll", current.s.toFixed(4));

      const settling =
        Math.abs(target.x - current.x) > 0.001 ||
        Math.abs(target.y - current.y) > 0.001 ||
        Math.abs(s - current.s) > 0.001;
      if (visible && (!pointerActive || settling)) wake();
    }

    wake();
  });
})();
