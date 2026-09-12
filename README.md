# Make List App — Refactored Version

_Structure pass: files reorganized into `css/`, `js/`, `images/`, `docs/`
folders; the stale `.scss`/`.css` drift was fixed; two dead/duplicate CSS
rules were removed. No app behavior changed — see `docs/` for the original
feature changelog._

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
- Visual feedback: yellow border when checked

### 6. **Download Image**
- Selected items from **all tabs** appear in download preview
- Shows: item name (with price in brackets), count, total price
- Includes person name and date
- Clean, printable format using html2canvas

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
├── index.html         — Home page (cards auto-generated)
├── list.html          — List page (tabs + checkboxes + download)
├── package.json       — only used to rebuild css/style.css from the .scss
├── js/
│   ├── data.js        — All pages, tabs, items, prices, gujarati names
│   ├── index.js        — Home page script (builds cards from data.js)
│   └── script.js       — List page logic (tabs, selection, download)
├── css/
│   ├── style.scss     — source of truth for styling (edit this)
│   └── style.css      — compiled output, this is what the HTML links to
├── images/            — Logo images and item thumbnails
└── docs/              — dev notes + a standalone test/checklist page
```

> Previously `style.scss` had drifted out of sync with `style.css` (several
> rules — the tab bar, +/- amount buttons, show-images toggle — existed only
> in the compiled `style.css`, hand-added, and were missing from the `.scss`
> source). They're now back in sync. If you ever edit `style.scss`, rebuild
> with:
> ```
> npm install
> npm run build:css
> ```

## 🎨 Design Preserved

- Same color scheme (yellow checkmarks, pink/yellow/blue card variants)
- Same checkbox animation
- Same download preview card style
- Same floating action buttons
- Responsive 450px container

## 🔧 How to Modify Data

### Add a new page:
```javascript
{
  id: "newbrand",
  name: "New Brand",
  logoUrl: "images/newbrand.png",
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
7. ✅ Click download → enter name → image downloads
8. ✅ Click "+" → add custom item → appears in current tab

## ✨ Key Improvements

1. **No hardcoded lists** — everything from data.js
2. **Tab system** — filter items by category, selections persist
3. **Price display** — clear "(₹XX)" next to each item
4. **Smart gujarati toggle** — only shown when needed
5. **Better state management** — selections preserved across tab switches
6. **Cleaner code** — modular, maintainable, well-commented
7. **Same great UI** — familiar look and feel

---

**Ready to use!** Just edit `data.js` to add/remove pages, tabs, or items.
