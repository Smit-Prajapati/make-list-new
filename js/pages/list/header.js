// ─── header.js — back button, logo, gujarati toggle ──────────────────────────

import { renderHeader } from "./views/headerView.js";

export function createHeader(ctx) {
  const { page, state, els } = ctx;

  function render() {
    els.headerEl.innerHTML = renderHeader({ page, state });

    if (state.hasGujarati) {
      document.getElementById("gujarati-toggle").addEventListener("change", function () {
        state.showGujarati = this.checked;
        ctx.renderList(); // re-render preserving state
      });
    }
  }

  return { render };
}
