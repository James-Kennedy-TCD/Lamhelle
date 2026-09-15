// Shared helpers used by both the map page and the recommended page.

// If a backend is running (see ../backend/), it becomes the source of truth
// for businesses and reviews/replies; when it's not reachable (e.g. the
// static GitHub Pages deploy, which can't run a Python process), everything
// transparently falls back to the bundled sample data + localStorage below.
// This keeps the static demo working exactly as before with zero regression.
let API_AVAILABLE = false;
let REMOTE_REVIEWS = null; // { [businessId]: [{id, name, rating, text, date, reply}, ...] }

async function hydrateFromApi() {
  try {
    const [bizRes, reviewsRes] = await Promise.all([
      fetch("/api/businesses", { signal: AbortSignal.timeout(2000) }),
      fetch("/api/reviews", { signal: AbortSignal.timeout(2000) }),
    ]);
    if (!bizRes.ok || !reviewsRes.ok) throw new Error("bad response");

    const remoteBusinesses = await bizRes.json();
    if (!Array.isArray(remoteBusinesses) || !remoteBusinesses.length) throw new Error("empty");

    BUSINESSES.length = 0;
    BUSINESSES.push(...remoteBusinesses);
    REMOTE_REVIEWS = await reviewsRes.json();
    API_AVAILABLE = true;
  } catch {
    // No backend reachable - keep the bundled sample data (data.js) and
    // localStorage-backed reviews/replies exactly as they already work.
    API_AVAILABLE = false;
  }
}

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

const REVIEWS_KEY = "lamhelle_reviews";

function getStoredReviews(bizId) {
  try {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
    return all[bizId] || [];
  } catch {
    return [];
  }
}

function addReview(bizId, review) {
  if (API_AVAILABLE && REMOTE_REVIEWS) {
    // Optimistic update so the caller's immediate re-render shows it, then
    // persist server-side in the background and swap in the real id once
    // it comes back (needed so a later owner reply attaches correctly).
    REMOTE_REVIEWS[bizId] = [review, ...(REMOTE_REVIEWS[bizId] || [])];
    fetch(`/api/businesses/${bizId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: review.name, rating: review.rating, text: review.text }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((saved) => {
        if (!saved || !REMOTE_REVIEWS[bizId]) return;
        const idx = REMOTE_REVIEWS[bizId].indexOf(review);
        if (idx !== -1) REMOTE_REVIEWS[bizId][idx] = saved;
      })
      .catch(() => {
        // Backend went away mid-request - the optimistic entry stays for
        // this session, it just won't survive a reload.
      });
    return;
  }

  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
  } catch {
    all = {};
  }
  all[bizId] = [review, ...(all[bizId] || [])];
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  } catch {
    // localStorage unavailable - the review just won't persist across visits.
  }
}

// Deterministically picks 2 category-appropriate sample reviews per business
// (same technique as businessPhotoIds) so profiles don't start out empty.
// Each gets a stable "seed-N" id so an owner reply can attach to it even
// though these reviews are recomputed on every render, not stored.
function seedReviewsFor(biz) {
  const templates = REVIEW_TEMPLATES[biz.category] || [];
  if (!templates.length) return [];

  let seed = 0;
  for (const ch of biz.id) seed += ch.charCodeAt(0);

  const first = seed % templates.length;
  const second = (first + 1) % templates.length;

  return [first, second].map((templateIdx, i) => ({
    id: `seed-${i}`,
    name: REVIEWER_NAMES[(seed + i * 5) % REVIEWER_NAMES.length],
    rating: templates[templateIdx].rating,
    text: templates[templateIdx].text,
    date: REVIEW_DATES[(seed + i * 3) % REVIEW_DATES.length],
  }));
}

function allReviews(biz) {
  if (API_AVAILABLE && REMOTE_REVIEWS) return REMOTE_REVIEWS[biz.id] || [];
  return [...getStoredReviews(biz.id), ...seedReviewsFor(biz)];
}

const REVIEW_REPLIES_KEY = "lamhelle_review_replies";

function getReply(bizId, reviewId) {
  if (API_AVAILABLE && REMOTE_REVIEWS) {
    const review = (REMOTE_REVIEWS[bizId] || []).find((r) => r.id === reviewId);
    return review?.reply || null;
  }
  try {
    const all = JSON.parse(localStorage.getItem(REVIEW_REPLIES_KEY)) || {};
    return (all[bizId] || {})[reviewId] || null;
  } catch {
    return null;
  }
}

function setReply(bizId, reviewId, text) {
  if (API_AVAILABLE && REMOTE_REVIEWS) {
    const review = (REMOTE_REVIEWS[bizId] || []).find((r) => r.id === reviewId);
    if (review) review.reply = { text, date: "Just now" };
    fetch(`/api/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => {
      // Backend went away mid-request - the optimistic update stays for
      // this session, it just won't survive a reload.
    });
    return;
  }

  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(REVIEW_REPLIES_KEY)) || {};
  } catch {
    all = {};
  }
  all[bizId] = { ...(all[bizId] || {}), [reviewId]: { text, date: "Just now" } };
  try {
    localStorage.setItem(REVIEW_REPLIES_KEY, JSON.stringify(all));
  } catch {
    // localStorage unavailable - the reply just won't persist across visits.
  }
}

