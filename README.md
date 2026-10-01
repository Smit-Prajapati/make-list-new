# Make List App

A data-driven checklist/order-sheet builder: pick a company (Gokul, Real,
Balaji, ...), check off items and quantities, then preview, download, copy,
or share the resulting list. Web-first, with an Android build via Capacitor
(`js/platform.js` / `js/platform.native.js` hold the parts that differ
between the two — see "Web-first and Android workflow" below).

_See `docs/` for the project's older, pre-restructure changelog notes._

## ✅ Completed Features

### 1. **Data-Driven Architecture**
- **Single source of truth:** `data.js` contains all pages, tabs, items, prices, and gujarati translations
- **Automatic mapping:** Changes in data.js automatically reflect on:
  - Home page cards
  - Tab bar on list pages
  - Item lists (filtered by active tab)
  - Gujarati toggle (only shown when gujarati names exist in data)
  - Download image

### 2. **Tab System**
- Pages can define multiple tabs (e.g., "₹5 Items", "₹10 Items")
- Each item belongs to a tab via `tabId`
- Clicking a tab filters the visible items
- **Selected items persist** when switching between tabs
- Pages without tabs (like Balaji) show all items at once

### 3. **Item Display**
- Each item shows: **Name (Rupees)**
- Example: "Ratlami sev (₹51)"
- Price is calculated: `item.price` in data (where price = quantity_per_pack × price_per_unit)
- Clean, readable format in both list and download views

### 4. **Gujarati Toggle**
- Only shown when at least one item has a `gujarati` field in data
- Switches item names between English and Gujarati
- Persists across tab switches
- Works in both the list view and download preview

### 5. **Checkbox + Count System**
- When checkbox is checked → count defaults to 1
- When user enters count > 0 → checkbox auto-checks
- When count is 0 or empty → checkbox unchecks
- Visual feedback: accent-colored border when checked (derived from `$accent` in `style.scss`, so it re-themes with the rest of the app)

