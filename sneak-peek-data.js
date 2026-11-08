/* =====================================================
   Book sneak peeks: the content shown when a reader
   clicks a book in "Every Book".

   Each entry is keyed by the book's cover file name.
   - pages:   sample page images, in order (put the image
              files in the sneak-peek/ folder).
   - excerpt: paragraphs of sample text, as plain strings.
   - note:    optional one-line intro shown above the excerpt.

   A book with no pages and no excerpt shows a
   "coming soon" placeholder instead.
   ===================================================== */
window.SNEAK_PEEKS = {
  "cover-weird-science.jpg": {
    note: "",
    pages: [
      // { src: "sneak-peek/weird-science-1.webp", alt: "Page 1" },
    ],
    excerpt: [
      // "First paragraph of the excerpt.",
    ]
  },

  "universe-grand-mysteries-cover.webp": {
    note: "",
    pages: [],
    excerpt: []
  },

  "cover-anunnaki.jpg": {
    note: "",
    pages: [],
    excerpt: []
  },

  "cover-work-in-progress.jpg": {
    note: "",
    pages: [],
    excerpt: []
  },

  "cover-gramma-shunis.jpg": {
    note: "",
    pages: [],
    excerpt: []
  }
};
