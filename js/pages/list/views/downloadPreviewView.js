// ─── downloadPreviewView.js — markup for the selected-items preview card ────

import { createPillToggle } from "../../../common/checkbox.js";
import { getDisplayName, resolveItemImage } from "../../../utils/itemDisplay.js";

export function renderShowImagesToggle(showDownloadImages) {
  return `<div class="show-images-download-div">${createPillToggle({ id: "show-images-download-toggle", checked: showDownloadImages, label: "Show Images" })}</div>`;
}

export function renderDownloadItemRow({ item, counter, amount, page, state }) {
  const { hasImage, imageSrc } = resolveItemImage(page, item);
  const imageClass = hasImage ? "" : "fallback-image";
  const imageHtml = state.hasImages && state.showDownloadImages
    ? `<img src="${imageSrc}" alt="${item.name}" class="${imageClass}">`
    : "";

  const imageContainerHtml = imageHtml
    ? `<div class="item-image-container">${imageHtml}</div>`
    : "";

  const displayName = getDisplayName(item, state.showGujarati);

  return `
    <span class="item-number">${counter}</span>
    ${imageContainerHtml}
    <span class="item-name">
      ${displayName} <span class="item-price-tag">(₹${item.price})</span> :
      <span class="item-amount">${amount}</span>
    </span>
    <span class="item-price">₹${item.price * amount}</span>`;
}
