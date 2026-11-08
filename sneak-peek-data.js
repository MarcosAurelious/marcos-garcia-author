/* =====================================================
   Book sneak peeks: the content shown when a reader
   clicks a book in "Every Book".

   Each entry is keyed by the book's cover file name.
   - pages:   sample page images, in order (image files
              live in the sneak-peek/ folder).
   - excerpt: paragraphs of sample text, as plain strings.
   - note:    optional one-line intro shown above the excerpt.

   A book with no pages and no excerpt shows a
   "coming soon" placeholder instead.
   ===================================================== */
window.SNEAK_PEEKS = {
  "cover-weird-science.jpg": {
    note: "From Chapter 01 · Potato AM Radios",
    pages: [
      { src: "sneak-peek/weird-science-1.webp", alt: "Plate: The Digital Temple of Inquiry" },
      { src: "sneak-peek/weird-science-2.webp", alt: "Chapter 01 opening page, Potato AM Radios" },
      { src: "sneak-peek/weird-science-3.webp", alt: "Plate: The Potato Radio Lab" },
      { src: "sneak-peek/weird-science-4.webp", alt: "Plate: Signal vs. Static brain map" },
      { src: "sneak-peek/weird-science-5.webp", alt: "Plate: Marcus's Field Notes" },
      { src: "sneak-peek/weird-science-6.webp", alt: "Plate: Faraday Cages, Chapter 2 opener" }
    ],
    excerpt: [
      "The Stoic mind is a receiver. It does not accept every broadcast. It filters, questions, and tunes toward what is useful, true, and virtuous. A potato battery and a crystal radio are different classroom demonstrations; this chapter joins them as a teaching metaphor, not a claim that a potato is a complete radio.",
      "Clarity is the discipline of tuning the mind.",
      "Practice: write one daily disturbance as a signal problem: event, added story, clearer interpretation, wiser action."
    ]
  },

  "universe-grand-mysteries-cover.webp": {
    note: "From the Introduction",
    pages: [
      { src: "sneak-peek/grand-mysteries-1.webp", alt: "Opening quote: You have power over your mind, not outside events" },
      { src: "sneak-peek/grand-mysteries-2.webp", alt: "How to Read This Book" },
      { src: "sneak-peek/grand-mysteries-3.webp", alt: "Part I: The Unseen Universe" },
      { src: "sneak-peek/grand-mysteries-4.webp", alt: "Chapter 1: Dark Matter" },
      { src: "sneak-peek/grand-mysteries-5.webp", alt: "Hand-drawn illustration: Dark Matter" },
      { src: "sneak-peek/grand-mysteries-6.webp", alt: "Hand-drawn illustration: Evaporating Black Holes" }
    ],
    excerpt: [
      "The Stoics taught that peace of mind comes from understanding what lies within our control and accepting, with grace, what does not. Nothing puts that lesson into perspective quite like the universe itself — vast, strange, and largely indifferent to us.",
      "This book pairs sixteen of the cosmos's grandest mysteries — from invisible dark matter to the slow evaporation of black holes — with reflections inspired by Marcus Aurelius and the Stoic tradition. Each chapter offers a concept, a fact to spark wonder, and a thought to carry with you, paired with a hand-drawn illustration to sit with as you read."
    ]
  },

  "cover-anunnaki.jpg": {
    note: "From Chapter 1 · Before the Arrival",
    pages: [
      { src: "sneak-peek/anunnaki-1.webp", alt: "A Letter to the Reader" },
      { src: "sneak-peek/anunnaki-2.webp", alt: "The Anunnaki Timeline: their journey on Earth" },
      { src: "sneak-peek/anunnaki-3.webp", alt: "Chapter 1: Before the Arrival" },
      { src: "sneak-peek/anunnaki-4.webp", alt: "Illustration: the Anunnaki home world" },
      { src: "sneak-peek/anunnaki-5.webp", alt: "Illustration: a ship descends over an ancient city" },
      { src: "sneak-peek/anunnaki-6.webp", alt: "Illustration: The Creation of the Adamu" }
    ],
    excerpt: [
      "Before the first city, before the first word was pressed into clay, a world already turned in the dark beyond the sun's ninth orbit. The Anunnaki called it home — a world of long winters and longer memory, riding an orbit so vast that a single one of its years swallowed thousands of Earth's.",
      "Its air was thinning. Its metals were failing. Its people were dying by inches, and they knew it.",
      "They had watched the inner worlds for an age already — the small blue-green one third from the sun, restless with life but empty of mind. It would not stay empty long."
    ]
  },

  "cover-work-in-progress.jpg": {
    note: "",
    pages: [],
    excerpt: []
  },

  "cover-gramma-shunis.jpg": {
    note: "A Letter From Gramma Shunis",
    pages: [
      { src: "sneak-peek/gramma-shunis-1.webp", alt: "A Letter From Gramma Shunis and her Kitchen Rules" },
      { src: "sneak-peek/gramma-shunis-2.webp", alt: "Gramma Shunis' Kitchen Safety" },
      { src: "sneak-peek/gramma-shunis-3.webp", alt: "Meet the Kitchen Tools" },
      { src: "sneak-peek/gramma-shunis-4.webp", alt: "Recipe 1: Butter Noodles" },
      { src: "sneak-peek/gramma-shunis-5.webp", alt: "Butter Noodles recipe card" },
      { src: "sneak-peek/gramma-shunis-6.webp", alt: "Homemade Donuts recipe card" }
    ],
    excerpt: [
      "Hello, my little chefs!",
      "My kitchen has always been filled with laughter, stories, and delicious food. Every recipe in this book has been shared with someone I love, and now I'm sharing it with you.",
      "We wash our hands. We help each other. We always taste with a smile. Now tie on your apron — let's start cooking!"
    ]
  }
};
