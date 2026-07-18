// Marcos Garcia — Author Site
// Restores navigation, reveals, image placement, and balanced layouts.

document.addEventListener("DOMContentLoaded", function () {
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

  const repairStyle = document.createElement("style");
  repairStyle.id = "marcos-layout-repair";
  repairStyle.textContent = `
    /* HERO: text left, Marcus image right */
    .hero .hero-inner {
      width: min(1180px, calc(100% - 64px)) !important;
      margin: 0 auto !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr) !important;
      align-items: center !important;
      gap: clamp(50px, 7vw, 100px) !important;
    }

    .hero .hero-text {
      min-width: 0 !important;
      text-align: left !important;
    }

    .hero .hero-figure {
      width: 100% !important;
      max-width: 430px !important;
      margin: 0 0 0 auto !important;
      justify-self: end !important;
    }

    .hero .specimen-frame,
    .hero .specimen-image {
      width: 100% !important;
      max-width: 430px !important;
    }

    .hero .specimen-image {
      display: block !important;
      height: auto !important;
      object-fit: contain !important;
    }

    /* FEATURED BOOK: cover left, information right */
    #book .book-card {
      width: 100% !important;
      display: grid !important;
      grid-template-columns: minmax(300px, 430px) minmax(0, 1fr) !important;
      align-items: center !important;
      gap: clamp(58px, 7vw, 110px) !important;
    }

    #book .book-cover {
      width: 100% !important;
      max-width: 430px !important;
      margin: 0 !important;
      justify-self: start !important;
    }

    #book .book-details {
      width: 100% !important;
      max-width: 680px !important;
      margin: 0 !important;
      text-align: left !important;
    }

    #book .cover-image {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center !important;
    }

    /* ABOUT: author photo left, biography center, cosmic Marcus right */
    #about .about-balanced {
      width: min(1220px, calc(100% - 64px)) !important;
      max-width: 1220px !important;
      margin: 0 auto !important;
      display: grid !important;
      grid-template-columns:
        minmax(250px, 310px)
        minmax(380px, 1fr)
        minmax(230px, 285px) !important;
      align-items: center !important;
      gap: clamp(40px, 5vw, 70px) !important;
    }

    #about .about-author-photo {
      grid-column: 1 !important;
      width: 100% !important;
      margin: 0 !important;
      justify-self: start !important;
    }

    #about .about-author-photo .photo-frame {
      width: 100% !important;
      max-width: 310px !important;
      margin: 0 !important;
    }

    #about .about-author-photo img {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      aspect-ratio: 4 / 5 !important;
      object-fit: cover !important;
      object-position: center top !important;
    }

    #about .about-text {
      grid-column: 2 !important;
      width: 100% !important;
      max-width: 650px !important;
      margin: 0 !important;
      text-align: left !important;
    }

    #about .about-cosmic-card {
      grid-column: 3 !important;
      width: 100% !important;
      max-width: 285px !important;
      margin: 0 !important;
      justify-self: end !important;
    }

    #about .about-cosmic-image {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      aspect-ratio: 4 / 5 !important;
      object-fit: cover !important;
      object-position: center 24% !important;
    }

    /* FUTURE BOOK: cover left, description right */
    #future .future-inner.future-book-layout {
      width: min(1160px, calc(100% - 64px)) !important;
      max-width: 1160px !important;
      margin: 0 auto !important;
      display: grid !important;
      grid-template-columns: minmax(280px, 360px) minmax(0, 1fr) !important;
      align-items: center !important;
      gap: clamp(55px, 7vw, 100px) !important;
      text-align: left !important;
    }

    #future .future-book-image {
      grid-column: 1 !important;
      width: 100% !important;
      max-width: 360px !important;
      margin: 0 !important;
      justify-self: start !important;
    }

    #future .future-cover-frame img {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      object-fit: contain !important;
    }

    #future .future-book-copy {
      grid-column: 2 !important;
      width: 100% !important;
      max-width: 700px !important;
      margin: 0 !important;
      text-align: left !important;
    }

    #future .future-book-copy .eyebrow,
    #future .future-book-copy .section-title,
    #future .future-copy {
      text-align: left !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    @media (max-width: 900px) {
      .hero .hero-inner,
      #book .book-card,
      #future .future-inner.future-book-layout {
        grid-template-columns: minmax(230px, 320px) minmax(0, 1fr) !important;
        gap: 38px !important;
      }

      #about .about-balanced {
        grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) !important;
        grid-template-areas:
          "photo text"
          "cosmic text" !important;
      }

      #about .about-author-photo {
        grid-area: photo !important;
      }

      #about .about-text {
        grid-area: text !important;
      }

      #about .about-cosmic-card {
        grid-area: cosmic !important;
        justify-self: center !important;
        max-width: 250px !important;
      }
    }

    @media (max-width: 680px) {
      .hero .hero-inner,
      #book .book-card,
      #about .about-balanced,
      #future .future-inner.future-book-layout {
        width: min(100% - 32px, 560px) !important;
        grid-template-columns: 1fr !important;
        gap: 36px !important;
      }

      .hero .hero-text,
      #book .book-details,
      #about .about-text,
      #future .future-book-copy,
      #future .future-book-copy .eyebrow,
      #future .future-book-copy .section-title,
      #future .future-copy {
        text-align: center !important;
      }

      .hero .hero-figure,
      #book .book-cover,
      #about .about-author-photo,
      #about .about-cosmic-card,
      #future .future-book-image {
        grid-column: 1 !important;
        margin-left: auto !important;
        margin-right: auto !important;
        justify-self: center !important;
      }

      #about .about-balanced {
        grid-template-areas:
          "photo"
          "text"
          "cosmic" !important;
      }

      #future .future-book-copy {
        grid-column: 1 !important;
      }
    }
  `;
  document.head.appendChild(repairStyle);

  const revealTargets = document.querySelectorAll(
    ".book-card, .about-balanced, .future-inner, .contact-block"
  );

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealTargets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity .7s ease, transform .7s ease";
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------- FEATURED BOOK FRONT/BACK FIX ---------------- */

  const bookButton =
    document.getElementById("book-flip-button") ||
    Array.from(document.querySelectorAll("button, a, [role='button']")).find(
      function (element) {
        return element.textContent.trim().toLowerCase() === "view back cover" ||
               element.textContent.trim().toLowerCase() === "view front cover";
      }
    );

  const bookShell =
    document.getElementById("featured-book-card") ||
    document.querySelector(".book-flip-shell") ||
    document.querySelector(".book-flip-inner");

  const bookContainer =
    document.querySelector(".enhanced-book-cover") ||
    (bookShell ? bookShell.parentElement : null);

  const backPanel =
    document.querySelector(".book-back-panel") ||
    document.querySelector(".cover-back");

  const bookFixStyle = document.createElement("style");
  bookFixStyle.id = "featured-book-front-back-repair";
  bookFixStyle.textContent = `
    .enhanced-book-cover {
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      width: 100% !important;
      max-width: 430px !important;
      margin: 0 !important;
      overflow: visible !important;
    }

    .book-flip-shell {
      position: relative !important;
      display: block !important;
      width: 100% !important;
      max-width: 430px !important;
      aspect-ratio: .78 !important;
      margin: 0 auto !important;
      perspective: 1400px !important;
      overflow: visible !important;
    }

    .book-flip-inner,
    #featured-book-card {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      transform-style: preserve-3d !important;
      transition: transform .8s cubic-bezier(.2,.75,.2,1) !important;
    }

    .book-flip-inner.is-flipped,
    #featured-book-card.is-flipped {
      transform: rotateY(180deg) !important;
    }

    .book-face,
    .cover-front,
    .book-back-panel,
    .cover-back {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
    }

    .book-back-panel,
    .cover-back {
      transform: rotateY(180deg) !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      padding: clamp(18px, 4vw, 34px) !important;
      overflow: hidden !important;
      text-align: center !important;
    }

    .book-back-panel h4,
    .cover-back h4 {
      margin: 8px 0 10px !important;
      font-size: clamp(1.32rem, 3vw, 2rem) !important;
      line-height: 1.02 !important;
    }

    .book-back-panel p:not(.book-back-kicker):not(.book-back-author),
    .cover-back p:not(.book-back-kicker):not(.book-back-author) {
      width: 100% !important;
      max-width: 300px !important;
      margin: 0 auto !important;
      font-size: clamp(.7rem, 1.45vw, .88rem) !important;
      line-height: 1.38 !important;
    }

    .book-back-kicker,
    .book-back-author {
      margin: 0 !important;
      font-size: clamp(.54rem, 1.1vw, .66rem) !important;
      line-height: 1.2 !important;
    }

    .book-back-mark {
      margin: 8px 0 7px !important;
      font-size: 1.25rem !important;
      line-height: 1 !important;
    }

    #book-flip-button,
    .book-flip-button {
      position: relative !important;
      inset: auto !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      left: auto !important;
      transform: none !important;
      float: none !important;
      clear: both !important;
      z-index: 50 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      max-width: calc(100% - 20px) !important;
      min-height: 44px !important;
      margin: 20px auto 0 !important;
      padding: 11px 18px !important;
      white-space: normal !important;
      line-height: 1.25 !important;
    }

    @media (max-width: 700px) {
      .enhanced-book-cover,
      .book-flip-shell {
        max-width: 330px !important;
      }

      .book-back-panel,
      .cover-back {
        padding: 16px !important;
      }

      .book-back-panel h4,
      .cover-back h4 {
        margin: 6px 0 8px !important;
        font-size: 1.28rem !important;
      }

      .book-back-panel p:not(.book-back-kicker):not(.book-back-author),
      .cover-back p:not(.book-back-kicker):not(.book-back-author) {
        font-size: .68rem !important;
        line-height: 1.3 !important;
      }

      .book-back-mark {
        margin: 5px 0 !important;
      }
    }

    @media (max-width: 390px) {
      .book-back-panel h4,
      .cover-back h4 {
        font-size: 1.12rem !important;
      }

      .book-back-panel p:not(.book-back-kicker):not(.book-back-author),
      .cover-back p:not(.book-back-kicker):not(.book-back-author) {
        font-size: .62rem !important;
        line-height: 1.25 !important;
      }

      .book-back-mark {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(bookFixStyle);

  if (bookButton && bookShell) {
    bookButton.id = "book-flip-button";
    bookButton.classList.add("book-flip-button");

    // Keep the button outside and directly below the rotating book.
    if (bookContainer) {
      if (bookShell.parentElement === bookContainer) {
        bookShell.insertAdjacentElement("afterend", bookButton);
      } else {
        bookContainer.appendChild(bookButton);
      }
    }

    bookButton.setAttribute("type", "button");
    bookButton.setAttribute("aria-pressed", "false");

    // Remove any old duplicate click handlers by replacing the button.
    const cleanButton = bookButton.cloneNode(true);
    bookButton.replaceWith(cleanButton);

    cleanButton.addEventListener("click", function (event) {
      event.preventDefault();

      const flipped = bookShell.classList.toggle("is-flipped");

      // Some versions rotate an inner card rather than the shell itself.
      const inner = bookShell.querySelector(".book-flip-inner");
      if (inner) {
        inner.classList.toggle("is-flipped", flipped);
      }

      cleanButton.textContent = flipped
        ? "View Front Cover"
        : "View Back Cover";

      cleanButton.setAttribute("aria-pressed", flipped ? "true" : "false");
    });
  }

});
