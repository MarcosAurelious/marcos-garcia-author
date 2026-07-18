// Marcos Garcia — Author Site
// Mobile navigation, footer year, reveal effects, and robust book-cover button fix.

document.addEventListener("DOMContentLoaded", function () {
  // Mobile navigation
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Gentle scroll reveal
  var revealTargets = document.querySelectorAll(
    ".book-card, .about-inner, .future-inner, .contact-block"
  );

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealTargets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------------------------------------------------------
  // BOOK COVER BUTTON FIX
  // Finds the real button by its visible text, regardless of
  // the class names used in index.html.
  // ---------------------------------------------------------

  var style = document.createElement("style");
  style.id = "marcos-book-cover-overlap-fix";
  style.textContent = `
    .mg-book-cover-fixed {
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      width: 100% !important;
      overflow: visible !important;
    }

    .mg-cover-visual {
      position: relative !important;
      width: 100% !important;
      overflow: hidden !important;
      z-index: 1 !important;
    }

    .mg-back-cover-button {
      position: relative !important;
      inset: auto !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      left: auto !important;
      transform: none !important;
      float: none !important;
      clear: both !important;
      z-index: 999 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      max-width: calc(100% - 24px) !important;
      min-height: 44px !important;
      margin: 20px auto 0 !important;
      padding: 12px 20px !important;
      white-space: normal !important;
      line-height: 1.25 !important;
      isolation: isolate !important;
    }

    .mg-cover-visual [class*="back"],
    .mg-cover-visual [class*="Back"] {
      overflow: auto !important;
      box-sizing: border-box !important;
    }

    @media (max-width: 480px) {
      .mg-back-cover-button {
        width: calc(100% - 12px) !important;
        margin-top: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);

  var controls = Array.from(
    document.querySelectorAll("button, a, [role='button']")
  );

  var backCoverButton = controls.find(function (el) {
    return el.textContent.trim().toLowerCase() === "view back cover";
  });

  if (!backCoverButton) {
    return;
  }

  // Locate the closest likely book-cover wrapper.
  var coverWrapper =
    backCoverButton.closest(
      ".book-cover, .enhanced-book-cover, [class*='book-cover'], [class*='cover-wrap'], [class*='flip']"
    ) || backCoverButton.parentElement;

  if (!coverWrapper) {
    return;
  }

  coverWrapper.classList.add("mg-book-cover-fixed");
  backCoverButton.classList.add("mg-back-cover-button");

  // Find the main visual/frame within the cover wrapper.
  var visual =
    coverWrapper.querySelector(
      ".cover-frame, .book-flip-shell, [class*='cover-frame'], [class*='flip-shell'], img"
    );

  if (visual) {
    // When an image was matched, use its immediate structural parent.
    if (visual.tagName === "IMG" && visual.parentElement !== coverWrapper) {
      visual = visual.parentElement;
    }

    visual.classList.add("mg-cover-visual");

    // Move the button after the visual. This is the key overlap fix.
    if (visual.nextElementSibling !== backCoverButton) {
      visual.insertAdjacentElement("afterend", backCoverButton);
    }
  } else {
    // Fallback: keep the button as the last element in the cover wrapper.
    coverWrapper.appendChild(backCoverButton);
  }
});
