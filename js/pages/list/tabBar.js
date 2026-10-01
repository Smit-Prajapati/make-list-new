// ─── tabBar.js — per-page category tabs (e.g. "₹5 Items") ───────────────────

import { renderTabBar } from "./views/tabBarView.js";

export function createTabBar(ctx) {
  const { page, state, els } = ctx;

  function getTabSelectedCount(tabId) {
    let count = 0;
    const allItems = [...page.items, ...state.tempItems];
    allItems.forEach((item) => {
      if (item.tabId !== tabId) return;
      const itemState = state.selectionState[item.id];
      if (itemState && itemState.checked) {
        const amount = parseFloat(itemState.amount) || 0;
        if (amount > 0) count += 1;
      }
    });
    return count;
  }

  function render() {
    if (!state.hasTabs) return;

    els.tabBarEl.style.display = "flex";
    els.tabBarEl.innerHTML = renderTabBar({ page, state, getTabSelectedCount });

    els.tabBarEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeTab = btn.dataset.tab;

        // Update active styling
        els.tabBarEl.querySelectorAll(".tab-btn").forEach((b) =>
          b.classList.toggle("active", b.dataset.tab === state.activeTab)
        );

        ctx.renderList(); // re-render with new tab's items (state preserved)
      });
    });
  }

  return { render };
}
