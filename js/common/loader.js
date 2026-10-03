// ─── loader.js — reusable loading spinner ────────────────────────────────────

export function createLoader() {
  const loaderEl = document.createElement("div");
  loaderEl.className = "loader-container";
  loaderEl.innerHTML = `<div class="spinner"></div>`;

  /**
   * Shows the fullscreen loader immediately.
   */
  function show() {
    loaderEl.classList.remove("fade-out");
    document.body.appendChild(loaderEl);
  }

  /**
   * Hides the loader with a fade-out effect.
   */
  function hide() {
    loaderEl.classList.add("fade-out");
    setTimeout(() => {
      if (loaderEl.parentNode) {
        loaderEl.remove();
      }
    }, 300); // Matches the CSS transition duration
  }

  /**
   * Waits for all <img> tags inside a given container (or the document)
   * to finish loading, and then hides the loader.
   */
  async function hideWhenImagesLoaded(container = document) {
    const images = Array.from(container.querySelectorAll("img"));

    // We only need to wait for images that aren't already complete
    const promises = images
      .filter((img) => !img.complete)
      .map((img) => {
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true }); // resolve on error so we don't hang
        });
      });

    await Promise.all(promises);
    hide();
  }

  return { show, hide, hideWhenImagesLoaded };
}
