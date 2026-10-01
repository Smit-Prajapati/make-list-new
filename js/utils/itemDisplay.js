// ─── itemDisplay.js — item name/image resolution shared by the item list ───
// and the download preview, so the two don't duplicate the same logic.

/** Gujarati name when toggled on and available, else the English name. */
export function getDisplayName(item, showGujarati) {
  return showGujarati && item.gujarati ? item.gujarati : item.name;
}

/**
 * Resolves an item's image source, falling back to the page logo when the
 * item has no image of its own. Callers pick their own CSS class for the
 * fallback case since the item list and download preview style it differently.
 */
export function resolveItemImage(page, item) {
  const hasImage = Boolean(item.imageUrl && item.imageUrl.trim() !== "");
  const imageSrc = hasImage ? `${page.imageFolder}${item.imageUrl}` : page.logoUrl;
  return { hasImage, imageSrc };
}
