// ─── addItemPopupView.js — markup for the "Add item" popup form ─────────────

import { createPopupCloseButton } from "../../../common/popup.js";
import { createInputField } from "../../../common/input.js";

export function renderAddItemForm() {
  return `
    <form id="add-item-form" class="add-item-form form">
      ${createPopupCloseButton()}
      <h1>Add Item</h1>
      ${createInputField({ id: "form-name-input", label: "Item Name", required: true })}
      ${createInputField({ id: "form-price-input", label: "Price", type: "number", required: true })}
      <div class="button-container">
        <input type="submit" id="submit-item-button" class="submit-button" value="ADD">
      </div>
    </form>`;
}
