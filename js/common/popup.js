// ─── popup.js — reusable modal popup ────────────────────────────────────────

import { CLOSE_ICON } from "../utils/svgIcons.js";

// ── Registry — lets platform back-button handlers close an open popup ─────
// Each createPopup() call pushes { isOpen, dismiss } into this set.
// closeTopPopup() is called by the platform back-button handler before it
// decides whether to navigate away.
const _popupRegistry = new Set();

/**
 * Returns true if at least one popup is currently open, and closes it.
 * The platform back-button handler should call this first; if it returns
 * true, swallow the back event instead of navigating.
 */
export function closeTopPopup() {
  for (const entry of _popupRegistry) {
    if (entry.isOpen()) {
      entry.dismiss();
      return true;
    }
  }
  return false;
}

// Wraps a `.popup-container` element (an empty container in the page markup;
// its content — including a `[data-popup-close]` button — can be rendered
// into it at any time, before or after createPopup() is called, since the
// close/outside-click handling below is delegated on the container itself).
//
// `open()`/`close()` are for the caller (show it; hide it after e.g. a
// successful submit). Dismissing via the X button or an outside click goes
// through `onDismiss` instead, so a caller can tell the two apart — e.g. to
// reset in-progress state only when the user actually backed out.
export function createPopup({ containerEl, onDismiss } = {}) {
  /**
   * @param {{ focus?: HTMLElement }} [options] — an element to focus once
   * the popup is actually open (e.g. its first input).
   */
  function open({ focus } = {}) {
    containerEl.classList.add("open");

    if (focus) {
      // The button that opens the popup also focuses itself by default —
      // that's normal browser behavior for a click. That default focus
      // assignment isn't always finished within a single animation frame,
      // so a focus() call deferred by only one rAF can still lose the race
      // and get silently overridden back to the button right after. Waiting
      // two frames reliably lands after the browser's own focus change.
      requestAnimationFrame(() => requestAnimationFrame(() => focus.focus()));
    }
  }

  function close() {
    containerEl.classList.remove("open");
  }

  function dismiss() {
    close();
    onDismiss?.();
  }

  containerEl.addEventListener("click", (e) => {
    if (e.target === containerEl || e.target.closest("[data-popup-close]")) {
      dismiss();
    }
  });

  // Register so the back-button handler can close this popup instead of
  // navigating away when it fires while the popup is open.
  _popupRegistry.add({ isOpen: () => containerEl.classList.contains("open"), dismiss });

  return { open, close };
}

/** Markup for the X button every popup uses to dismiss itself. */
export function createPopupCloseButton() {
  return `
    <button type="button" class="popup-close-button" data-popup-close aria-label="Close">
      ${CLOSE_ICON}
    </button>`;
}
