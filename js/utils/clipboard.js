// ─── clipboard.js — copy the list as plain text ──────────────────────────────
// The Clipboard API behaves identically on the web and inside a Capacitor
// Android webview, so this needs no platform.js split — one implementation
// covers both.

import { showSnackbar } from "../common/snackbar.js";

export async function copyTextToClipboard(text) {
  if (!navigator.clipboard?.writeText) {
    showSnackbar("Copy not supported in this browser.", { variant: "error" });
    return;
  }

  await navigator.clipboard.writeText(text);

  showSnackbar("Copied to clipboard.", { variant: "success" });
}
