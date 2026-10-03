// ─── itemList.js — renders item rows for the current tab/view and wires up
// their checkbox / amount controls ───────────────────────────────────────────

import { renderItemRow } from "./views/itemListView.js";
import { initImageLoaders } from "../../common/loader.js";

export function createItemList(ctx) {
  const { page, state, els } = ctx;

  /** Items visible in the current tab (or all items if the page has no tabs) */
  function visibleItems() {
    const base = [...page.items, ...state.tempItems];
    if (!state.hasTabs) return base;
    return base.filter((it) => it.tabId === state.activeTab);
  }

  function createRow(item) {
    const label = document.createElement("label");
    label.dataset.id = item.id;
    label.className = "list-item";
    label.innerHTML = renderItemRow(item, page, state);
    return label;
  }

  function saveRowState(id, cb, numInp) {
    state.selectionState[id] = {
      checked: cb.checked,
      amount: cb.checked ? numInp.value : "",
    };
  }

  function attachRowListeners() {
    els.listContainerEl.querySelectorAll("label[data-id]").forEach((row) => {
      const id = row.dataset.id;
      const cb = row.querySelector("input[type=checkbox]");
      const numInp = row.querySelector("input[type=number]");
      const minusBtn = row.querySelector(".minus-btn");
      const plusBtn = row.querySelector(".plus-btn");

      cb.addEventListener("change", () => {
        if (cb.checked) {
          numInp.value = numInp.value > 0 ? numInp.value : 1;
        } else {
          numInp.value = "";
        }
        saveRowState(id, cb, numInp);
        ctx.updateDownloadPreview();
        ctx.renderTabBar();
      });

      numInp.addEventListener("input", () => {
        const val = parseFloat(numInp.value);
        cb.checked = val > 0;
        saveRowState(id, cb, numInp);
        ctx.updateDownloadPreview();
        ctx.renderTabBar();
      });

      // Plus button: increment by 1
      plusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentVal = parseFloat(numInp.value) || 0;
        numInp.value = currentVal + 1;
        cb.checked = true;
        saveRowState(id, cb, numInp);
        ctx.updateDownloadPreview();
        ctx.renderHeader();
        ctx.renderTabBar();
      });

      // Minus button: decrement by 1 (min 0)
      minusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentVal = parseFloat(numInp.value) || 0;
        const newVal = Math.max(0, currentVal - 1);
        numInp.value = newVal > 0 ? newVal : "";
        cb.checked = newVal > 0;
        saveRowState(id, cb, numInp);
        ctx.updateDownloadPreview();
        ctx.renderTabBar();
      });
    });
  }

  function render() {
    els.listContainerEl.innerHTML = "";
    els.listContainerEl.className = `list-container view-${state.currentView}`;

    visibleItems().forEach((item) => {
      els.listContainerEl.appendChild(createRow(item));
    });

    // Restore state on newly rendered rows
    els.listContainerEl.querySelectorAll("[data-id]").forEach((row) => {
      const id = row.dataset.id;
      const itemState = state.selectionState[id];
      const cb = row.querySelector("input[type=checkbox]");
      const numInp = row.querySelector("input[type=number]");
      if (itemState) {
        cb.checked = itemState.checked;
        numInp.value = itemState.amount ?? "";
      }
    });

    attachRowListeners();
    ctx.updateDownloadPreview();
    // Attach inline spinners to any freshly rendered images
    initImageLoaders(els.listContainerEl);
  }

  return { render };
}
