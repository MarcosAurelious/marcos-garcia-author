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

  // Styles live in layout-repair.css (no inline styles, so the Content-Security-Policy can forbid them).
  const repairStyle = document.createElement("link");
  repairStyle.id = "marcos-layout-repair";
  repairStyle.rel = "stylesheet";
  repairStyle.href = "layout-repair.css";
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

  // Styles live in book-front-back.css (no inline styles, so the Content-Security-Policy can forbid them).
  const bookFixStyle = document.createElement("link");
  bookFixStyle.id = "featured-book-front-back-repair";
  bookFixStyle.rel = "stylesheet";
  bookFixStyle.href = "book-front-back.css";
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
