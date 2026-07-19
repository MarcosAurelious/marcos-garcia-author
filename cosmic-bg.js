/* ============================================
   Marcos Garcia — Cosmic Background Effect (JS)
   Drop this file in as /cosmic-bg.js
   Creates a twinkling starfield + occasional shooting
   stars on a fixed full-page <canvas>.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // 1) Insert the nebula glow div (pure CSS layer)
  const nebula = document.createElement("div");
  nebula.className = "cosmic-nebula";
  document.body.prepend(nebula);

  // 2) Insert the canvas for stars
  const canvas = document.createElement("canvas");
  canvas.id = "cosmic-bg-canvas";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let width, height, stars, shootingStars;

  const STAR_COUNT_PER_1000PX2 = 0.12; // density control

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.round((width * height) / 10000 * STAR_COUNT_PER_1000PX2 * 10);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.35,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.15 ? "200, 220, 255" : "255, 250, 235",
    }));
  }

  function spawnShootingStar() {
    const startX = Math.random() * width * 0.7;
    const startY = Math.random() * height * 0.4;
    shootingStars.push({
      x: startX,
      y: startY,
      len: Math.random() * 120 + 80,
      speed: Math.random() * 9 + 7,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
      life: 1,
    });
  }

  shootingStars = [];
  resize();
  window.addEventListener("resize", resize);

  // Occasionally spawn a shooting star
  function maybeSpawn() {
    if (Math.random() < 0.012 && shootingStars.length < 2) {
      spawnShootingStar();
    }
    setTimeout(maybeSpawn, 600);
  }
  maybeSpawn();

  let t = 0;
  function draw() {
    t += 1;
    ctx.clearRect(0, 0, width, height);

    // Stars
    stars.forEach((s) => {
      const twinkle = Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.35;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.hue}, ${alpha})`;
      ctx.fill();
    });

    // Shooting stars
    shootingStars.forEach((sh) => {
      const dx = Math.cos(sh.angle) * sh.speed;
      const dy = Math.sin(sh.angle) * sh.speed;
      sh.x += dx;
      sh.y += dy;
      sh.life -= 0.012;

      const tailX = sh.x - Math.cos(sh.angle) * sh.len;
      const tailY = sh.y - Math.sin(sh.angle) * sh.len;

      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${Math.max(sh.life, 0)})`);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    });

    shootingStars = shootingStars.filter(
      (sh) => sh.life > 0 && sh.x < width + 200 && sh.y < height + 200
    );

    requestAnimationFrame(draw);
  }

  // Respect reduced-motion preference: stars stay static, no shooting stars
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.hue}, ${s.baseAlpha})`;
      ctx.fill();
    });
  } else {
    draw();
  }
});
