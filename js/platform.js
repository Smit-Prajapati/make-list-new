// ─── platform.js — WEB stub ─────────────────────────────────────────────────
//
// On the web this file is loaded as-is. It provides the same API surface as
// platform.native.js so the page entry files (list.js, home.js) never need
// to branch on Capacitor.
//
// The esbuild Android build aliases this file to platform.native.js, so the
// real Capacitor code lands only in the www/ bundle.

import { showSnackbar } from "./common/snackbar.js";
import { closeTopPopup } from "./common/popup.js";

/** Always false in a plain browser; overridden to true in the native build. */
export const isNative = false;

/**
 * Save a PNG to the device.
 *
 * Web implementation: triggers a normal <a download> click.
 *
 * @param {string} dataUrl   — canvas.toDataURL("image/png") result
 * @param {string} fileName  — desired file name (e.g. "gokul_20_09_2026.png")
 */
export async function savePng(dataUrl, fileName) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();

  showSnackbar("Image saved successfully.", { variant: "success" });
}

/**
 * Share a PNG through the OS share sheet (WhatsApp, etc).
 *
 * Web implementation: the Web Share API's file-sharing (only supported on
 * some browsers, mainly Chrome on Android). Falls back to a plain download
 * when the browser can't share files at all.
 *
 * @param {string} dataUrl   — canvas.toDataURL("image/png") result
 * @param {string} fileName  — desired file name (e.g. "gokul_20_09_2026.png")
 */
export async function shareImage(dataUrl, fileName) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], fileName, { type: blob.type });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (error) {
      if (error.name === "AbortError") return; // user dismissed the share sheet
      throw error;
    }
    return;
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();

  showSnackbar("Sharing not supported here — image downloaded instead.", { variant: "default" });
}

/**
 * Wire up the hardware/gesture back button on web.
 *
 * When a popup is open, the browser back gesture / button should close it
 * rather than navigating away. We do this with the History API:
 *  • push a sentinel entry whenever a popup opens (via a MutationObserver
 *    watching for the `.open` class being added to any popup container).
 *  • on `popstate`, if a popup is open, close it and push the sentinel back
 *    so the back stack stays balanced; otherwise let the navigation proceed.
 *
 * The `fallbackUrl` param is unused on web (the browser handles navigation
 * naturally), but kept so callers don't need to branch.
 */
export function setupBackButton({ fallbackUrl } = {}) {
  // Sentinel state pushed/popped to intercept the back gesture.
  const POPUP_STATE = { popup: true };

  // Push a history entry each time any popup opens, so back intercepts it.
  const observer = new MutationObserver(() => {
    const anyOpen = document.querySelector(".popup-container.open");
    if (anyOpen && history.state?.popup !== true) {
      history.pushState(POPUP_STATE, "");
    }
  });
  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });

  window.addEventListener("popstate", (e) => {
    if (closeTopPopup()) {
      // Re-push the sentinel so the history stack stays balanced for the
      // next back gesture (in case another popup is opened afterwards).
      // Don't re-push here — let the MutationObserver do it when the next
      // popup opens, so we don't accumulate stale entries.
    }
    // If no popup was open, the popstate lets the browser navigate normally.
  });
}