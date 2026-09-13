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

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// JS getDay() is 0=Sun..6=Sat; this converts to 0=Mon..6=Sun to match DAY_LABELS.
function todayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function getHours(biz) {
  return biz.hours || HOURS_PRESETS[biz.category] || Array(7).fill("Closed");
}

function isOpenNow(biz) {
  const today = getHours(biz)[todayIndex()];
  if (!today || today === "Closed") return false;
  const [openStr, closeStr] = today.split("–");
  if (!closeStr) return false;
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= toMinutes(openStr) && nowMinutes <= toMinutes(closeStr);
}

function openStatusHtml(biz) {
  return isOpenNow(biz)
    ? '<span class="status-pill open">Open now</span>'
    : '<span class="status-pill closed">Closed now</span>';
}

function hoursTableHtml(biz) {
  const hours = getHours(biz);
  const todayIdx = todayIndex();
  return `
    <table class="hours-table">
      ${DAY_LABELS.map(
        (day, i) => `
        <tr class="${i === todayIdx ? "today" : ""}">
          <td>${day}</td>
          <td>${escapeHtml(hours[i])}</td>
        </tr>`
      ).join("")}
    </table>
  `;
}

// Placeholder "photo" tile (gradient + category emoji) until real photos
// are uploaded per business.
function photoTileHtml(biz, variant) {
  const icon = CATEGORY_ICONS[biz.category] || "🛍️";
  const color = categoryColor(biz.category);
  return `<div class="photo-tile photo-${variant}" style="background: linear-gradient(155deg, ${color}, ${color}99);"><span>${icon}</span></div>`;
}

function photoGalleryHtml(biz) {
  return `
    <div class="photo-gallery">
      ${photoTileHtml(biz, "main")}
      ${photoTileHtml(biz, "thumb")}
      ${photoTileHtml(biz, "thumb")}
    </div>
  `;
}

function bizCardHtml(biz) {
  return `
    <article class="biz-card" data-id="${biz.id}">
      <a class="biz-card-photo" href="business.html?id=${biz.id}">
        ${photoTileHtml(biz, "card")}
        ${biz.featured ? '<span class="badge featured card-badge">Recommended</span>' : ""}
      </a>
      <div class="biz-card-body">
        <div class="biz-top">
          <h3><a href="business.html?id=${biz.id}">${escapeHtml(biz.name)}</a></h3>
          <span class="badge">${priceLabel(biz.priceLevel)}</span>
        </div>
        <p class="biz-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)}</p>
        <p class="biz-blurb">${escapeHtml(biz.blurb)}</p>
        <div class="biz-tags">
          ${(biz.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        <div class="biz-actions">
          <a class="btn-link" href="business.html?id=${biz.id}">View profile</a>
          <a class="btn-link" href="index.html?focus=${biz.id}">Map</a>
          <a class="btn-link" href="${directionsUrl(biz)}" target="_blank" rel="noopener">Directions</a>
        </div>
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
