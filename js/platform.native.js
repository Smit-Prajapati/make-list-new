// ─── platform.native.js — ANDROID / Capacitor implementation ────────────────
//
// This file is aliased over platform.js by the esbuild Android build script.
// It is NEVER loaded directly by a browser.

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { App } from "@capacitor/app";
import { showSnackbar } from "./common/snackbar.js";
import { closeTopPopup } from "./common/popup.js";

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

  showSnackbar("Image saved successfully.", { variant: "success" });
}

/**
 * Share a PNG through Android's native share sheet (WhatsApp, etc).
 *
 * Native implementation: writes the file to the cache directory, then hands
 * its file:// URI to the Capacitor Share plugin.
 *
 * @param {string} dataUrl   — canvas.toDataURL("image/png") result
 * @param {string} fileName  — desired file name (e.g. "gokul_20_09_2026.png")
 */
export async function shareImage(dataUrl, fileName) {
  const base64Data = dataUrl.split(",")[1];

  await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Cache,
  });

  const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });

  try {
    await Share.share({ url: uri });
  } catch (error) {
    if (error.message?.toLowerCase().includes("cancel")) return; // user dismissed the share sheet
    throw error;
  }
}

export function setupBackButton({ fallbackUrl } = {}) {
  if (!isNative) return;

  App.addListener("backButton", () => {
    // If a popup is open, close it and swallow the back event.
    if (closeTopPopup()) return;

    if (fallbackUrl) {
      // Replace the list entry so Android Back from Home exits instead of
      // returning to the list page that was just left.
      window.location.replace(fallbackUrl);
    } else {
      App.exitApp();
    }
  });
}
