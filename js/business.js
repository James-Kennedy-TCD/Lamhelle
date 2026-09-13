// Business profile page: renders one business's photos, hours and details
// based on the `id` query param, plus a few similar businesses.

(function () {
  const FAVOURITES_KEY = "lamhelle_favourites";

  function getFavourites() {
    try {
      return JSON.parse(localStorage.getItem(FAVOURITES_KEY)) || [];
    } catch {
      return [];
    }
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

  function notFoundHtml() {
    return `
      <div class="empty-state">
        <p>We couldn't find that business.</p>
        <a class="btn-link" href="recommended.html">Back to recommended</a>
      </div>
    `;
  }

  function similarBusinessesHtml(biz) {
    const similar = BUSINESSES.filter((b) => b.id !== biz.id && b.category === biz.category).slice(0, 3);
    if (!similar.length) return "";
    return `
      <div class="section-heading" style="margin-top:2rem;">
        <h2>More ${escapeHtml(biz.category)} nearby</h2>
      </div>
      <div class="card-grid">
        ${similar.map(bizCardHtml).join("")}
      </div>
    `;
  }

  function profileHtml(biz) {
    const favourited = getFavourites().includes(biz.id);
    return `
      <a class="btn-link back-link" href="recommended.html">&larr; Back</a>

      ${photoGalleryHtml(biz)}

      <div class="profile-header">
        <div>
          <div class="profile-title-row">
            <h1>${escapeHtml(biz.name)}</h1>
            ${biz.featured ? '<span class="badge featured">Recommended</span>' : ""}
          </div>
          <p class="biz-meta">${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)} &middot; ${priceLabel(biz.priceLevel)}</p>
          <p class="biz-meta">${escapeHtml(biz.address)}</p>
          ${openStatusHtml(biz)}
        </div>
        <button class="btn-pill outline" id="favBtn">${favourited ? "&#9829; Saved" : "&#9825; Save"}</button>
      </div>

      <p class="biz-blurb profile-about">${escapeHtml(biz.blurb)}</p>

      <div class="biz-tags">
        ${(biz.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>

      <div class="biz-actions profile-actions">
        <a class="btn-pill" href="${directionsUrl(biz)}" target="_blank" rel="noopener">Get directions</a>
        <a class="btn-pill outline" href="index.html?focus=${biz.id}">View on map</a>
      </div>

      <div class="profile-grid">
        <div>
          <div class="section-heading"><h2>Opening hours</h2></div>
          ${hoursTableHtml(biz)}
        </div>
      </div>

      ${similarBusinessesHtml(biz)}
    `;
  }

  function render() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const root = document.getElementById("profileRoot");
    const biz = BUSINESSES.find((b) => b.id === id);

    if (!biz) {
      root.innerHTML = notFoundHtml();
      return;
    }

    document.title = `${biz.name} — Lamhelle`;
    root.innerHTML = profileHtml(biz);

    const favBtn = document.getElementById("favBtn");
    favBtn.addEventListener("click", () => {
      const nowFavourited = toggleFavourite(biz.id);
      favBtn.innerHTML = nowFavourited ? "&#9829; Saved" : "&#9825; Save";
    });
  }

  render();
})();
