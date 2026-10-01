// ─── snackbar.js — brief, non-blocking status messages ──────────────────────
// Used instead of alert() for things like "Select items first" or a download
// success/failure notice. Expects a `#snackbar-container` element in the page.

import { CLOSE_ICON } from "../utils/svgIcons.js";

const DEFAULT_DURATION = 3000;

export function showSnackbar(message, { variant = "default", duration = DEFAULT_DURATION } = {}) {
  const container = document.getElementById("snackbar-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = variant === "default" ? "snackbar" : `snackbar snackbar-${variant}`;

  const messageEl = document.createElement("span");
  messageEl.className = "snackbar-message";
  messageEl.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "snackbar-close-button";
  closeBtn.setAttribute("aria-label", "Dismiss");
  closeBtn.innerHTML = CLOSE_ICON;

  toast.append(messageEl, closeBtn);
  container.appendChild(toast);

  const hideTimeout = setTimeout(hide, duration);
  closeBtn.addEventListener("click", hide);

  requestAnimationFrame(() => toast.classList.add("visible"));

  function hide() {
    clearTimeout(hideTimeout);
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }
}
