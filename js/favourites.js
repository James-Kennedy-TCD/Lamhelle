// Favourites page: shows businesses saved via the heart/Save button on a
// business profile, stored client-side in localStorage.

(async function () {
  await hydrateFromApi();

  let activeCategory = "All";

  function savedBusinesses() {
    const favIds = getFavourites();
    return BUSINESSES.filter((b) => favIds.includes(b.id));
  }

  function emptyStateHtml() {
    return `
      <div class="empty-state">
        <p>You haven't saved any businesses yet.</p>
        <p>Browse the <a class="btn-link" href="index.html">map</a> or
        <a class="btn-link" href="recommended.html">recommended picks</a> and tap
        &#9825; Save on a business to add it here.</p>
      </div>
    `;
  }

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
    const saved = savedBusinesses();
    const visible = saved.filter((biz) => matchesBusiness(biz, "", activeCategory));
    const grid = document.getElementById("cardGrid");

    if (!saved.length) {
      grid.innerHTML = emptyStateHtml();
    } else if (!visible.length) {
      grid.innerHTML = '<div class="empty-state">No saved businesses in that category.</div>';
    } else {
      grid.innerHTML = visible.map((biz) => bizCardHtml(biz, { showRemove: true })).join("");
    }

    document.getElementById("resultCount").textContent = saved.length
      ? `${visible.length} of ${saved.length} saved`
      : "";
  }

  function setupRemoveButtons() {
    document.getElementById("cardGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".remove-fav-btn");
      if (!btn) return;
      toggleFavourite(btn.dataset.id);
      renderGrid();
    });
  }

  renderChips();
  setupRemoveButtons();
  renderGrid();
})();
