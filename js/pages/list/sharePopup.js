// ─── sharePopup.js — "Share" button → popup (live name input + preview +
// Download / Copy / Share actions — Download and Share capture the preview
// card to a PNG, Copy just copies the list as plain text) ────────────────────

import { savePng, shareImage } from "../../platform.js";
import { copyTextToClipboard } from "../../utils/clipboard.js";
import { buildFileName } from "../../utils/format.js";
import { STORAGE_KEYS } from "../../constants.js";
import { createPopup } from "../../common/popup.js";
import { initInputValidation } from "../../common/input.js";
import { showSnackbar } from "../../common/snackbar.js";
import { renderSharePopup } from "./views/sharePopupView.js";

export function createSharePopup(ctx) {
  const { page, state, els } = ctx;

  els.sharePopupEl.innerHTML = renderSharePopup();

  const nameInputEl = document.getElementById("share-name-input");
  const downloadBtn = document.getElementById("popup-download-btn");
  const shareBtn = document.getElementById("popup-share-btn");
  const copyBtn = document.getElementById("popup-copy-btn");
  initInputValidation(nameInputEl);

  // Backing out of the popup (X icon / clicking outside it) doesn't need any
  // extra cleanup — nothing is "in progress" until an action button is
  // pressed, and state.isExporting only guards against double-firing that.
  const popup = createPopup({ containerEl: els.sharePopupEl });

  function openPopup() {
    if (!ctx.hasSelectedItems()) {
      showSnackbar("Select items first", { variant: "error" });
      return;
    }
    nameInputEl.value = state.personName;
    popup.open({ focus: nameInputEl });
  }

  /** Validates the name field (showing the same red-border error as every
   * other input) and, if valid, saves it and re-renders the live preview. */
  function commitName() {
    if (!nameInputEl.reportValidity()) return null;

    const name = nameInputEl.value.trim();
    state.personName = name;
    localStorage.setItem(STORAGE_KEYS.PERSON_NAME, name);
    return name;
  }

  /** Shared by all three action buttons: validate the name, then run the
   * actual export — guarding against double-firing while one is already in
   * progress. The popup stays open afterwards so more than one action can
   * be run against the same list without reopening it. */
  async function runAction(perform) {
    if (state.isExporting) return;
    if (commitName() === null) return;

    state.isExporting = true;

    try {
      await perform();
    } catch (error) {
      console.error("Export failed:", error);
      showSnackbar("Something went wrong.", { variant: "error" });
    } finally {
      state.isExporting = false;
    }
  }

  /** Captures the preview card to a PNG data URL — used by Download/Share,
   * not Copy (which copies the list as text instead). */
  async function captureImage() {
    const downloadPicEl = document.getElementById("download-pic");
    downloadPicEl.scrollIntoView({ block: "nearest" });

    const canvas = await html2canvas(downloadPicEl);
    return canvas.toDataURL("image/png");
  }

  function init() {
    // Share (primary, accent circle) and Preview (in the nav pill) are two
    // entry points into the same popup — one for "send this now", one for
    // "let me check the list first" — not two different destinations.
    els.shareBtnEl.addEventListener("click", openPopup);
    els.previewBtnEl.addEventListener("click", openPopup);

    // Live-bind: the name shown on the preview card updates as you type.
    nameInputEl.addEventListener("input", () => {
      state.personName = nameInputEl.value;
      ctx.updateDownloadPreview();
    });

    downloadBtn.addEventListener("click", () =>
      runAction(async () => savePng(await captureImage(), buildFileName(page.id)))
    );

    shareBtn.addEventListener("click", () =>
      runAction(async () => shareImage(await captureImage(), buildFileName(page.id)))
    );

    copyBtn.addEventListener("click", () =>
      runAction(() => copyTextToClipboard(ctx.buildShareText()))
    );
  }

  return { init };
}
