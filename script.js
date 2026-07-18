// Marcos Garcia Author Site — Safe Cinematic Enhancement
// Replace ONLY script.js. Keep your current index.html and style.css unchanged.

document.addEventListener("DOMContentLoaded", function () {
  /* ---------------- Existing site functions ---------------- */

  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- Inject enhancement styles ---------------- */

  const style = document.createElement("style");
  style.id = "marcos-cinematic-effects";
  style.textContent = `
    #cosmic-canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -3;
      background:
        radial-gradient(circle at 20% 20%, rgba(95,184,163,.10), transparent 34%),
        radial-gradient(circle at 82% 30%, rgba(201,162,39,.09), transparent 32%),
        radial-gradient(circle at 55% 85%, rgba(184,112,62,.10), transparent 38%),
        #090c13;
    }

    body {
      position: relative;
      background: #090c13 !important;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: -2;
      opacity: .38;
      background:
        radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(95,184,163,.16), transparent 20%);
      transition: opacity .3s ease;
    }

    .hero,
    .book-section,
    .future-section {
      background:
        linear-gradient(rgba(18,21,28,.86), rgba(18,21,28,.92)) !important;
      position: relative;
      isolation: isolate;
    }

    .site-header {
      background: rgba(10,13,20,.82) !important;
    }

    .about-section {
      background: rgba(239,230,211,.96) !important;
    }

    .contact-section {
      background: rgba(228,217,193,.96) !important;
    }

    .cinematic-reveal {
      opacity: 0;
      transform: translateY(28px) scale(.985);
      filter: blur(5px);
      transition:
        opacity .85s ease,
        transform .85s cubic-bezier(.2,.75,.25,1),
        filter .85s ease;
    }

    .cinematic-reveal.is-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }

    .specimen-frame {
      transform-style: preserve-3d;
      will-change: transform;
    }

    .specimen-frame::before,
    .specimen-frame::after {
      content: "";
      position: absolute;
      inset: -18px;
      border: 1px solid rgba(201,162,39,.23);
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      animation: cosmic-orbit 18s linear infinite;
    }

    .specimen-frame::after {
      inset: -38px;
      border-color: rgba(95,184,163,.18);
      animation-duration: 26s;
      animation-direction: reverse;
    }

    @keyframes cosmic-orbit {
      from { transform: rotate(0deg) scaleX(.82); }
      to { transform: rotate(360deg) scaleX(.82); }
    }

    .cover-frame,
    .photo-frame,
    .future-cover,
    [class*="book-cover"] img {
      transition:
        transform .45s ease,
        box-shadow .45s ease,
        filter .45s ease;
      will-change: transform;
    }

    .cover-frame:hover,
    .future-cover:hover,
    [class*="book-cover"] img:hover {
      transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
      filter: brightness(1.05);
      box-shadow:
        0 25px 60px rgba(0,0,0,.45),
        0 0 35px rgba(201,162,39,.18);
    }

    .btn {
      position: relative;
      overflow: hidden;
    }

    .btn::after {
      content: "";
      position: absolute;
      top: -80%;
      left: -45%;
      width: 35%;
      height: 260%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,.28),
        transparent
      );
      transform: rotate(18deg);
      transition: left .65s ease;
    }

    .btn:hover::after {
      left: 125%;
    }

    .cosmic-divider {
      height: 1px;
      width: min(480px, 70vw);
      margin: 0 auto;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(201,162,39,.75),
        rgba(95,184,163,.75),
        transparent
      );
      box-shadow: 0 0 14px rgba(95,184,163,.25);
      transform-origin: center;
      animation: divider-breathe 5s ease-in-out infinite;
    }

    @keyframes divider-breathe {
      0%,100% { opacity: .35; transform: scaleX(.85); }
      50% { opacity: .95; transform: scaleX(1); }
    }

    .shooting-star {
      position: fixed;
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.9));
      pointer-events: none;
      z-index: -1;
      opacity: 0;
      transform: rotate(-28deg);
      animation: shoot 1.4s ease-out forwards;
    }

    @keyframes shoot {
      0% { opacity: 0; transform: translate(0,0) rotate(-28deg); }
      12% { opacity: 1; }
      100% {
        opacity: 0;
        transform: translate(-440px, 300px) rotate(-28deg);
      }
    }

    @media (max-width: 720px) {
      body::before { display: none; }
      .specimen-frame::after { display: none; }
      .cinematic-reveal {
        transform: translateY(18px);
        filter: blur(2px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #cosmic-canvas { display: none; }
      .cinematic-reveal {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
      }
      .specimen-frame::before,
      .specimen-frame::after,
      .cosmic-divider {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  /* ---------------- Animated star canvas ---------------- */

  if (!reducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.id = "cosmic-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let stars = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = Math.min(220, Math.max(90, Math.floor(width / 7)));
      stars = Array.from({ length: starCount }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.35 + 0.15,
          speed: Math.random() * 0.09 + 0.015,
          alpha: Math.random() * 0.7 + 0.2,
          phase: Math.random() * Math.PI * 2
        };
      });
    }

    function drawStars(time) {
      ctx.clearRect(0, 0, width, height);

      stars.forEach(function (star) {
        star.y += star.speed;
        if (star.y > height + 3) {
          star.y = -3;
          star.x = Math.random() * width;
        }

        const pulse =
          star.alpha * (0.72 + Math.sin(time * 0.001 + star.phase) * 0.28);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239,230,211," + Math.max(0.08, pulse) + ")";
        ctx.fill();
      });

      requestAnimationFrame(drawStars);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    requestAnimationFrame(drawStars);
  }

  /* ---------------- Mouse glow and hero parallax ---------------- */

  const specimen = document.querySelector(".specimen-frame");

  window.addEventListener(
    "pointermove",
    function (event) {
      document.documentElement.style.setProperty(
        "--mouse-x",
        (event.clientX / window.innerWidth) * 100 + "%"
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        (event.clientY / window.innerHeight) * 100 + "%"
      );

      if (specimen && !reducedMotion && window.innerWidth > 720) {
        const x = (event.clientX / window.innerWidth - 0.5) * 10;
        const y = (event.clientY / window.innerHeight - 0.5) * -8;
        specimen.style.transform =
          "perspective(900px) rotateY(" + x + "deg) rotateX(" + y + "deg)";
      }
    },
    { passive: true }
  );

  /* ---------------- Scroll reveals ---------------- */

  const revealTargets = document.querySelectorAll(
    ".hero-copy, .hero-figure, .book-card, .about-inner, .future-inner, .contact-block"
  );

  if (!reducedMotion && "IntersectionObserver" in window) {
    revealTargets.forEach(function (element) {
      element.classList.add("cinematic-reveal");
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(function (element, index) {
      element.style.transitionDelay = Math.min(index * 70, 280) + "ms";
      observer.observe(element);
    });
  }

  /* ---------------- Glowing section dividers ---------------- */

  document
    .querySelectorAll(".book-section, .about-section, .future-section")
    .forEach(function (section) {
      const divider = document.createElement("div");
      divider.className = "cosmic-divider";
      divider.setAttribute("aria-hidden", "true");
      section.insertAdjacentElement("beforebegin", divider);
    });

  /* ---------------- Occasional shooting star ---------------- */

  if (!reducedMotion) {
    function launchShootingStar() {
      const star = document.createElement("span");
      star.className = "shooting-star";
      star.style.top = Math.random() * 35 + 5 + "vh";
      star.style.left = Math.random() * 35 + 65 + "vw";
      document.body.appendChild(star);

      window.setTimeout(function () {
        star.remove();
      }, 1600);
    }

    window.setTimeout(launchShootingStar, 2600);
    window.setInterval(launchShootingStar, 14000);
  }

  /* ---------------- Back cover button support ---------------- */

  const flipButton = document.getElementById("book-flip-button");
  const flipShell =
    document.getElementById("featured-book-card") ||
    document.querySelector(".book-flip-shell");

  if (flipButton && flipShell) {
    flipButton.addEventListener("click", function () {
      const flipped = flipShell.classList.toggle("is-flipped");
      flipButton.textContent = flipped ? "View Front Cover" : "View Back Cover";
      flipButton.setAttribute("aria-pressed", flipped ? "true" : "false");
    });
  }
});
