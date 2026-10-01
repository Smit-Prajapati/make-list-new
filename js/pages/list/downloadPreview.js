// ─── downloadPreview.js — the selected-items preview card that gets
// captured to PNG on download ─────────────────────────────────────────────

import { formatDate } from "../../utils/format.js";
import { getDisplayName } from "../../utils/itemDisplay.js";
import { renderShowImagesToggle, renderDownloadItemRow } from "./views/downloadPreviewView.js";

export function createDownloadPreview(ctx) {
  const { page, state } = ctx;

  /** Every item that's checked with an amount > 0, across ALL tabs. */
  function getSelectedItems() {
    const allItems = [...page.items, ...state.tempItems];
    return allItems.filter((item) => {
      const itemState = state.selectionState[item.id];
      if (!itemState || !itemState.checked) return false;
      const amount = parseFloat(itemState.amount) || 0;
      return amount > 0;
    });
  }

  function hasSelectedItems() {
    return getSelectedItems().length > 0;
  }

  /** Plain-text version of the same list shown in the preview card, for the
   * Copy action. */
  function buildShareText() {
    const selectedItems = getSelectedItems();
    const lines = [page.name.toUpperCase(), `${state.personName} ${formatDate()}`, ""];

    let totalItems = 0;
    let totalPrice = 0;

    selectedItems.forEach((item, index) => {
      const itemState = state.selectionState[item.id];
      const amount = parseFloat(itemState.amount) || 0;
      const displayName = getDisplayName(item, state.showGujarati);

      lines.push(`${index + 1}. ${displayName} (₹${item.price}) x${amount} = ₹${item.price * amount}`);
      totalItems += amount;
      totalPrice += item.price * amount;
    });

    lines.push("", `Total items: ${totalItems}`, `Total: ₹${totalPrice}`);

    return lines.join("\n");
  }

  function render() {
    const listUl = document.getElementById("selected-items-list");
    const totalItemEl = document.getElementById("total-items");
    const totalPriceEl = document.getElementById("total-price");
    const logoImgEl = document.getElementById("company-logo-in-list");
    const companyNameEl = document.getElementById("company-name");
    const personNameEl = document.getElementById("person-name");
    const dateEl = document.getElementById("date");
    const showImagesDownloadContainerEl = document.getElementById("show-images-download-container");
    const previewBtnEl = document.getElementById("preview-button");

    logoImgEl.src = page.logoUrl;
    companyNameEl.textContent = page.name.toUpperCase();
    personNameEl.textContent = state.personName;
    dateEl.textContent = formatDate();

    // Show Images toggle (only if page has images). Only create once, then
    // update checkbox state.
    if (state.hasImages) {
      if (!document.getElementById("show-images-download-toggle")) {
        showImagesDownloadContainerEl.innerHTML = renderShowImagesToggle(state.showDownloadImages);

        const showImagesDownloadToggle = document.getElementById("show-images-download-toggle");
        showImagesDownloadToggle.addEventListener("change", function () {
          state.showDownloadImages = this.checked;
          render();
        });
      } else {
        // Just update the checkbox state
        document.getElementById("show-images-download-toggle").checked = state.showDownloadImages;
      }
    }

    const selectedItems = getSelectedItems();

    listUl.innerHTML = "";
    let totalItems = 0;
    let totalPrice = 0;

    selectedItems.forEach((item, index) => {
      const itemState = state.selectionState[item.id];
      const amount = parseFloat(itemState.amount) || 0;
      const counter = index + 1;

      const li = document.createElement("li");
      li.innerHTML = renderDownloadItemRow({ item, counter, amount, page, state });

      // Add dark grey background to last item
      if (counter === selectedItems.length) {
        li.classList.add("last-item");
      }

      totalItems += amount;
      totalPrice += item.price * amount;
      listUl.appendChild(li);
    });

    totalItemEl.textContent = `Total items : ${totalItems}`;
    totalPriceEl.textContent = `₹${totalPrice}`;
    previewBtnEl.setAttribute("data-badge", totalItems > 0 ? totalItems : "");
  }

  return { render, hasSelectedItems, buildShareText };
}
