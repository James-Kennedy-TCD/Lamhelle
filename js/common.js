// Shared helpers used by both the map page and the recommended page.

const CATEGORY_COLORS = {
  "Cafe": "#8a5a2b",
  "Boutique Clothing": "#a3327a",
  "Florist": "#c9327a",
  "Homeware": "#3a6ea5",
  "Gift Shop": "#c9a227",
  "Bakery": "#b5651d",
  "Bookshop": "#4b3f72",
  "Baby & Kids": "#2f9e6e",
  "Specialist Service": "#5b6660",
  "Deli": "#7a8b2f",
};

function categoryColor(category) {
  return CATEGORY_COLORS[category] || "#167a52";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function priceLabel(level) {
  return "€".repeat(level || 1);
}

// Matches a business against a free-text query and an optional category filter.
function matchesBusiness(biz, query, category) {
  const inCategory = !category || category === "All" || biz.category === category;
  if (!inCategory) return false;

  if (!query) return true;
  const haystack = [biz.name, biz.category, biz.area, biz.blurb, ...(biz.tags || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function directionsUrl(biz) {
  return `https://www.openstreetmap.org/?mlat=${biz.lat}&mlon=${biz.lng}#map=17/${biz.lat}/${biz.lng}`;
}

function bizCardHtml(biz) {
  return `
    <article class="biz-card" data-id="${biz.id}">
      <div class="biz-top">
        <h3>${escapeHtml(biz.name)}</h3>
        ${biz.featured ? '<span class="badge featured">Recommended</span>' : `<span class="badge">${priceLabel(biz.priceLevel)}</span>`}
      </div>
      <p class="biz-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)}</p>
      <p class="biz-blurb">${escapeHtml(biz.blurb)}</p>
      <div class="biz-tags">
        ${(biz.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="biz-actions">
        <a class="btn-link" href="index.html?focus=${biz.id}">View on map</a>
        <a class="btn-link" href="${directionsUrl(biz)}" target="_blank" rel="noopener">Directions</a>
      </div>
    </article>
  `;
}

// Simple "recommended" ranking: featured businesses first, then everything
// else, lightly shuffled per day so the picks feel alive without a backend.
function rankRecommended(businesses) {
  const seedDay = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (const ch of seedDay) seed += ch.charCodeAt(0);

  function pseudoRandom(id) {
    let hash = seed;
    for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
    return hash;
  }

  return [...businesses].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return pseudoRandom(a.id) - pseudoRandom(b.id);
  });
}

function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

document.addEventListener("DOMContentLoaded", setupNavToggle);
