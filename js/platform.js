// ─── platform.js — WEB stub ─────────────────────────────────────────────────
//
// On the web this file is loaded as-is.  It provides the same API surface as
// platform.native.js so that script.js never needs to branch on Capacitor.
//
// The esbuild Android build aliases this file to platform.native.js, so the
// real Capacitor code lands only in the www/ bundle.

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
}

/**
 * Wire up the hardware/gesture back button.
 * Web implementation: no-op — the browser's own back button already works.
 */
export function setupBackButton(options = {}) {}