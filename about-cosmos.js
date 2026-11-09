/* THE AUTHOR — layered cosmic Marcus behind the author.
   Tracks the pointer (or phone tilt) and the scroll position and hands them to CSS
   as --px, --py (pointer, -1..1) and --sy (scroll, -1..1); about-cosmos.css moves
   each layer by its own amount so the scene feels deep. */
(function () {
  "use strict";
  const sec = document.getElementById("about");
  if (!sec || !sec.classList.contains("about-cosmos")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let tx = 0, ty = 0, px = 0, py = 0, sy = 0, visible = false, raf = 0;

  function onPointer(e) {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
    kick();
  }
  function onTilt(e) {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 25));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    kick();
  }
  function scrollPos() {
    const r = sec.getBoundingClientRect();
    const mid = r.top + r.height / 2 - window.innerHeight / 2;
    return Math.max(-1, Math.min(1, mid / (window.innerHeight / 2 + r.height / 2)));
  }
  function frame() {
    raf = 0;
    px += (tx - px) * 0.08;
    py += (ty - py) * 0.08;
    sy = scrollPos();
    sec.style.setProperty("--px", px.toFixed(4));
    sec.style.setProperty("--py", py.toFixed(4));
    sec.style.setProperty("--sy", sy.toFixed(4));
    if (visible && (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001)) kick();
  }
  function kick() { if (visible && !raf) raf = requestAnimationFrame(frame); }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    kick();
  }, { rootMargin: "100px 0px" }).observe(sec);

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("deviceorientation", onTilt, { passive: true });
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });
})();
