// ─── home.js — home page entry point ─────────────────────────────────────────

import { pages } from "../../data.js";
import { setupBackButton } from "../../platform.js";
import { initTooltips } from "../../common/tooltip.js";
import { initImageLoaders } from "../../common/loader.js";
import { renderNavCard } from "./views/homeView.js";

// On Android, pressing Back from Home exits the app.
setupBackButton();
initTooltips();

const container = document.getElementById("navbar-container");

// Build home-page nav cards from data
pages.forEach((page) => {
  const li = document.createElement("li");
  li.innerHTML = renderNavCard(page);

  // Capacitor WebViews can drop URL query parameters during page navigation.
  // Keep the selected list in the current browser session as a native-safe fallback.
  li.querySelector("a").addEventListener("click", () => {
    sessionStorage.setItem("selectedListId", page.id);
  });

  container.appendChild(li);
});

// Show a spinner inside each image container until its image loads
initImageLoaders(container);
