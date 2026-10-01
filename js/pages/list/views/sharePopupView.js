// ─── sharePopupView.js — markup for the Share popup: name input, show-images
// toggle, the exported-image preview card, and the fixed action row ─────────

import { createPopupCloseButton } from "../../../common/popup.js";
import { createInputField } from "../../../common/input.js";
import { DOWNLOAD_ICON, SHARE_ICON, COPY_ICON } from "../../../utils/svgIcons.js";

export function renderSharePopup() {
  return `
    <div class="form share-popup-form">
      ${createPopupCloseButton()}
      <h1>Share List</h1>

      <div class="share-popup-scroll">
        <div class="show-images-download-container" id="show-images-download-container"></div>

        <div class="download-pic" id="download-pic">
          <div class="inner-div">
            <div class="top-bar">
              <div class="company-details">
                <div class="image-container">
                  <img src="" alt="logo" id="company-logo-in-list">
                </div>
                <span id="company-name"></span>
              </div>
              <div class="details">
                <p class="person-name" id="person-name"></p>
                <p class="date" id="date"></p>
              </div>
            </div>

            <ul id="selected-items-list" class="selected-items-list"></ul>
            <div class="bottom-bar">
              <span class="total-items" id="total-items">Total Items : 0</span>
              <span class="total-price" id="total-price">₹0</span>
            </div>
          </div>
        </div>
      </div>

      <div class="share-popup-bottom">
        ${createInputField({ id: "share-name-input", name: "person-name", label: "Your Name", required: true })}

        <div class="share-popup-actions">
          <button type="button" id="popup-download-btn" class="icon-action-button" title="Download">
            ${DOWNLOAD_ICON}<span>Download</span>
          </button>
          <button type="button" id="popup-copy-btn" class="icon-action-button" title="Copy as text">
            ${COPY_ICON}<span>Copy</span>
          </button>
          <button type="button" id="popup-share-btn" class="icon-action-button icon-action-button-primary" title="Share">
            ${SHARE_ICON}<span>Share</span>
          </button>
        </div>
      </div>
    </div>`;
}
