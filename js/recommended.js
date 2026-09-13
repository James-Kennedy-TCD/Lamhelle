// Recommended page: shows a ranked, filterable grid of businesses.

(function () {
  let activeCategory = "All";

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
    const visible = ranked.filter((biz) => matchesBusiness(biz, "", activeCategory));

    grid.innerHTML = visible.length
      ? visible.map(bizCardHtml).join("")
      : '<div class="empty-state">No businesses match that category yet.</div>';

    document.getElementById("resultCount").textContent =
      `${visible.length} of ${BUSINESSES.length} businesses`;
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

  renderChips();
  setupSearch();
  renderGrid();
})();
