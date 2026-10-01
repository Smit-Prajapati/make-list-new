// ─── tabBarView.js — markup for the per-page category tabs ──────────────────

export function renderTabBar({ page, state, getTabSelectedCount }) {
  return page.tabs
    .map((tab) => {
      const tabCount = getTabSelectedCount(tab.id);
      const countBadgeHtml = tabCount > 0
        ? `<span class="tab-count-badge">${tabCount}</span>`
        : "";
      return `<button class="tab-btn ${tab.id === state.activeTab ? "active" : ""}"
                 data-tab="${tab.id}">
                 ${tab.label}
                 ${countBadgeHtml}
              </button>`;
    })
    .join("");
}
