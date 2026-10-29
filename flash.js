/* =====================================================
   Marcos Garcia — "Flash" layer (JS)
   Progress bar, glass header, ticker, cursor spotlight,
   sparkle trail, holographic covers, magnetic buttons.
   ===================================================== */

(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ---------- progress bar + glass header ---------- */
    const bar = document.createElement("div");
    bar.className = "fx-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    const header = document.querySelector(".site-header");

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--fx-progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
        if (header) header.classList.toggle("fx-scrolled", window.scrollY > 40);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- ticker band (after the 3D window) ---------- */
    const anchor = document.getElementById("window") || document.querySelector(".hero");
    if (anchor) {
      const words = [
        ["Stoic Reason", "Est. in curiosity"],
        ["Strange Science", "Field guides"],
        ["Ancient Myth", "ANUNNAKI"],
        ["Self-Mastery", "A Work in Progress"],
        ["Cooking with Love", "Gramma Shunis"],
        ["The Cosmos", "Grand Mysteries"],
      ];
      const group = () => {
        const g = document.createElement("div");
        g.className = "fx-ticker-group";
        words.forEach(function (w) {
          g.insertAdjacentHTML("beforeend",
            '<span>' + w[0] + '</span><span class="fx-hl">' + w[1] + '</span><span class="fx-star">✦</span>');
        });
        return g;
      };
      const ticker = document.createElement("div");
      ticker.className = "fx-ticker";
      ticker.setAttribute("aria-hidden", "true");
      const track = document.createElement("div");
      track.className = "fx-ticker-track";
      track.appendChild(group());
      track.appendChild(group());
      ticker.appendChild(track);
      anchor.insertAdjacentElement("afterend", ticker);
    }

    /* ---------- shimmer on a few key headings ---------- */
    document.querySelectorAll(".library-section .section-title, .portal-section .section-title")
      .forEach(function (h) { h.classList.add("fx-shimmer"); });

    /* ---------- staggered shelf reveal ---------- */
    const books = document.querySelectorAll(".library-book");
    books.forEach(function (b, i) {
      b.classList.add("fx-in");
      b.style.transitionDelay = (i * 0.12) + "s";
    });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      books.forEach(function (b) { io.observe(b); });
    } else {
      books.forEach(function (b) { b.classList.add("in-view"); });
    }

    /* ---------- holographic 3D covers ---------- */
    document.querySelectorAll(".library-cover img").forEach(function (img) {
      const holo = document.createElement("span");
      holo.className = "fx-holo";
      img.parentNode.insertBefore(holo, img);
      holo.appendChild(img);
      if (reduce) return;
      const card = holo.closest(".library-book");
      card.addEventListener("pointermove", function (e) {
        const r = holo.getBoundingClientRect();
        const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        holo.classList.add("is-tilting");
        holo.style.setProperty("--ry", ((x - 0.5) * 22).toFixed(2) + "deg");
        holo.style.setProperty("--rx", ((0.5 - y) * 18).toFixed(2) + "deg");
        holo.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        holo.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () {
        holo.classList.remove("is-tilting");
        holo.style.setProperty("--ry", "0deg");
        holo.style.setProperty("--rx", "0deg");
      });
    });

    if (reduce || !finePointer) return;

    /* ---------- magnetic buttons ---------- */
    document.querySelectorAll(".btn, .library-buy, .portal-btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    /* ---------- cursor spotlight ---------- */
    const spot = document.createElement("div");
    spot.className = "fx-spotlight";
    spot.setAttribute("aria-hidden", "true");
    document.body.appendChild(spot);
    const lightSections = Array.from(document.querySelectorAll(".about-section, .contact-section"));

    /* ---------- sparkle trail ---------- */
    const canvas = document.createElement("canvas");
    canvas.id = "fx-sparkles";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    const colors = ["243,211,107", "201,162,39", "143,230,210", "178,140,255", "255,250,235"];
    const parts = [];
    let lastX = null, lastY = null, running = false;

    window.addEventListener("pointermove", function (e) {
      spot.style.setProperty("--sx", e.clientX + "px");
      spot.style.setProperty("--sy", e.clientY + "px");
      spot.classList.add("on");
      const overLight = lightSections.some(function (s) {
        const r = s.getBoundingClientRect();
        return e.clientY >= r.top && e.clientY <= r.bottom;
      });
      spot.classList.toggle("on-light", overLight);

      if (lastX !== null) {
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        const n = Math.min(Math.floor(dist / 14), 3);
        for (let i = 0; i < n; i++) {
          parts.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.6,
            vy: Math.random() * 0.6 + 0.2,
            life: 1,
            size: Math.random() * 2.2 + 0.8,
            c: colors[(Math.random() * colors.length) | 0],
            star: Math.random() < 0.25,
          });
        }
        if (parts.length > 140) parts.splice(0, parts.length - 140);
      }
      lastX = e.clientX; lastY = e.clientY;
      if (!running) { running = true; requestAnimationFrame(draw); }
    }, { passive: true });

    document.addEventListener("pointerleave", function () { spot.classList.remove("on"); lastX = null; });

    function drawStar(x, y, r) {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 2.4);
      ctx.quadraticCurveTo(x, y, x + r * 2.4, y);
      ctx.quadraticCurveTo(x, y, x, y + r * 2.4);
      ctx.quadraticCurveTo(x, y, x - r * 2.4, y);
      ctx.quadraticCurveTo(x, y, x, y - r * 2.4);
      ctx.fill();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy *= 0.98;
        p.life -= 0.022;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.fillStyle = "rgba(" + p.c + "," + (p.life * 0.9).toFixed(3) + ")";
        ctx.shadowColor = "rgba(" + p.c + ",0.9)";
        ctx.shadowBlur = 8;
        if (p.star) drawStar(p.x, p.y, p.size * p.life);
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); }
      }
      if (parts.length) requestAnimationFrame(draw);
      else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }
  });
})();
