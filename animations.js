/* ============================================
   Marcos Garcia — Author Site Animations (JS)
   Drop this file in as /animations.js and include it
   near the end of <body>, right before </body>.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // NOTE: .hero and the book-flip card already have their own custom
  // animations (aura pulse, breathe, 3D flip/tilt) — we deliberately leave
  // those alone here so nothing fights with them. This only adds
  // scroll-triggered reveals to the sections below the fold.

  // 1) Book section — reveal the cover and the details column with a stagger
  document.querySelector(".book-card .book-cover")?.classList.add("reveal", "reveal-left");
  document.querySelector(".book-card .book-details")?.classList.add("reveal", "reveal-right");

  // 2) About section — photo, text, and cosmic card each animate in
  document.querySelector(".about-author-photo")?.classList.add("reveal", "reveal-left");
  document.querySelector(".about-text")?.classList.add("reveal");
  document.querySelector(".about-cosmic-card")?.classList.add("reveal", "reveal-right");

  // 3) Future book section
  document.querySelector(".future-book-image")?.classList.add("reveal", "reveal-zoom");
  document.querySelector(".future-book-copy")?.classList.add("reveal", "reveal-right");

  // 4) Contact / footer
  document.querySelector(".contact-block")?.classList.add("reveal");

  // 5) Section headings get the underline draw-in
  document.querySelectorAll("h2.section-title").forEach((h) => {
    h.classList.add("animated-heading");
  });

  // 6) Author photo + cosmic images get the hover zoom polish
  //    (book cover and hero specimen already have their own hover/tilt effects)
  document.querySelectorAll(".about-author-photo img, .about-cosmic-image")
    .forEach((img) => img.classList.add("img-hover-target"));

  // 7) IntersectionObserver drives all of the above, animating once each
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal, .animated-heading")
    .forEach((el) => observer.observe(el));
});
