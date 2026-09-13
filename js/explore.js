// "Explore" page: a Snapchat Map-style view — dark base map, a warm heat
// glow layer weighted by each business's heat score, and photo-avatar pins
// in a glowing ring sized by how hot they're trending. Paired with a
// What's Hot ranked list below, same as Snap Map pairs its map with
// trending Snaps.

(function () {
  const SOUTH_DUBLIN_CENTER = [53.307, -6.225];

  const map = L.map("vibeMap", { zoomControl: true }).setView(SOUTH_DUBLIN_CENTER, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const scores = BUSINESSES.map(heatScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  function normalized(score) {
    if (maxScore === minScore) return 0.5;
    return (score - minScore) / (maxScore - minScore);
  }

  const heatPoints = BUSINESSES.map((biz) => {
    const [lat, lng] = jitteredCoord(biz);
    return [lat, lng, 0.4 + normalized(heatScore(biz)) * 0.6];
  });

  L.heatLayer(heatPoints, {
    radius: 45,
    blur: 35,
    maxZoom: 17,
    gradient: { 0.2: "#3b0a0a", 0.4: "#8a1f0a", 0.6: "#e0430f", 0.8: "#ff8a00", 1.0: "#ffd23f" },
  }).addTo(map);

  const markerById = new Map();

  BUSINESSES.forEach((biz) => {
    const [lat, lng] = jitteredCoord(biz);
    const score = heatScore(biz);
    const tierRank = rankWhatsHot(BUSINESSES).findIndex((b) => b.id === biz.id) + 1;
    const tier = heatTier(tierRank);
    const photoId = businessPhotoIds(biz)[0];
    const size = tier === 1 ? 52 : tier === 2 ? 44 : 36;

    const icon = L.divIcon({
      className: "",
      html: `
        <div class="vibe-pin tier-${tier}" style="width:${size}px;height:${size}px;">
          ${photoId ? `<img src="${unsplashUrl(photoId, 100)}" alt="${escapeHtml(biz.name)}" />` : `<span>${CATEGORY_ICONS[biz.category] || "🛍️"}</span>`}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    marker.bindPopup(`
      <h3>${escapeHtml(biz.name)}</h3>
      <p class="pop-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)} &middot; &#128293; ${score}</p>
      <p>${escapeHtml(biz.blurb)}</p>
      <div class="pop-links">
        <a class="pop-link" href="business.html?id=${biz.id}">View profile &rarr;</a>
        <a class="pop-link" href="${directionsUrl(biz)}" target="_blank" rel="noopener">Directions &rarr;</a>
      </div>
    `);
    markerById.set(biz.id, marker);
  });

  function renderWhatsHot() {
    const ranked = rankWhatsHot(BUSINESSES, 8);
    document.getElementById("hotGrid").innerHTML = ranked.map((biz, i) => hotCardHtml(biz, i + 1)).join("");
    document.getElementById("hotCount").textContent = `Top ${ranked.length} trending now`;
  }

  function focusFromQueryString() {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get("focus");
    if (!focusId) return;
    const biz = BUSINESSES.find((b) => b.id === focusId);
    const marker = markerById.get(focusId);
    if (!biz || !marker) return;
    const [lat, lng] = jitteredCoord(biz);
    map.setView([lat, lng], 16);
    marker.openPopup();
  }

  renderWhatsHot();
  focusFromQueryString();
})();
