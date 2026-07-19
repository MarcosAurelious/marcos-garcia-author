/* ============================================
   Marcos Garcia — Author Site Animations (JS)
   Drop this file in as /animations.js and include it
   near the end of <body>, right before </body>.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // 1) Auto-tag common elements so you don't have to hand-edit HTML.
  //    Feel free to delete any line below if you'd rather control it
  //    yourself by adding class="reveal" directly in your HTML.
  document.querySelectorAll("section").forEach((section) => {
    section.querySelectorAll(":scope > *").forEach((child) => {
      if (!child.classList.contains("reveal")) {
        child.classList.add("reveal");
      }
    });
  });

  document.querySelectorAll("h2").forEach((h) => {
    h.classList.add("animated-heading");
  });

  document.querySelectorAll("section img").forEach((img) => {
    img.classList.add("img-hover-target");
  });

  // 2) IntersectionObserver drives the reveal / heading underline
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal, .animated-heading, .reveal-stagger")
    .forEach((el) => observer.observe(el));

  // 3) Hero entrance — targets the first section (your intro/hero block)
  const hero = document.querySelector("header, .hero, section:first-of-type");
  if (hero) {
    hero.querySelectorAll(":scope > *, :scope h1, :scope p, :scope a")
      .forEach((el, i) => {
        el.classList.add("hero-animate");
        // remove the scroll-reveal class so it doesn't fight the hero animation
        el.classList.remove("reveal");
      });
  }

  // 4) Floating effect for the first big illustration in the hero
  const heroImg = document.querySelector("header img, .hero img");
  if (heroImg) heroImg.classList.add("float");
});
