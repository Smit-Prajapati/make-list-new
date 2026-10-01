// ─── homeView.js — markup for one home-page nav card ─────────────────────────

export function renderNavCard(page) {
  return `
    <a href="list.html?list=${page.id}" class="nav-card ${page.cardVariant}">
      <h3>${page.name}</h3>
      <div class="image-container">
        <img src="${page.logoUrl}" alt="${page.name}">
      </div>
    </a>`;
}
