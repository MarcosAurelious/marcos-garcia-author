// Exact featured-book overlap fix for marcos-garcia-author
document.addEventListener("DOMContentLoaded", () => {
  const shell = document.getElementById("featured-book-card");
  const button = document.getElementById("book-flip-button");
  const panel = document.querySelector(".book-back-panel");

  if (!shell || !button || !panel) return;

  const fix = document.createElement("style");
  fix.textContent = `
    .enhanced-book-cover {
      position: relative !important;
      width: 100% !important;
      max-width: 430px !important;
      margin: 0 auto !important;
      overflow: visible !important;
    }

    .book-flip-shell {
      position: relative !important;
      width: 100% !important;
      max-width: 430px !important;
      aspect-ratio: 0.78 !important;
      margin: 0 auto !important;
      overflow: visible !important;
    }

    .book-back-panel {
      padding: 24px 22px !important;
      overflow: hidden !important;
      justify-content: center !important;
    }

    .book-back-panel h4 {
      margin: 10px 0 !important;
      font-size: clamp(1.45rem, 3.2vw, 2.25rem) !important;
      line-height: 1.02 !important;
    }

    .book-back-panel p:not(.book-back-kicker):not(.book-back-author) {
      max-width: 290px !important;
      margin: 0 auto !important;
      font-size: clamp(.72rem, 1.45vw, .9rem) !important;
      line-height: 1.42 !important;
    }

    .book-back-kicker,
    .book-back-author {
      margin: 0 !important;
      font-size: .62rem !important;
      line-height: 1.2 !important;
    }

    .book-back-mark {
      margin: 10px 0 8px !important;
      font-size: 1.35rem !important;
    }

    #book-flip-button {
      position: relative !important;
      inset: auto !important;
      transform: none !important;
      display: block !important;
      width: fit-content !important;
      max-width: calc(100% - 20px) !important;
      min-height: 44px !important;
      margin: 22px auto 0 !important;
      padding: 11px 18px !important;
      clear: both !important;
      z-index: 999 !important;
      white-space: normal !important;
    }

    @media (max-width: 700px) {
      .enhanced-book-cover,
      .book-flip-shell {
        max-width: 320px !important;
      }

      .book-back-panel {
        padding: 18px 16px !important;
      }

      .book-back-panel h4 {
        font-size: 1.45rem !important;
        margin: 8px 0 !important;
      }

      .book-back-panel p:not(.book-back-kicker):not(.book-back-author) {
        font-size: .72rem !important;
        line-height: 1.34 !important;
      }

      .book-back-mark {
        margin: 7px 0 5px !important;
      }
    }

    @media (max-width: 390px) {
      .book-back-panel h4 {
        font-size: 1.22rem !important;
      }

      .book-back-panel p:not(.book-back-kicker):not(.book-back-author) {
        font-size: .66rem !important;
        line-height: 1.28 !important;
      }

      .book-back-mark {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(fix);

  // Force the control below the flipping book.
  const coverContainer = shell.parentElement;
  if (coverContainer && button.previousElementSibling !== shell) {
    shell.insertAdjacentElement("afterend", button);
  }
});
