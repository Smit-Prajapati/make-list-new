// ─── viewSwitcher.js — switches between the registered item-list views ──────

import { views, viewOrder } from "./viewModes.js";
import { renderViewSwitcher } from "./views/viewSwitcherView.js";

export function createViewSwitcher(ctx) {
  const { state, els } = ctx;

  function render() {
    const switcher = els.viewSwitcherEl;
    switcher.style.setProperty("--view-count", viewOrder.length);
    switcher.innerHTML = renderViewSwitcher();

    // A view that needs per-item images is disabled when the page has none.
    // Not a native `disabled` attribute: that blocks click/touch entirely,
    // which would make the "why is this disabled" tooltip unreachable on
    // mobile (no hover there, and a disabled element can't be tapped).
    viewOrder.forEach((id, index) => {
      if (views[id].requiresImages && !state.hasImages) {
        const btn = switcher.querySelector(`[data-view="${id}"]`);
        btn.classList.add("disabled");
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("data-tooltip", "No images");

        // The last button sits at the switcher's right edge; a centered
        // tooltip there would overflow past the screen and cause a
        // horizontal scrollbar, so anchor it to the right instead.
        if (index === viewOrder.length - 1) {
          btn.setAttribute("data-tooltip-align", "right");
        }
      }
    });

    switcher.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled")) return;

        state.currentView = btn.dataset.view;
        update();
        ctx.renderList();
      });
    });

    update();
  }

  function update() {
    const switcher = els.viewSwitcherEl;

    const activeIndex = Math.max(0, viewOrder.indexOf(state.currentView));
    switcher.style.setProperty("--view-index", activeIndex);

    switcher.querySelectorAll(".view-btn").forEach((btn) => {
      const isActive = btn.dataset.view === state.currentView;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  return { render, update };
}
