/* Featured book: gentle 3D tilt on hover. */
(() => {
  const shell = document.getElementById("featured-book-card");
  const cover = shell?.querySelector(".interactive-cover");
  if (!shell || !cover) return;

  shell.addEventListener("mousemove", (event) => {
    const rect = shell.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    cover.style.transform = `rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateZ(5px)`;
  });
  shell.addEventListener("mouseleave", () => { cover.style.transform = ""; });
})();