### 6. **Preview & Share**
- **Preview** (in the bottom nav pill) and **Share** (the accent-colored circle) open the same popup — Preview for "let me check the list first", Share for "send it now"
- The popup shows: your name (live-updates the preview as you type), a Show Images toggle, and the same preview card described above (logo, person name, date, selected items across **all tabs**, totals)
- Three actions, always available without closing the popup:
  - **Download** — saves the preview card as a PNG (via `html2canvas`)
  - **Copy** — copies the list as **plain text** (item names, quantities, prices, totals) to the clipboard — no image involved
  - **Share** — hands the same PNG to the OS share sheet (Web Share API on the web, Capacitor's Share plugin on Android) so it can go straight to WhatsApp etc.; falls back to a plain download where file-sharing isn't supported

### 7. **Add Item (Temporary)**
- "+" button to add custom items on-the-fly
- Added items belong to the currently active tab
- Temporary items are not saved to data.js (session-only)
- Useful for one-off items during list creation

### 8. **Better Code Structure**
- Modular, readable JavaScript
- State management via `selectionState` object
- Clear separation of concerns (render / state / events)
- No hardcoded data in JS — everything from data.js

## 📁 File Structure

```
make-list-new/
├── index.html              — Home page (cards auto-generated)
├── list.html               — List page (tabs + checkboxes + download)
├── package.json            — only used to rebuild css/style.css from the .scss
├── js/
│   ├── data.js             — All pages, tabs, items, prices, gujarati names
│   ├── constants.js        — shared storage-key constants
│   ├── platform.js         — web platform shim (savePng, back button)
│   ├── platform.native.js  — Capacitor/Android platform shim (same API)
│   ├── common/              — reusable UI primitives, used by any page
│   │   ├── checkbox.js      — plain checkbox + labeled pill toggle
│   │   ├── input.js         — floating-label input field + validation
│   │   ├── popup.js         — modal popup (X-close, click-outside-to-close)
│   │   ├── snackbar.js      — toast notifications
│   │   └── tooltip.js       — hover (desktop) / tap (mobile) tooltips
│   ├── utils/                — small, state-free helpers
│   │   ├── svgIcons.js
│   │   ├── format.js
│   │   └── itemDisplay.js
│   └── pages/                — one folder per page; nothing outside pages/
│       │                        is page-specific
│       ├── home/
│       │   ├── home.js       — entry point: builds nav cards from data.js
│       │   └── views/
│       │       └── homeView.js
│       └── list/
│           ├── list.js       — entry point: resolves the page and wires
│           │                    the modules below together
│           ├── state.js      — resolves the page, holds mutable list state
│           ├── viewModes.js  — the view-mode registry (list / card / grid2)
│           ├── header.js     — back button, logo, gujarati toggle
│           ├── tabBar.js
│           ├── viewSwitcher.js
│           ├── itemList.js
│           ├── downloadPreview.js  — computes/renders the selected-items
│           │                         preview card shown inside the share popup
│           ├── addItemPopup.js
│           ├── sharePopup.js — Share button → popup (live name input +
│           │                   preview + Download/Share/Copy actions)
│           └── views/        — markup for each module above (pure functions,
│               │                no state or event wiring)
│               ├── headerView.js
│               ├── tabBarView.js
│               ├── viewSwitcherView.js
│               ├── itemListView.js
│               ├── downloadPreviewView.js
│               ├── addItemPopupView.js
│               └── sharePopupView.js
├── css/
│   ├── style.scss     — source of truth for styling (edit this)
│   └── style.css      — compiled output, this is what the HTML links to
├── assets/            — Logo images and item thumbnails
└── docs/              — dev notes + a standalone test/checklist page
```

Each list-page module (e.g. `header.js`) owns its DOM refs, state and event
wiring; its markup lives in the matching `views/*View.js` file as a plain
function that takes data and returns an HTML string — no DOM access, no
event listeners. Adding a new view mode (beyond list/card/grid2) still means
adding one entry to `js/pages/list/viewModes.js` — nothing in `itemList.js`
or `viewSwitcher.js` needs to change.

> Previously `style.scss` had drifted out of sync with `style.css` (several
> rules — the tab bar, +/- amount buttons, show-images toggle — existed only
> in the compiled `style.css`, hand-added, and were missing from the `.scss`
> source). They're now back in sync. If you ever edit `style.scss`, rebuild
> with:
> ```
> npm install
> npm run build:css
> ```

## 🎨 Design

- One accent color drives every interactive element (checkmarks, active tab, the primary Share button) — change `$accent` in `style.scss` and the whole app re-themes
- Pink/yellow/blue card variants on the home page, independent of the accent color
- Bottom nav: an Add + Preview pill alongside the primary, accent-filled Share button, both centered as one group
- Every popup (Add Item, Share) shares the same premium-card look: X-close, click-outside-to-close, capped at the app's 450px column width
- Responsive 450px container throughout

## 🔧 How to Modify Data

### Add a new page:
```javascript
{
  id: "newbrand",
  name: "New Brand",
  logoUrl: "assets/images/newbrand.png",
  cardVariant: "variant-1",  // or variant-2, variant-3
  tabs: [
    { id: "category1", label: "Category 1" }
  ],
  items: [ /* ... */ ]
}
```

### Add a new tab to existing page:
```javascript
tabs: [
  { id: "5", label: "₹5 Items" },
  { id: "10", label: "₹10 Items" },
  { id: "bulk", label: "Bulk Items" }  // ← new tab
]
```

### Add items:
```javascript
{
  id: 99,
  tabId: "5",           // which tab it belongs to (or null if no tabs)
  name: "Item Name",
  gujarati: "ગુજરાતી નામ",  // or null if no gujarati name
  price: 51,            // total price (quantity × unit price)
  imageUrl: "image.png" // or null if no image
}
```

### Remove gujarati toggle:
Just set `gujarati: null` for all items on that page.

### Remove tabs:
Set `tabs: []` for that page — all items will display at once.

## 🚀 Testing

Open `index.html` in a browser:
1. ✅ Home page shows 3 cards (Gokul, Real, Balaji)
2. ✅ Click "Real" → tabs appear ("₹5 Items", "₹10 Items")
3. ✅ Click "₹10 Items" tab → list shows only ₹10 items
4. ✅ Check some items, enter counts
5. ✅ Switch to "₹5 Items" → previous selections preserved
6. ✅ Toggle gujarati → names change
7. ✅ Click **Preview** or the accent **Share** circle → popup opens showing selected items; typing a name updates the preview live
8. ✅ Inside that popup, try **Download** (PNG saves), **Copy** (plain-text list copied to clipboard), and **Share** (OS share sheet / fallback download) — the popup stays open after each so you can try more than one
9. ✅ Click "Add" → add custom item → appears in current tab

## ✨ Highlights

1. **No hardcoded lists** — everything from data.js
2. **Tab system** — filter items by category, selections persist
3. **Price display** — clear "(₹XX)" next to each item
4. **Smart gujarati toggle** — only shown when needed
5. **Better state management** — selections preserved across tab switches
6. **Cleaner code** — modular, maintainable, well-commented

---

## Web-first and Android workflow

`index.html`, `list.html`, `css/`, `js/`, and `assets/` are the source files.
Always make and test a feature change there first. Do not edit `www/` directly:
it is a generated copy for Capacitor and will be replaced on the next build.

1. Make the change in the web source files and test it in a browser.
2. For stylesheet-only changes, run:

   ```powershell
   npm run build:css
   ```

3. After any change that should appear in the Android app, run:

   ```powershell
   npm run build:android
   ```

   This rebuilds CSS, copies the web source and shared `assets/` into `www/`,
   bundles the Android JavaScript, and syncs the result to the Android project.
4. Test the Android app. If the normal web code does not work in Capacitor,
   add the required native-specific behavior in `js/platform.native.js` while
   retaining the browser version in `js/platform.js`. Keep the shared feature
   logic in the regular web files whenever possible.

**Ready to use!** Just edit `data.js` to add/remove pages, tabs, or items.