function averageRating(biz) {
  const reviews = allReviews(biz);
  if (!reviews.length) return { avg: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { avg: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

function starsHtml(rating) {
  const rounded = Math.round(rating);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="${i <= rounded ? "" : "star-empty"}">&#9733;</span>`;
  }
  return `<span class="stars">${stars}</span>`;
}

function ratingSummaryHtml(biz) {
  const { avg, count } = averageRating(biz);
  if (!count) return '<p class="rating-count">No reviews yet. Be the first to leave one.</p>';
  return `
    <div class="rating-summary">
      ${starsHtml(avg)}
      <strong>${avg}</strong>
      <span class="rating-count">(${count} review${count === 1 ? "" : "s"})</span>
    </div>
  `;
}

function cardRatingHtml(biz) {
  const { avg, count } = averageRating(biz);
  if (!count) return "No reviews yet";
  return `<span class="rating-inline">&#9733; ${avg}</span> (${count})`;
}

function reviewCardHtml(review, bizId) {
  const reply = bizId ? getReply(bizId, review.id) : null;
  return `
    <div class="review-card">
      <div class="review-top">
        <span class="review-name">${escapeHtml(review.name)}</span>
        <span class="review-date">${escapeHtml(review.date)}</span>
      </div>
      ${starsHtml(review.rating)}
      <p>${escapeHtml(review.text)}</p>
      ${
        reply
          ? `<div class="review-reply">
               <span class="reply-label">Reply from the owner</span>
               <p>${escapeHtml(reply.text)}</p>
             </div>`
          : ""
      }
    </div>
  `;
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

// Matches a business against a free-text query, an optional category filter,
// and an optional exact-area filter (e.g. "Ranelagh").
function matchesBusiness(biz, query, category, area) {
  const inCategory = !category || category === "All" || biz.category === category;
  if (!inCategory) return false;

  if (area && area !== "All" && biz.area !== area) return false;

  if (!query) return true;
  const haystack = [biz.name, biz.category, biz.area, biz.blurb, ...(biz.tags || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function directionsUrl(biz) {
  return `https://www.openstreetmap.org/?mlat=${biz.lat}&mlon=${biz.lng}#map=17/${biz.lat}/${biz.lng}`;
}

function allAreas() {
  return [...new Set(BUSINESSES.map((b) => b.area))].sort();
}

// Haversine distance in km between two lat/lng points.
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;
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
  const pool = (biz.photoIds && biz.photoIds.length) ? biz.photoIds : (PHOTO_LIBRARY[biz.category] || []);
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
    ? `<img src="${unsplashUrl(photoId, width)}" alt="${escapeHtml(biz.name)}, ${escapeHtml(biz.category)}" loading="lazy" onerror="handlePhotoError(this)" />`
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
        <p class="biz-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)} &middot; ${cardRatingHtml(biz)}${
          typeof opts.distanceKm === "number" ? ` &middot; <span class="distance-inline">${formatDistance(opts.distanceKm)}</span>` : ""
        }</p>
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

// "Heat" score for the What's Hot / vibe map features: mostly driven by
// rating and review count, plus a small deterministic per-business "buzz"
// so the ranking isn't just a flat tie between businesses with identical
// seed-review counts.
function heatScore(biz) {
  const { avg, count } = averageRating(biz);
  let seed = 0;
  for (const ch of biz.id) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  const buzz = (seed % 50) / 10;
  return Math.round((avg * 10 + count * 2 + buzz) * 10) / 10;
}

function rankWhatsHot(businesses, limit) {
  const ranked = [...businesses].sort((a, b) => heatScore(b) - heatScore(a));
  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}

function heatTier(rank) {
  if (rank <= 3) return 1;
  if (rank <= 8) return 2;
  return 3;
}

function flameBadge(rank) {
  const tier = heatTier(rank);
  return "&#128293;".repeat(tier === 1 ? 3 : tier === 2 ? 2 : 1);
}

// Nudges overlapping/identical coordinates apart slightly (deterministically,
// so it's stable across renders) so pins on the vibe map don't stack exactly.
function jitteredCoord(biz) {
  let seed = 0;
  for (const ch of biz.id) seed = (seed * 37 + ch.charCodeAt(0)) % 100000;
  const jitterLat = (((seed % 17) - 8) * 0.0006);
  const jitterLng = ((Math.floor(seed / 17) % 17) - 8) * 0.0006;
  return [biz.lat + jitterLat, biz.lng + jitterLng];
}

function hotCardHtml(biz, rank) {
  return `
    <article class="hot-card" data-id="${biz.id}">
      <a class="biz-card-photo" href="business.html?id=${biz.id}">
        ${photoTileHtml(biz, "card", 0, 500)}
        <span class="hot-rank tier-${heatTier(rank)}">#${rank}</span>
      </a>
      <div class="biz-card-body">
        <div class="biz-top">
          <h3><a href="business.html?id=${biz.id}">${escapeHtml(biz.name)}</a></h3>
          <span class="hot-flames">${flameBadge(rank)}</span>
        </div>
        <p class="biz-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)} &middot; ${cardRatingHtml(biz)}</p>
        <p class="biz-blurb">${escapeHtml(biz.blurb)}</p>
        <div class="biz-actions">
          <a class="btn-link" href="business.html?id=${biz.id}">View profile</a>
          <a class="btn-link" href="explore.html?focus=${biz.id}">Vibe map</a>
        </div>
      </div>
    </article>
  `;
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
