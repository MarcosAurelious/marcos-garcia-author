/* ==========================================================
   MARCOS AUTHOR SITE — LAYOUT FIX
   Replace the existing marcus-additions.css with this file.
   ========================================================== */

/* ---------- MEET THE AUTHOR ---------- */

.about-photo {
  position: relative;
}

/* Keep the cosmic Marcus image and move its caption to the right */
.marcus-bust-card {
  width: 100%;
  max-width: 520px;
  margin: 30px 0 0;
  display: grid;
  grid-template-columns: minmax(180px, 265px) minmax(120px, 1fr);
  align-items: center;
  gap: 22px;
}

.about-bust {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: center 25%;
  border: 1px solid rgba(45, 37, 27, 0.22);
  box-shadow: 0 22px 50px rgba(20, 16, 12, 0.18);
}

.marcus-bust-card figcaption {
  margin: 0;
  max-width: 180px;
  text-align: left;
  font-family: "Space Mono", monospace;
  font-size: 0.72rem;
  line-height: 1.7;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  opacity: 0.66;
}

/* ---------- IN DEVELOPMENT ---------- */

/* Strong overrides to prevent the original future-section styles
   from squeezing the text into a narrow column. */
.future-section .future-inner.future-book-layout {
  width: min(1180px, calc(100% - 48px));
  max-width: 1180px;
  margin: 0 auto;
  padding-left: 0;
  padding-right: 0;
  display: grid;
  grid-template-columns: minmax(250px, 360px) minmax(0, 1fr);
  align-items: center;
  justify-content: center;
  justify-items: stretch;
  gap: clamp(48px, 7vw, 96px);
  text-align: left;
}

.future-section .future-book-image {
  width: 100%;
  max-width: 360px;
  margin: 0;
  align-self: center;
  text-align: center;
}

.future-cover-frame {
  position: relative;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  background: rgba(7, 12, 17, 0.58);
  border: 1px solid rgba(211, 181, 121, 0.42);
  box-shadow:
    0 28px 58px rgba(0, 0, 0, 0.44),
    0 0 38px rgba(198, 160, 74, 0.09);
}

.future-cover-frame::before,
.future-cover-frame::after {
  content: "";
  position: absolute;
  width: 28px;
  height: 28px;
  pointer-events: none;
}

.future-cover-frame::before {
  top: 4px;
  left: 4px;
  border-top: 1px solid rgba(226, 198, 142, 0.72);
  border-left: 1px solid rgba(226, 198, 142, 0.72);
}

.future-cover-frame::after {
  right: 4px;
  bottom: 4px;
  border-right: 1px solid rgba(226, 198, 142, 0.72);
  border-bottom: 1px solid rgba(226, 198, 142, 0.72);
}

.future-cover-frame img {
  display: block;
  width: 100%;
  height: auto;
}

.future-status {
  margin: 17px 0 0;
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  line-height: 1.5;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  opacity: 0.76;
}

.future-section .future-book-copy {
  width: 100%;
  max-width: 720px;
  margin: 0;
  align-self: center;
}

.future-section .future-book-copy .section-title {
  width: 100%;
  max-width: 760px;
  margin-top: 14px;
  margin-bottom: 24px;
  font-size: clamp(2.1rem, 4vw, 4.6rem);
  line-height: 1.03;
  letter-spacing: -0.02em;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
}

.future-section .future-copy {
  width: 100%;
  max-width: 680px;
  margin-left: 0;
  margin-right: 0;
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.8;
}

.future-section .future-book-copy .btn {
  margin-top: 10px;
}

/* ---------- TABLET ---------- */

@media (max-width: 900px) {
  .marcus-bust-card {
    max-width: 430px;
    grid-template-columns: minmax(180px, 240px) 1fr;
  }

  .future-section .future-inner.future-book-layout {
    grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
    gap: 42px;
  }

  .future-section .future-book-copy .section-title {
    font-size: clamp(2rem, 5vw, 3.4rem);
  }
}

/* ---------- MOBILE ---------- */

@media (max-width: 700px) {
  .marcus-bust-card {
    width: min(100%, 340px);
    margin: 28px auto 0;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .marcus-bust-card figcaption {
    max-width: none;
    text-align: right;
  }

  .future-section .future-inner.future-book-layout {
    width: min(100% - 32px, 560px);
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .future-section .future-book-image {
    width: min(310px, 82vw);
    margin: 0 auto;
  }

  .future-section .future-book-copy {
    max-width: 560px;
    margin: 0 auto;
  }

  .future-section .future-book-copy .section-title,
  .future-section .future-copy {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .future-section .future-book-copy .section-title {
    font-size: clamp(2rem, 10vw, 3.3rem);
    line-height: 1.06;
  }
}
