import { pages } from "./data.js";
import { savePng, setupBackButton } from "./platform.js";
// ^ On web: loads js/platform.js (stub — no Capacitor).
//   Android bundle: esbuild aliases platform.js → platform.native.js at build time.

// ─────────────────────────── bootstrap ───────────────────────────────────────

const urlParams = new URLSearchParams(window.location.search);
const requestedPageId = urlParams.get("list");
const pageId = requestedPageId || sessionStorage.getItem("selectedListId");
const selectedPage = pages.find((p) => p.id === pageId);
const page = selectedPage || pages[0];

if (!page) {
  document.body.innerHTML = `<p style="padding:2rem;font-family:sans-serif">
    No list pages are configured. <a href="index.html">Go back</a></p>`;
  throw new Error("No page data is configured");
}

// A mistyped URL returns to Home. When Capacitor drops the query parameter,
// use the selection stored by the home-page card click.
if (requestedPageId && !pages.some((p) => p.id === requestedPageId)) {
  window.location.replace(new URL("index.html", window.location.href));
} else {
  sessionStorage.setItem("selectedListId", page.id);
}

// Keep the address bar canonical, including after the native fallback above.
if (!requestedPageId || requestedPageId !== page.id) {
  const pageUrl = new URL(window.location.href);
  pageUrl.searchParams.set("list", page.id);
  window.history.replaceState(null, "", pageUrl);
}

const hasTabs = page.tabs && page.tabs.length > 0;
const hasGujarati = page.items.some((it) => it.gujarati);
const hasImages = page.items.some((it) => it.imageUrl);

// Whether gujarati names are currently shown (initialized from defaultLanguage)
let showGujarati = page.defaultLanguage === "gujarati";
// Whether images are shown in the selected-items download preview.
let showDownloadImages = true;
// Current rendering mode. Selection state is independent from the view.
let currentView = "list";
// Active tab id (first tab by default, or null when page has no tabs)
let activeTab = hasTabs ? page.tabs[0].id : null;
// Per-item selection state keyed by item.id  →  { checked, amount }
const selectionState = {};
// Temporary items added via the Add-Item popup (appended to current tab)
const tempItems = [];
// Tracks whether a download is in-progress
let isDownloading = false;
// Cached person name
let personName = localStorage.getItem("storedPersonName") || "";

// ─────────────────────────── VIEW REGISTRY ───────────────────────────────
// Every view (list / grid2 / card / ...) is one self-contained entry here:
// its button icon, whether it needs item images, which amount-control
// layout it uses, and how to arrange one row's pieces.
//
// This is the whole point of the refactor: adding, removing, or changing a
// view means editing ONE entry in this object — nothing else in the file
// (createRow, renderViewSwitcher, updateViewSwitcher...) needs to change.
// That's what keeps the file open for extension but closed for modification.

