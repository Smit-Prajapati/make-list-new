// ─── platform.native.js — ANDROID / Capacitor implementation ────────────────
//
// This file is aliased over platform.js by the esbuild Android build script.
// It is NEVER loaded directly by a browser.

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { App } from "@capacitor/app"; 

/** True when running inside a Capacitor native shell. */
export const isNative = Capacitor.isNativePlatform();

/**
 * Save a PNG to the device.
 *
 * Native implementation: writes the file to the Documents directory via the
 * Capacitor Filesystem plugin and shows a success alert.
 *
 * @param {string} dataUrl   — canvas.toDataURL("image/png") result
 * @param {string} fileName  — desired file name (e.g. "gokul_20_09_2026.png")
 */
export async function savePng(dataUrl, fileName) {
  const base64Data = dataUrl.split(",")[1];

  await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Documents,
  });

  alert("Image saved successfully ❤️");
}

export function setupBackButton({ fallbackUrl } = {}) {
  if (!isNative) return;

  App.addListener("backButton", () => {
    if (fallbackUrl) {
      // Replace the list entry so Android Back from Home exits instead of
      // returning to the list page that was just left.
      window.location.replace(fallbackUrl);
    } else {
      App.exitApp();
    }
  });
}
