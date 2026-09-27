import { pages } from "./data.js";
import { setupBackButton } from "./platform.js";

// On Android, pressing Back from Home exits the app.
setupBackButton();

// Build home-page nav cards from data
const container = document.getElementById("navbar-container");

pages.forEach((page) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <a href="list.html?list=${page.id}" class="nav-card ${page.cardVariant}">
      <h3>${page.name}</h3>
      <div class="image-container">
        <img src="${page.logoUrl}" alt="${page.name}">
      </div>
    </a>`;

  // Capacitor WebViews can drop URL query parameters during page navigation.
  // Keep the selected list in the current browser session as a native-safe fallback.
  li.querySelector("a").addEventListener("click", () => {
    sessionStorage.setItem("selectedListId", page.id);
  });

  container.appendChild(li);
});
