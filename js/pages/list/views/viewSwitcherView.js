// ─── viewSwitcherView.js — markup for the list/card/grid2 switcher ──────────

import { views, viewOrder } from "../viewModes.js";

export function renderViewSwitcher() {
  const buttonsHtml = viewOrder
    .map((id) => `
      <button type="button" class="view-btn" data-view="${id}" aria-label="${views[id].label}">
        ${views[id].icon}
      </button>`)
    .join("");

  return `<span class="view-switcher-indicator" aria-hidden="true"></span>${buttonsHtml}`;
}
