// ─── loader.js — per-image inline loading spinners ───────────────────────────
// Instead of a fullscreen overlay, each image container shows a small spinner
// while its <img> is in-flight. When it finishes, the image scales in while
// the spinner scales away, so the handoff feels smooth rather than abrupt.

/**
 * Injects a spinner into every image container found inside `container`, hides
 * the <img> until it finishes loading, then animates the handoff.
 *
 * Works with any `.image-container` or `.item-image-container` element that
 * wraps a single <img>.
 *
 * @param {Element|Document} [container=document]
 */
export function initImageLoaders(container = document) {
  const images = Array.from(container.querySelectorAll("img"));

  images.forEach((img) => {
    const wrapper = img.parentElement;
    if (!wrapper) return;

    // A container can be initialized more than once after a re-render.
    if (img.dataset.imageLoaderInitialized === "true") return;

    img.dataset.imageLoaderInitialized = "true";

    // Build the inline spinner.
    const spinnerEl = document.createElement("div");
    spinnerEl.className = "img-spinner";

    // Hide the real image until it's ready
    img.classList.add("img-loading");

    wrapper.appendChild(spinnerEl);

    let hasRevealed = false;

    function reveal() {
      if (hasRevealed) return;
      hasRevealed = true;

      img.classList.remove("img-loading");
      spinnerEl.classList.add("img-spinner--leaving");

      // Remove it after its scale-out transition, without relying on a
      // transition event that may not fire in a background browser tab.
      window.setTimeout(() => spinnerEl.remove(), 340);
    }

    // Defer one frame so the initial scale(0) state is painted before the
    // handoff begins. This also lets cached images use the same animation.
    function scheduleReveal() {
      window.requestAnimationFrame(reveal);
    }

    img.addEventListener("load", scheduleReveal, { once: true });
    img.addEventListener("error", scheduleReveal, { once: true });

    // A cached image may already be complete before listeners are attached.
    if (img.complete) scheduleReveal();
  });
}
