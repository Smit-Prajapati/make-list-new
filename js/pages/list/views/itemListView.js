// ─── itemListView.js — markup for one item row, across all view modes ───────

import { createCheckbox } from "../../../common/checkbox.js";
import { getDisplayName, resolveItemImage } from "../../../utils/itemDisplay.js";
import { views, amountControlLayouts } from "../viewModes.js";

function renderItemText(item, state) {
  const displayName = getDisplayName(item, state.showGujarati);

  return `
    <div class="text">
      <span class="item-display-name">${displayName}</span>
      <span class="item-price-tag">(₹${item.price})</span>
    </div>`;
}

function renderItemImage(item, page, state) {
  // If this page has at least one real image, items without their own
  // image use the page logo as a subtle grayscale fallback.
  if (!state.hasImages) return "";

  const { hasImage, imageSrc } = resolveItemImage(page, item);
  const imageClass = hasImage ? "item-image" : "item-image fallback-image";

  return `
    <div class="item-image-container">
      <img src="${imageSrc}" alt="${item.name}" class="${imageClass}">
    </div>`;
}

export function renderItemRow(item, page, state) {
  const checkboxHtml = createCheckbox({ name: "checkbox", value: item.id, extraClass: "item-checkbox" });
  const view = views[state.currentView];
  const controlsHtml = amountControlLayouts[view.controls]();

  return view.layout(checkboxHtml, renderItemImage(item, page, state), renderItemText(item, state), controlsHtml);
}
