// ─── viewModes.js — VIEW MODE REGISTRY ───────────────────────────────────────
// Every view (list / grid2 / card / ...) is one self-contained entry here:
// its button icon, whether it needs item images, which amount-control
// layout it uses, and how to arrange one row's pieces.
//
// This is the whole point of the refactor: adding, removing, or changing a
// view means editing ONE entry in this object — nothing else (createRow,
// renderViewSwitcher, updateViewSwitcher...) needs to change. That's what
// keeps this open for extension but closed for modification.

// Two reusable amount-control layouts. A view just picks one by name
// instead of duplicating the markup.
export const amountControlLayouts = {
  // input first, +/- stacked beside it (used by the dense list view)
  stacked: () => `
    <div class="amount-controls">
      <input type="number" name="amount" step="0.5" min="0" placeholder="0" aria-label="Amount">
      <div class="button-column">
        <button type="button" class="amount-btn plus-btn" aria-label="Increase">+</button>
        <button type="button" class="amount-btn minus-btn" aria-label="Decrease">−</button>
      </div>
    </div>`,
  // −, input, + side by side (used by the roomier card layouts)
  row: () => `
    <div class="amount-controls">
      <button type="button" class="amount-btn minus-btn" aria-label="Decrease">−</button>
      <input type="number" name="amount" step="0.5" min="0" placeholder="0" aria-label="Amount">
      <button type="button" class="amount-btn plus-btn" aria-label="Increase">+</button>
    </div>`,
};

export const views = {
  list: {
    label: "List view",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M21 7.5H3"/><path d="M21 12H3"/><path d="M21 16.5H3"/></svg>`,
    requiresImages: false,
    controls: "stacked",
    // (checkboxHtml, imageHtml, textHtml, controlsHtml) → row markup
    layout: (checkboxHtml, imageHtml, textHtml, controlsHtml) => `
      ${checkboxHtml}
      ${imageHtml}
      ${textHtml}
      ${controlsHtml}`,
  },
  card: {
    label: "One column card view",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/></svg>`,
    requiresImages: true,
    controls: "row",
    layout: (checkboxHtml, imageHtml, textHtml, controlsHtml) => `
      ${imageHtml}
      <div class="item-content">
        ${checkboxHtml}
        ${textHtml}
        ${controlsHtml}
      </div>`,
  },
  grid2: {
    label: "Two column view",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="8" height="18" x="2" y="3" rx="1"/>
      <rect width="8" height="18" x="14" y="3" rx="1"/></svg>`,
    requiresImages: true,
    controls: "row",
    layout: (checkboxHtml, imageHtml, textHtml, controlsHtml) => `
      ${imageHtml}
      <div class="item-content">
        ${checkboxHtml}
        ${textHtml}
      </div>
      ${controlsHtml}`,
  },
};

// Button order in the switcher — add a view above and its id here.
export const viewOrder = Object.keys(views);
