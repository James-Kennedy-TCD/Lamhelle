// Map page: renders all businesses on a Leaflet map with search + category
// filtering, and supports deep-linking to a single business via ?focus=id.

(function () {
  const SOUTH_DUBLIN_CENTER = [53.307, -6.225];

  const map = L.map("map").setView(SOUTH_DUBLIN_CENTER, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const markerById = new Map();
  let activeCategory = "All";

  function markerIcon(category) {
    const color = categoryColor(category);
    return L.divIcon({
      className: "",
      html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
    });
  }

  BUSINESSES.forEach((biz) => {
    const marker = L.marker([biz.lat, biz.lng], { icon: markerIcon(biz.category) });
    marker.bindPopup(`
      <h3>${escapeHtml(biz.name)}</h3>
      <p class="pop-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)}</p>
      <p>${escapeHtml(biz.blurb)}</p>
      <div class="pop-links">
        <a class="pop-link" href="business.html?id=${biz.id}">View profile &rarr;</a>
        <a class="pop-link" href="${directionsUrl(biz)}" target="_blank" rel="noopener">Directions &rarr;</a>
      </div>
    `);
    marker.addTo(map);
    markerById.set(biz.id, marker);
  });

  function renderChips() {
    const container = document.getElementById("categoryChips");
    CATEGORIES.forEach((cat) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.dataset.category = cat;
      chip.textContent = cat;
      container.appendChild(chip);
    });

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      applyFilters();
    });
  }

  function renderLegend() {
    const legend = document.getElementById("mapLegend");
    legend.innerHTML = CATEGORIES.map(
      (cat) => `<span><span class="dot" style="background:${categoryColor(cat)}"></span>${cat}</span>`
    ).join("");
  }

  function applyFilters() {
    let visibleCount = 0;
    BUSINESSES.forEach((biz) => {
      const marker = markerById.get(biz.id);
      const visible = matchesBusiness(biz, "", activeCategory);
      if (visible) {
        if (!map.hasLayer(marker)) marker.addTo(map);
        visibleCount++;
      } else if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    const label = document.getElementById("resultCount");
    label.textContent = `${visibleCount} of ${BUSINESSES.length} shops shown`;
  }

  function setupSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");

    function goToSearch() {
      const q = input.value.trim();
      window.location.href = q ? `search.html?q=${encodeURIComponent(q)}` : "search.html";
    }

    btn.addEventListener("click", goToSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") goToSearch();
    });
  }

  function focusFromQueryString() {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get("focus");
    if (!focusId) return;
    const biz = BUSINESSES.find((b) => b.id === focusId);
    const marker = markerById.get(focusId);
    if (!biz || !marker) return;
    map.setView([biz.lat, biz.lng], 16);
    marker.openPopup();
  }

  renderChips();
  renderLegend();
  setupSearch();
  applyFilters();
  focusFromQueryString();
})();
