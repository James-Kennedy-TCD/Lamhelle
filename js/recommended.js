// Recommended page: shows a ranked, filterable grid of businesses.

(function () {
  let activeCategory = "All";
  let activeQuery = "";

  const ranked = rankRecommended(BUSINESSES);

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
      renderGrid();
    });
  }

  function renderGrid() {
    const grid = document.getElementById("cardGrid");
    const visible = ranked.filter((biz) => matchesBusiness(biz, activeQuery, activeCategory));

    grid.innerHTML = visible.length
      ? visible.map(bizCardHtml).join("")
      : '<div class="empty-state">No businesses match that search yet.</div>';

    document.getElementById("resultCount").textContent =
      `${visible.length} of ${BUSINESSES.length} businesses`;
  }

  function setupSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");

    function runSearch() {
      activeQuery = input.value;
      renderGrid();
    }

    btn.addEventListener("click", runSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch();
    });
  }

  renderChips();
  setupSearch();
  renderGrid();
})();