// Two reusable amount-control layouts. A view just picks one by name
// instead of duplicating the markup.
const amountControlLayouts = {
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

const views = {
  list: {
    label: "List view",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      class="preview-icon"><rect width="18" height="18" x="3" y="3" rx="2"/>
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
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
      class="lucide lucide-rows-2 preview-icon"><rect width="18" height="18" x="3" y="3" rx="2"
      /><path d="M3 12h18"/></svg>`,
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
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      class="preview-icon"><rect width="8" height="18" x="2" y="3" rx="1"/>
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
const viewOrder = Object.keys(views);

// ─────────────────────────── DOM refs ────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const favicon = document.getElementById("favicon");
  const topbarEl = document.getElementById("topbar");
  const tabBarEl = document.getElementById("tab-bar");
  const listContainerEl = document.getElementById("list-container");
  const downloadPicEl = document.getElementById("download-pic");
  const addItemBtnEl = document.getElementById("add-item-button");
  const addItemPopupEl = document.getElementById("add-item-popup-container");
  const addItemFormEl = document.getElementById("add-item-form");
  const addItemCancelEl = document.getElementById("add-item-cancel-button");
  const downloadBtnEl = document.getElementById("download-button");
  const personNamePopupEl = document.getElementById("person-name-popup-container");
  const personNameFormEl = document.getElementById("person-name-form");
  const personNameInputEl = document.getElementById("person-name-input");
  const personNameCancelEl = document.getElementById("person-name-cancel-button");

  // ─── page setup ──────────────────────────────────────────────────────────
  document.title = page.name;
  favicon.setAttribute("href", page.logoUrl);
  setupBackButton({ fallbackUrl: "index.html" });

  // ─── render ──────────────────────────────────────────────────────────────
  renderTopbar();
  renderTabBar();
  renderViewSwitcher();
  renderList();

  // ─────────────────────────── TOPBAR ──────────────────────────────────────

  function renderTopbar() {
    // Back button — returns to the home page
    const backHtml = `<a href="index.html" class="back-button" id="back-button" title="Back" aria-label="Back">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  </a>`;

    // Logo
    const logoHtml = `<img src="${page.logoUrl}" alt="${page.name}" id="company-logo">`;
    const gujaratiHtml = hasGujarati
      ? `<div class="gujarati-div">${createCheckboxToggle('gujarati-toggle', showGujarati, 'ગુજરાતી')}</div>`
      : "";
    topbarEl.innerHTML = backHtml + logoHtml + gujaratiHtml;

    if (hasGujarati) {
      document.getElementById("gujarati-toggle").addEventListener("change", function () {
        showGujarati = this.checked;
        renderList(); // re-render preserving state
      });
    }
  }

  function getTabSelectedCount(tabId) {
    let count = 0;
    const allItems = [...page.items, ...tempItems];
    allItems.forEach(item => {
      if (item.tabId !== tabId) return;
      const state = selectionState[item.id];
      if (state && state.checked) {
        const amount = parseFloat(state.amount) || 0;
        if (amount > 0) count += 1;
      }
    });
    return count;
  }

  // ─────────────────────────── TAB BAR ─────────────────────────────────────

  function renderTabBar() {
    if (!hasTabs) return;

    tabBarEl.style.display = "flex";
    tabBarEl.innerHTML = page.tabs
      .map((tab) => {
        const tabCount = getTabSelectedCount(tab.id);
        const countBadgeHtml = tabCount > 0
          ? `<span class="tab-count-badge">${tabCount}</span>`
          : '';
        return `<button class="tab-btn ${tab.id === activeTab ? "active" : ""}"
                   data-tab="${tab.id}">
                   ${tab.label}
                   ${countBadgeHtml}
                </button>`;
      })
      .join("");

    tabBarEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;

        // Update active styling
        tabBarEl.querySelectorAll(".tab-btn").forEach((b) =>
          b.classList.toggle("active", b.dataset.tab === activeTab)
        );

        renderList(); // re-render with new tab's items (state preserved)
      });
    });
  }

  // ─────────────────────────── VIEW SWITCHER ────────────────────────────────

  function renderViewSwitcher() {
    const tabBar = document.getElementById("tab-bar");
    if (!tabBar) return;

    let switcher = document.getElementById("view-switcher");
    if (switcher) return; // built once; state changes go through updateViewSwitcher

    switcher = document.createElement("div");
    switcher.id = "view-switcher";
    switcher.className = "view-switcher";
    switcher.style.setProperty("--view-count", viewOrder.length);

    const buttonsHtml = viewOrder
      .map((id) => `
        <button type="button" class="view-btn" data-view="${id}" aria-label="${views[id].label}">
          ${views[id].icon}
        </button>`)
      .join("");

    switcher.innerHTML = `<span class="view-switcher-indicator" aria-hidden="true"></span>${buttonsHtml}`;
    tabBar.insertAdjacentElement("afterend", switcher);

    // A view that needs per-item images is disabled when the page has none.
    viewOrder.forEach((id) => {
      if (views[id].requiresImages && !hasImages) {
        switcher.querySelector(`[data-view="${id}"]`).disabled = true;
      }
    });

    switcher.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;

        currentView = btn.dataset.view;
        updateViewSwitcher();
        renderList();
      });
    });

    updateViewSwitcher();
  }

  function updateViewSwitcher() {
    const switcher = document.getElementById("view-switcher");
    if (!switcher) return;

    const activeIndex = Math.max(0, viewOrder.indexOf(currentView));
    switcher.style.setProperty("--view-index", activeIndex);

    switcher.querySelectorAll(".view-btn").forEach((btn) => {
      const isActive = btn.dataset.view === currentView;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  // ─────────────────────────── ITEM LIST ───────────────────────────────────

  /** Items visible in the current tab (or all items if no tabs) */
  function visibleItems() {
    const base = [...page.items, ...tempItems];
    if (!hasTabs) return base;
    return base.filter((it) => it.tabId === activeTab);
  }

  function renderList() {
    listContainerEl.innerHTML = "";
    listContainerEl.className = `list-container view-${currentView}`;

    visibleItems().forEach((item) => {
      listContainerEl.appendChild(createRow(item));
    });

    // Restore state on newly rendered rows
    listContainerEl.querySelectorAll("[data-id]").forEach((row) => {
      const id = row.dataset.id;
      const state = selectionState[id];
      const cb = row.querySelector("input[type=checkbox]");
      const numInp = row.querySelector("input[type=number]");
      if (state) {
        cb.checked = state.checked;
        numInp.value = state.amount ?? "";
        applyInputStyle(numInp, state.checked);
      }
    });

    attachRowListeners();
    updateDownloadPreview();
  }

  function createItemText(item) {
    const displayName = showGujarati && item.gujarati
      ? item.gujarati
      : item.name;

    return `
      <div class="text">
        <span class="item-display-name">${displayName}</span>
        <span class="item-price-tag">(₹${item.price})</span>
      </div>`;
  }

  function createItemImage(item) {
    const hasImage = item.imageUrl && item.imageUrl.trim() !== "";

    // If this page has at least one real image, items without their own
    // image use the page logo as a subtle grayscale fallback.
    if (!hasImages) return "";

    const imageSrc = hasImage
      ? `${page.imageFolder}${item.imageUrl}`
      : page.logoUrl;

    const imageClass = hasImage ? "item-image" : "item-image fallback-image";

    return `
      <div class="item-image-container">
        <img src="${imageSrc}" alt="${item.name}" class="${imageClass}">
      </div>`;
  }

  function createRow(item) {
    const label = document.createElement("label");
    label.dataset.id = item.id;
    label.className = "list-item";

    const checkboxHtml = `
      <div class="checkbox-container item-checkbox">
        <input type="checkbox" name="checkbox" value="${item.id}">
        <div class="checkmark">${checkmarkSvg()}</div>
      </div>`;

    const view = views[currentView];
    const controlsHtml = amountControlLayouts[view.controls]();

    label.innerHTML = view.layout(checkboxHtml, createItemImage(item), createItemText(item), controlsHtml);

    return label;
  }

  function attachRowListeners() {
    listContainerEl.querySelectorAll("label[data-id]").forEach((row) => {
      const id = row.dataset.id;
      const cb = row.querySelector("input[type=checkbox]");
      const numInp = row.querySelector("input[type=number]");
      const minusBtn = row.querySelector(".minus-btn");
      const plusBtn = row.querySelector(".plus-btn");

      cb.addEventListener("change", () => {
        if (cb.checked) {
          numInp.value = numInp.value > 0 ? numInp.value : 1;
        } else {
          numInp.value = "";
        }
        applyInputStyle(numInp, cb.checked);
        saveRowState(id, cb, numInp);
        updateDownloadPreview();
        renderTabBar();
      });

      numInp.addEventListener("input", () => {
        const val = parseFloat(numInp.value);
        cb.checked = val > 0;
        applyInputStyle(numInp, cb.checked);
        saveRowState(id, cb, numInp);
        updateDownloadPreview();
        renderTabBar();
      });

      // Plus button: increment by 1
      plusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentVal = parseFloat(numInp.value) || 0;
        numInp.value = currentVal + 1;
        cb.checked = true;
        applyInputStyle(numInp, true);
        saveRowState(id, cb, numInp);
        updateDownloadPreview();
        renderTopbar();
        renderTabBar();
      });

      // Minus button: decrement by 1 (min 0)
      minusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentVal = parseFloat(numInp.value) || 0;
        const newVal = Math.max(0, currentVal - 1);
        numInp.value = newVal > 0 ? newVal : "";
        cb.checked = newVal > 0;
        applyInputStyle(numInp, cb.checked);
        saveRowState(id, cb, numInp);
        updateDownloadPreview();
        renderTabBar();
      });
    });
  }

  function saveRowState(id, cb, numInp) {
    selectionState[id] = {
      checked: cb.checked,
      amount: cb.checked ? numInp.value : "",
    };
  }

  function applyInputStyle(numInp, checked) {
    numInp.style.border = checked ? "2px solid #FCDC4D" : "2px solid grey";
  }

  // ─────────────────────────── DOWNLOAD PREVIEW ────────────────────────────

  function updateDownloadPreview() {
    const listUl = document.getElementById("selected-items-list");
    const totalItemEl = document.getElementById("total-items");
    const totalPriceEl = document.getElementById("total-price");
    const logoImgEl = document.getElementById("company-logo-in-list");
    const companyNameEl = document.getElementById("company-name");
    const personNameEl = document.getElementById("person-name");
    const dateEl = document.getElementById("date");
    const showImagesDownloadContainerEl = document.getElementById("show-images-download-container");

    logoImgEl.src = page.logoUrl;
    companyNameEl.textContent = page.name.toUpperCase();
    personNameEl.textContent = personName;
    dateEl.textContent = formatDate();

    // Show Images toggle OUTSIDE download preview (only if page has images)
    // Only create once, then update checkbox state
    if (hasImages) {
      // Only create HTML if it doesn't exist yet
      if (!document.getElementById("show-images-download-toggle")) {
        showImagesDownloadContainerEl.innerHTML = `
          <div class="show-images-download-div">${createCheckboxToggle('show-images-download-toggle', showDownloadImages, 'Show Images')}</div>`;

        const showImagesDownloadToggle = document.getElementById("show-images-download-toggle");
        showImagesDownloadToggle.addEventListener("change", function () {
          showDownloadImages = this.checked;
          updateDownloadPreview();
        });
      } else {
        // Just update the checkbox state
        const showImagesDownloadToggle = document.getElementById("show-images-download-toggle");
        showImagesDownloadToggle.checked = showDownloadImages;
      }
    }

    listUl.innerHTML = "";
    let counter = 1;
    let totalItems = 0;
    let totalPrice = 0;

    // Collect selected items across ALL items (not just current tab)
    const allItems = [...page.items, ...tempItems];
    const totalItemCount = allItems.filter(item => {
      const state = selectionState[item.id];
      if (!state || !state.checked) return false;
      const amount = parseFloat(state.amount) || 0;
      return amount > 0;
    }).length;

    allItems.forEach((item) => {
      const state = selectionState[item.id];
      if (!state || !state.checked) return;

      const amount = parseFloat(state.amount) || 0;
      if (amount <= 0) return;

      const li = document.createElement("li");

      // Only load images if showDownloadImages is true
      const hasImage = item.imageUrl && item.imageUrl.trim() !== '';
      const imageSrc = hasImage
        ? `${page.imageFolder}${item.imageUrl}`
        : page.logoUrl;

      const imageClass = hasImage ? '' : 'default-item-image';
      const imageHtml = hasImages && showDownloadImages
        ? `<img src="${imageSrc}" alt="${item.name}" class="${imageClass}">`
        : '';

      const imageContainerHtml = imageHtml
        ? `<div class="item-image-container">${imageHtml}</div>`
        : '';

      const displayName = showGujarati && item.gujarati
        ? item.gujarati
        : item.name;

      li.innerHTML = `
        <span class="item-number">${counter}</span>
        ${imageContainerHtml}
        <span class="item-name">
          ${displayName} <span class="item-price-tag">(₹${item.price})</span> :
          <span class="item-amount">${amount}</span>
        </span>
        <span class="item-price">₹${item.price * amount}</span>`;

      // Add dark grey background to last item
      if (counter === totalItemCount) {
        li.classList.add('last-item');
      }

      counter++;
      totalItems += amount;
      totalPrice += item.price * amount;
      listUl.appendChild(li);
    });

    totalItemEl.textContent = `Total items : ${totalItems}`;
    totalPriceEl.textContent = `₹${totalPrice}`;

    const hasSelected = counter > 1;
    downloadPicEl.style.display = hasSelected ? "block" : "none";
    showImagesDownloadContainerEl.style.display = hasSelected ? "flex" : "none";
  }

  // ─────────────────────────── ADD ITEM BUTTON ─────────────────────────────

  addItemBtnEl.addEventListener("click", () => {
    addItemPopupEl.style.display = "flex";
    document.getElementById("form-name-input").focus();
  });

  addItemCancelEl.addEventListener("click", () => {
    addItemPopupEl.style.display = "none";
  });

  addItemFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInp = document.getElementById("form-name-input");
    const priceInp = document.getElementById("form-price-input");

    const newItem = {
      id: `temp_${Date.now()}`,
      tabId: activeTab,       // add to currently visible tab
      name: nameInp.value.trim(),
      gujarati: null,
      price: parseFloat(priceInp.value) || 0,
      imageUrl: null,
    };

    tempItems.push(newItem);
    renderList();

    nameInp.value = "";
    priceInp.value = "";
    addItemPopupEl.style.display = "none";
  });

  // ─────────────────────────── DOWNLOAD ────────────────────────────────────

  downloadBtnEl.addEventListener("click", () => {
    const hasSelected = downloadPicEl.style.display === "block";
    if (!hasSelected || isDownloading) {
      if (!hasSelected) alert("No item selected");
      return;
    }
    isDownloading = true;
    openPersonNamePopup();
  });

  function openPersonNamePopup() {
    personNamePopupEl.style.display = "flex";
    personNameInputEl.value = personName;
    personNameInputEl.focus();
  }

  personNameCancelEl.addEventListener("click", () => {
    personNamePopupEl.style.display = "none";
    isDownloading = false;
  });

  personNameFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    personName = personNameInputEl.value.trim();
    if (!personName) return;
    localStorage.setItem("storedPersonName", personName);
    updateDownloadPreview();
    personNamePopupEl.style.display = "none";
    downloadImage();
  });

  async function downloadImage() {
    location.href = "#download-pic";

    try {
      const canvas = await html2canvas(downloadPicEl);
      const dataUrl = canvas.toDataURL("image/png");

      await savePng(dataUrl, buildFileName());
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to save image.");
    } finally {
      isDownloading = false;
    }
  }

  // ─────────────────────────── HELPERS ─────────────────────────────────────

  function checkmarkSvg() {
    return `<svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.7601 1.72837C22.6079 1.91613 8.92915 19.1417 8.79063 19.3192C8.46874 19.7242
        8.01793 19.968 7.53726 19.9971C7.05659 20.0261 6.58538 19.8381 6.22719 19.4742
        C6.15032 19.3945 6.07907 19.3081 6.01408 19.2158L0.267659 10.9475
        C0.0962799 10.7536 -1.35132e-08 10.4905 0 10.2163
        C1.35132e-08 9.94201 0.0962799 9.67898 0.267659 9.48505
        C0.439039 9.29112 0.671479 9.18217 0.913846 9.18217
        C1.15621 9.18217 1.38865 9.29112 1.56003 9.48505L7.34451 14.6321
        L21.4647 0.272796C22.3385 -0.572982 23.5106 0.727565 22.7601 1.72837Z"
        fill="#593F28" />
    </svg>`;
  }

  // Reusable checkbox component with label
  function createCheckboxToggle(id, checked, labelText) {
    return `
      <label class="checkbox-label pill-toggle">
        <div class="checkbox-container">
          <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
          <div class="checkmark">${checkmarkSvg()}</div>
        </div>
        <span class="checkbox-text">${labelText}</span>
      </label>`;
  }

  function formatDate() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `(${dd}/${mm}/${d.getFullYear()})`;
  }

  function buildFileName() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return [
      page.id,
      pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear(),
      pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()),
    ].join("_") + ".png";
  }
});
