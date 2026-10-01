// ─── addItemPopup.js — "Add item" floating button + popup form ──────────────

import { createPopup } from "../../common/popup.js";
import { initInputValidation } from "../../common/input.js";
import { renderAddItemForm } from "./views/addItemPopupView.js";

export function createAddItemPopup(ctx) {
  const { state, els } = ctx;

  els.addItemPopupEl.innerHTML = renderAddItemForm();

  const formEl = document.getElementById("add-item-form");
  const nameInp = document.getElementById("form-name-input");
  const priceInp = document.getElementById("form-price-input");
  initInputValidation(nameInp);
  initInputValidation(priceInp);

  const popup = createPopup({ containerEl: els.addItemPopupEl });

  function init() {
    els.addItemBtnEl.addEventListener("click", () => {
      popup.open({ focus: nameInp });
    });

    formEl.addEventListener("submit", (e) => {
      e.preventDefault();

      const newItem = {
        id: `temp_${Date.now()}`,
        tabId: state.activeTab, // add to currently visible tab
        name: nameInp.value.trim(),
        gujarati: null,
        price: parseFloat(priceInp.value) || 0,
        imageUrl: null,
      };

      state.tempItems.push(newItem);
      ctx.renderList();

      nameInp.value = "";
      priceInp.value = "";
      popup.close();
    });
  }

  return { init };
}
