/* Featured book: flip to back cover and tilt on hover. */
  (() => {
    const shell = document.getElementById("featured-book-card");
    const button = document.getElementById("book-flip-button");
    const cover = shell?.querySelector(".interactive-cover");

    if (!shell || !button || !cover) return;

    const toggleBook = () => {
      const flipped = shell.classList.toggle("is-flipped");
      button.textContent = flipped ? "View Front Cover" : "View Back Cover";
    };

    button.addEventListener("click", toggleBook);
    shell.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      toggleBook();
    });

    shell.addEventListener("mousemove", (event) => {
      if (shell.classList.contains("is-flipped")) return;

      const rect = shell.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 10;
      const rotateX = (0.5 - y) * 8;

      cover.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
      cover.style.filter = "brightness(1.05) saturate(1.08)";
    });

    shell.addEventListener("mouseleave", () => {
      cover.style.transform = "";
      cover.style.filter = "";
    });
  })();
