// ─── state.js — list-page bootstrap and mutable state ───────────────────────

import { pages } from "../../data.js";
import { STORAGE_KEYS } from "../../constants.js";

/**
 * Resolves which page (company/group) this list page should show, from the
 * `?list=` URL param, falling back to the last-selected page in
 * sessionStorage (Capacitor WebViews can drop URL query params during
 * navigation), falling back to the first configured page.
 *
 * Also keeps the URL and sessionStorage canonical, and redirects Home on an
 * unknown `?list=` id. Returns null only when no pages are configured at all.
 */
export function resolvePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedPageId = urlParams.get("list");
  const pageId = requestedPageId || sessionStorage.getItem(STORAGE_KEYS.SELECTED_LIST_ID);
  const selectedPage = pages.find((p) => p.id === pageId);
  const page = selectedPage || pages[0];

  if (!page) return null;

  if (requestedPageId && !pages.some((p) => p.id === requestedPageId)) {
    window.location.replace(new URL("index.html", window.location.href));
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SELECTED_LIST_ID, page.id);
  }

  if (!requestedPageId || requestedPageId !== page.id) {
    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.set("list", page.id);
    window.history.replaceState(null, "", pageUrl);
  }

  return page;
}

/** Fresh mutable state for a resolved page. Selection state is independent of view. */
export function createListState(page) {
  const hasTabs = Boolean(page.tabs && page.tabs.length > 0);

  return {
    hasTabs,
    hasGujarati: page.items.some((it) => it.gujarati),
    hasImages: page.items.some((it) => it.imageUrl),

    // Whether gujarati names are currently shown (initialized from defaultLanguage)
    showGujarati: page.defaultLanguage === "gujarati",
    // Whether images are shown in the selected-items download preview.
    showDownloadImages: true,
    // Current rendering mode.
    currentView: "list",
    // Active tab id (first tab by default, or null when page has no tabs)
    activeTab: hasTabs ? page.tabs[0].id : null,
    // Per-item selection state keyed by item.id → { checked, amount }
    selectionState: {},
    // Temporary items added via the Add-Item popup (appended to current tab)
    tempItems: [],
    // Tracks whether a download/share/copy export is in-progress
    isExporting: false,
    // Cached person name
    personName: localStorage.getItem(STORAGE_KEYS.PERSON_NAME) || "",
  };
}
