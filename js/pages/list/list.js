// ─── list.js — list page entry point ─────────────────────────────────────────
// Resolves the requested page, then wires up the list-page modules against a
// shared `ctx` (page, mutable state, DOM refs, and cross-module render hooks).
// Each module owns one concern; list.js only does the wiring.

import { setupBackButton } from "../../platform.js";
// ^ On web: loads js/platform.js (stub — no Capacitor).
//   Android bundle: esbuild aliases platform.js → platform.native.js at build time.

import { initTooltips } from "../../common/tooltip.js";
import { createLoader } from "../../common/loader.js";
import { resolvePage, createListState } from "./state.js";
import { createHeader } from "./header.js";
import { createTabBar } from "./tabBar.js";
import { createViewSwitcher } from "./viewSwitcher.js";
import { createItemList } from "./itemList.js";
import { createDownloadPreview } from "./downloadPreview.js";
import { createAddItemPopup } from "./addItemPopup.js";
import { createSharePopup } from "./sharePopup.js";

const page = resolvePage();

if (!page) {
  document.body.innerHTML = `<p style="padding:2rem;font-family:sans-serif">
    No list pages are configured. <a href="index.html">Go back</a></p>`;
  throw new Error("No page data is configured");
}

document.addEventListener("DOMContentLoaded", () => {
  const ctx = {
    page,
    state: createListState(page),
    els: {
      headerEl: document.getElementById("topbar"),
      tabBarEl: document.getElementById("tab-bar"),
      viewSwitcherEl: document.getElementById("view-switcher"),
      listContainerEl: document.getElementById("list-container"),
      addItemBtnEl: document.getElementById("add-item-button"),
      addItemPopupEl: document.getElementById("add-item-popup-container"),
      shareBtnEl: document.getElementById("share-button"),
      previewBtnEl: document.getElementById("preview-button"),
      previewBadgeEl: document.getElementById("preview-badge"),
      sharePopupEl: document.getElementById("share-popup-container"),
    },
  };

  // ─── page setup ──────────────────────────────────────────────────────────
  document.title = page.name;
  document.getElementById("favicon").setAttribute("href", page.logoUrl);
  setupBackButton({ fallbackUrl: "index.html" });
  initTooltips();

  // ─── build modules and wire cross-module render hooks onto ctx ───────────
  const header = createHeader(ctx);
  const tabBar = createTabBar(ctx);
  const viewSwitcher = createViewSwitcher(ctx);
  const itemList = createItemList(ctx);
  const downloadPreview = createDownloadPreview(ctx);
  const addItemPopup = createAddItemPopup(ctx);
  const sharePopup = createSharePopup(ctx);

  ctx.renderHeader = header.render;
  ctx.renderTabBar = tabBar.render;
  ctx.renderList = itemList.render;
  ctx.updateDownloadPreview = downloadPreview.render;
  ctx.hasSelectedItems = downloadPreview.hasSelectedItems;
  ctx.buildShareText = downloadPreview.buildShareText;

  addItemPopup.init();
  sharePopup.init();

  // ─── initial render ────────────────────────────────────────────────────
  // Show full-page loader until all rendered content and images are ready
  const loader = createLoader();
  loader.show();

  ctx.renderHeader();
  ctx.renderTabBar();
  viewSwitcher.render();
  ctx.renderList();

  // Hide as soon as list images and header icons have loaded
  loader.hideWhenImagesLoaded(document);
});
