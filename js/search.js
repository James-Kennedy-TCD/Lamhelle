// Search results page: reads ?q= and ?category= from the URL, lets the
// visitor refine both, and keeps the URL in sync so results are shareable.

(function () {
  let activeQuery = "";
  let activeCategory = "All";

  function readParams() {
    const params = new URLSearchParams(window.location.search);
    activeQuery = params.get("q") || "";
    activeCategory = params.get("category") || "All";
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (activeQuery) params.set("q", activeQuery);
    if (activeCategory && activeCategory !== "All") params.set("category", activeCategory);
    const qs = params.toString();
    history.replaceState(null, "", qs ? `search.html?${qs}` : "search.html");
  }

  function renderHeading() {
    document.getElementById("searchHeading").textContent = activeQuery
      ? `Search results for "${activeQuery}"`
      : "Browse all businesses";
  }

  function renderGrid() {
    const results = BUSINESSES.filter((b) => matchesBusiness(b, activeQuery, activeCategory));
    const grid = document.getElementById("cardGrid");

    grid.innerHTML = results.length
      ? results.map(bizCardHtml).join("")
      : `<div class="empty-state">No businesses match ${activeQuery ? `&ldquo;${escapeHtml(activeQuery)}&rdquo;` : "that filter"} yet. Try a different search or category.</div>`;

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

  readParams();
  setupChips();
  setupSearch();
  renderGrid();
})();
