// Search results page: reads ?q=, ?category= and ?area= from the URL, lets
// the visitor refine all three (plus an optional "near me" geolocation
// sort), and keeps the URL in sync so results are shareable.

(function () {
  let activeQuery = "";
  let activeCategory = "All";
  let activeArea = "All";
  let userCoords = null;

  function readParams() {
    const params = new URLSearchParams(window.location.search);
    activeQuery = params.get("q") || "";
    activeCategory = params.get("category") || "All";
    activeArea = params.get("area") || "All";
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (activeQuery) params.set("q", activeQuery);
    if (activeCategory && activeCategory !== "All") params.set("category", activeCategory);
    if (activeArea && activeArea !== "All") params.set("area", activeArea);
    const qs = params.toString();
    history.replaceState(null, "", qs ? `search.html?${qs}` : "search.html");
  }

  function renderHeading() {
    document.getElementById("searchHeading").textContent = activeQuery
      ? `Search results for "${activeQuery}"`
      : "Browse all businesses";
  }

  function renderGrid() {
    let results = BUSINESSES.filter((b) => matchesBusiness(b, activeQuery, activeCategory, activeArea));

    if (userCoords) {
      results = results
        .map((b) => ({ biz: b, distanceKm: distanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      results = results.map((b) => ({ biz: b, distanceKm: null }));
    }

    const grid = document.getElementById("cardGrid");
    grid.innerHTML = results.length
      ? results.map(({ biz, distanceKm }) => bizCardHtml(biz, distanceKm !== null ? { distanceKm } : {})).join("")
      : `<div class="empty-state">No businesses match ${activeQuery ? `&ldquo;${escapeHtml(activeQuery)}&rdquo;` : "that filter"} yet. Try a different search, category or area.</div>`;

    document.getElementById("resultCount").textContent = `${results.length} of ${BUSINESSES.length} businesses`;
    renderHeading();
  }

  function setupSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");
    input.value = activeQuery;

    function runSearch() {
      activeQuery = input.value.trim();
      updateUrl();
      renderGrid();
    }

    btn.addEventListener("click", runSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch();
    });
  }

  function setupChips() {
    const container = document.getElementById("categoryChips");
    CATEGORIES.forEach((cat) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.dataset.category = cat;
      chip.textContent = cat;
      container.appendChild(chip);
    });

    container.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.category === activeCategory);
    });

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      updateUrl();
      renderGrid();
    });
  }

  function setupAreaSelect() {
    const select = document.getElementById("areaSelect");
    allAreas().forEach((area) => {
      const opt = document.createElement("option");
      opt.value = area;
      opt.textContent = area;
      select.appendChild(opt);
    });
    select.value = activeArea;

    select.addEventListener("change", () => {
      activeArea = select.value;
      updateUrl();
      renderGrid();
    });
  }

  function setupNearMe() {
    const btn = document.getElementById("nearMeBtn");
    const status = document.getElementById("locationStatus");

    btn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        status.textContent = "Location isn't supported in this browser.";
        return;
      }

      status.textContent = "Finding your location...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          status.textContent = "Showing distances from your location.";
          renderGrid();
        },
        () => {
          status.textContent = "Couldn't get your location. Check your browser's location permission.";
        },
        { timeout: 10000 }
      );
    });
  }

  readParams();
  setupChips();
  setupAreaSelect();
  setupSearch();
  setupNearMe();
  renderGrid();
})();
