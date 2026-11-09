/* =====================================================
   Book sneak peek: click a book in "Every Book" to open a
   neon panel with sample pages and an excerpt.
   Content lives in sneak-peek-data.js.
   ===================================================== */
(() => {
  const books = document.querySelectorAll("#library .library-book");
  if (!books.length) return;
  const DATA = window.SNEAK_PEEKS || {};

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ---------- the dialog, built once ---------- */
  const dlg = el("dialog", "peek");
  dlg.setAttribute("aria-labelledby", "peek-title");

  const shell = el("div", "peek-shell");
  const close = el("button", "peek-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close sneak peek");

  const head = el("header", "peek-head");
  const eyebrow = el("p", "peek-eyebrow", "Sneak Peek");
  const title = el("h2", "peek-title");
  title.id = "peek-title";
  const format = el("p", "peek-format");
  head.append(eyebrow, title, format);

  const body = el("div", "peek-body");

  /* page viewer */
  const viewer = el("div", "peek-viewer");
  const stage = el("div", "peek-stage");
  const pageImg = el("img", "peek-page");
  pageImg.alt = "";
  const zoomBtn = el("button", "peek-zoom-btn");
  zoomBtn.type = "button";
  zoomBtn.setAttribute("aria-label", "Zoom in on this page");
  zoomBtn.append(el("span", "peek-zoom-icon", "⌕"), el("span", null, "Zoom"));
  stage.append(pageImg);
  const nav = el("div", "peek-nav");
  const prev = el("button", "peek-arrow", "‹");
  prev.type = "button";
  prev.setAttribute("aria-label", "Previous page");
  const counter = el("span", "peek-count");
  counter.setAttribute("aria-live", "polite");
  const next = el("button", "peek-arrow", "›");
  next.type = "button";
  next.setAttribute("aria-label", "Next page");
  nav.append(prev, counter, next, zoomBtn);
  viewer.append(stage, nav);

  /* excerpt */
  const text = el("div", "peek-text");

  body.append(viewer, text);

  const foot = el("footer", "peek-foot");
  const buy = el("a", "peek-buy", "Buy on Amazon →");
  buy.target = "_blank";
  buy.rel = "noopener";
  foot.append(buy);

  /* full-screen zoom layer */
  const zoom = el("div", "peek-zoomer");
  zoom.hidden = true;
  const zoomScroll = el("div", "peek-zoom-scroll");
  const zoomImg = el("img", "peek-zoom-img");
  zoomImg.alt = "";
  zoomScroll.append(zoomImg);
  const zoomClose = el("button", "peek-close peek-zoom-close", "×");
  zoomClose.type = "button";
  zoomClose.setAttribute("aria-label", "Close zoom");
  const zoomHint = el("p", "peek-zoom-hint", "Click or tap to zoom closer · drag to move");
  zoom.append(zoomScroll, zoomClose, zoomHint);

  shell.append(close, head, body, foot);
  dlg.append(shell, zoom);
  document.body.append(dlg);

  /* ---------- state ---------- */
  let pages = [];
  let index = 0;
  let opener = null;

  function showPage(i) {
    if (!pages.length) return;
    index = (i + pages.length) % pages.length;
    const p = pages[index];
    stage.classList.remove("is-turning");
    void stage.offsetWidth; // restart the page-turn flash
    stage.classList.add("is-turning");
    pageImg.src = p.src;
    pageImg.alt = p.alt || "";
    counter.textContent = pages.length > 1 ? `${index + 1} / ${pages.length}` : "";
    prev.hidden = next.hidden = pages.length < 2;
  }

  function open(book) {
    const coverImg = book.querySelector(".library-cover img");
    const key = coverImg ? coverImg.getAttribute("src").split("?")[0] : "";
    const entry = DATA[key] || {};
    const samples = Array.isArray(entry.pages) ? entry.pages.filter((p) => p && p.src) : [];
    const paras = Array.isArray(entry.excerpt) ? entry.excerpt.filter(Boolean) : [];
    const empty = !samples.length && !paras.length;

    title.textContent = book.querySelector(".library-title")?.textContent.trim() || "";
    format.textContent = book.querySelector(".library-format")?.textContent.trim() || "";
    const link = book.querySelector(".library-buy");
    buy.href = link ? link.href : "#";
    buy.hidden = !link;

    /* the cover always leads; sample pages follow it */
    pages = [];
    if (coverImg) pages.push({ src: coverImg.getAttribute("src"), alt: coverImg.alt });
    pages.push(...samples);
    showPage(0);
    viewer.classList.toggle("is-cover-only", pages.length < 2);

    text.replaceChildren();
    if (empty) {
      const soon = el("div", "peek-soon");
      soon.append(
        el("p", "peek-soon-title", "Pages are on their way"),
        el("p", "peek-soon-text", "A look inside this book is coming soon. Until then, the full book is waiting on Amazon.")
      );
      text.append(soon);
    } else {
      if (entry.note) text.append(el("p", "peek-note", entry.note));
      paras.forEach((p, i) => text.append(el("p", i ? "peek-para" : "peek-para peek-para--first", p)));
      if (paras.length) text.append(el("p", "peek-more", "…the story continues in the book."));
    }
    text.hidden = !empty && !paras.length;
    body.classList.toggle("is-pages-only", text.hidden);
    text.scrollTop = 0;

    opener = book.querySelector(".peek-trigger") || document.activeElement;
    dlg.showModal();
    document.documentElement.classList.add("peek-open");
    close.focus();
  }

  /* ---------- zoom ---------- */
  let deep = false;
  function setDeep(on, cx, cy) {
    const r = zoomScroll.getBoundingClientRect();
    const fx = cx == null ? 0.5 : (cx - r.left + zoomScroll.scrollLeft) / zoomScroll.scrollWidth;
    const fy = cy == null ? 0.5 : (cy - r.top + zoomScroll.scrollTop) / zoomScroll.scrollHeight;
    deep = on;
    zoom.classList.toggle("is-deep", on);
    zoomScroll.scrollLeft = fx * zoomScroll.scrollWidth - r.width / 2;
    zoomScroll.scrollTop = fy * zoomScroll.scrollHeight - r.height / 2;
  }
  function openZoom() {
    const p = pages[index];
    if (!p) return;
    zoomImg.src = p.src;
    zoomImg.alt = p.alt || "";
    zoom.hidden = false;
    setDeep(false);
    zoomScroll.scrollTop = 0;
    zoomClose.focus();
  }
  function closeZoom() {
    if (zoom.hidden) return false;
    zoom.hidden = true;
    zoomBtn.focus();
    return true;
  }
  zoomBtn.addEventListener("click", openZoom);
  pageImg.addEventListener("click", openZoom);
  zoomClose.addEventListener("click", closeZoom);

  /* drag to pan; a click without dragging toggles the closer zoom */
  let drag = null;
  zoomScroll.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, y: e.clientY, l: zoomScroll.scrollLeft, t: zoomScroll.scrollTop, moved: false };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    zoomScroll.scrollLeft = drag.l - dx;
    zoomScroll.scrollTop = drag.t - dy;
  });
  window.addEventListener("pointerup", () => { setTimeout(() => { drag = null; }, 0); });
  zoomScroll.addEventListener("click", (e) => {
    if (drag && drag.moved) return;
    setDeep(!deep, e.clientX, e.clientY);
  });

  function shut() { if (dlg.open) dlg.close(); }

  dlg.addEventListener("cancel", (e) => { if (closeZoom()) e.preventDefault(); });
  dlg.addEventListener("close", () => {
    zoom.hidden = true;
    document.documentElement.classList.remove("peek-open");
    if (opener && opener.focus) opener.focus();
  });
  close.addEventListener("click", shut);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) shut(); });
  prev.addEventListener("click", () => showPage(index - 1));
  next.addEventListener("click", () => showPage(index + 1));
  dlg.addEventListener("keydown", (e) => {
    if (pages.length < 2 || !zoom.hidden) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); showPage(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); showPage(index + 1); }
  });

  /* swipe between pages on touch screens */
  let startX = null;
  stage.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) showPage(index + (dx < 0 ? 1 : -1));
  });

  /* ---------- hook up each book ---------- */
  books.forEach((book) => {
    const btn = el("button", "peek-trigger");
    btn.type = "button";
    btn.append(el("span", "peek-trigger-dot"), el("span", null, "Sneak Peek"));
    const name = book.querySelector(".library-title")?.textContent.trim();
    if (name) btn.setAttribute("aria-label", `Sneak peek inside ${name}`);
    btn.setAttribute("aria-haspopup", "dialog");
    btn.addEventListener("click", () => open(book));

    const buyLink = book.querySelector(".library-buy");
    const actions = el("div", "library-actions");
    if (buyLink) buyLink.before(actions);
    else book.append(actions);
    actions.append(btn);
    if (buyLink) actions.append(buyLink);

    const cover = book.querySelector(".library-cover");
    if (cover) {
      cover.classList.add("is-peekable");
      cover.addEventListener("click", () => open(book));
    }
  });
})();
