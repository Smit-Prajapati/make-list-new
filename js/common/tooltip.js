// ─── tooltip.js — reusable tooltip for any `data-tooltip="..."` element ────
// The tooltip itself is pure CSS, shown on hover. This module only adds the
// mobile-equivalent: touch devices have no hover, so a tap here briefly
// reveals the same tooltip instead. One delegated listener covers every
// tooltip in the app, including ones rendered after this runs.

const VISIBLE_DURATION_MS = 1600;

export function initTooltips() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-tooltip]");
    if (!el) return;

    el.classList.add("tooltip-visible");
    clearTimeout(el._tooltipHideTimer);
    el._tooltipHideTimer = setTimeout(() => {
      el.classList.remove("tooltip-visible");
    }, VISIBLE_DURATION_MS);
  });
}
