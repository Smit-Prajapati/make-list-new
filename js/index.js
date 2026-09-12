import { pages } from "./data.js";

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
  container.appendChild(li);
});
