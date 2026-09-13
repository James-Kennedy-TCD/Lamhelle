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

const FAVOURITES_KEY = "lamhelle_favourites";

function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(FAVOURITES_KEY)) || [];
  } catch {
    return [];
  }
}

function isFavourited(id) {
  return getFavourites().includes(id);
}

function toggleFavourite(id) {
  const favs = new Set(getFavourites());
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify([...favs]));
  } catch {
    // localStorage unavailable (private browsing, etc.) - favouriting is
    // a nice-to-have, so fail silently.
  }
  return favs.has(id);
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

// Rotates each business's category photo pool so businesses sharing a
// category don't all show the exact same triplet of photos.
function businessPhotoIds(biz) {
  const pool = PHOTO_LIBRARY[biz.category] || [];
  if (!pool.length) return [];
  let seed = 0;
  for (const ch of biz.id) seed += ch.charCodeAt(0);
  const rot = seed % pool.length;
  return pool.slice(rot).concat(pool.slice(0, rot));
}

function unsplashUrl(photoId, width) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=70&auto=format&fit=crop`;
}

// If a photo fails to load (offline, link changed, etc.), fall back to a
// gradient tile with a category emoji instead of a broken image icon.
function handlePhotoError(img) {
  const tile = img.closest(".photo-tile");
  if (!tile) return;
  tile.style.background = tile.dataset.fallbackBg;
  img.remove();
  const span = document.createElement("span");
  span.textContent = tile.dataset.fallbackIcon;
  tile.appendChild(span);
}

function photoTileHtml(biz, variant, photoIndex, width) {
  const icon = CATEGORY_ICONS[biz.category] || "🛍️";
  const color = categoryColor(biz.category);
  const fallbackBg = `linear-gradient(155deg, ${color}, ${color}99)`;
  const photoId = businessPhotoIds(biz)[photoIndex];

  const img = photoId
    ? `<img src="${unsplashUrl(photoId, width)}" alt="${escapeHtml(biz.name)} — ${escapeHtml(biz.category)}" loading="lazy" onerror="handlePhotoError(this)" />`
    : `<span>${icon}</span>`;

  return `<div class="photo-tile photo-${variant}" data-fallback-bg="${fallbackBg}" data-fallback-icon="${icon}" style="${photoId ? "" : `background:${fallbackBg}`}">${img}</div>`;
}

function photoGalleryHtml(biz) {
  return `
    <div class="photo-gallery">
      ${photoTileHtml(biz, "main", 0, 800)}
      ${photoTileHtml(biz, "thumb", 1, 400)}
      ${photoTileHtml(biz, "thumb", 2, 400)}
    </div>
  `;
}

function bizCardHtml(biz, opts) {
  opts = opts || {};
  return `
    <article class="biz-card" data-id="${biz.id}">
      <a class="biz-card-photo" href="business.html?id=${biz.id}">
        ${photoTileHtml(biz, "card", 0, 500)}
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
          ${opts.showRemove ? `<button class="btn-link remove-fav-btn" data-id="${biz.id}">Remove</button>` : ""}
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
