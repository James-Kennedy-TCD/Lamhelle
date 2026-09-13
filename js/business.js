// Business profile page: renders one business's photos, hours and details
// based on the `id` query param, plus a few similar businesses.

(function () {
  function notFoundHtml() {
    return `
      <div class="empty-state">
        <p>We couldn't find that business.</p>
        <a class="btn-link" href="recommended.html">Back to recommended</a>
      </div>
    `;
  }

  function reviewsSectionInnerHtml(biz) {
    const reviews = allReviews(biz);
    return `
      ${ratingSummaryHtml(biz)}
      ${reviews.length ? `<div class="review-list">${reviews.map(reviewCardHtml).join("")}</div>` : ""}

      <div class="review-form-wrap">
        <h3>Write a review</h3>
        <form id="reviewForm" novalidate>
          <div class="form-row">
            <label for="reviewerName">Your name (optional)</label>
            <input id="reviewerName" name="reviewerName" type="text" placeholder="e.g. Aoife" />
          </div>
          <div class="form-row">
            <label for="rating">Rating *</label>
            <select id="rating" name="rating" required>
              <option value="" disabled selected>Choose a rating</option>
              <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733; Excellent</option>
              <option value="4">&#9733;&#9733;&#9733;&#9733; Good</option>
              <option value="3">&#9733;&#9733;&#9733; Average</option>
              <option value="2">&#9733;&#9733; Poor</option>
              <option value="1">&#9733; Terrible</option>
            </select>
          </div>
          <div class="form-row">
            <label for="comment">Your review *</label>
            <textarea id="comment" name="comment" required rows="3" maxlength="300" placeholder="What was your experience like?"></textarea>
          </div>
          <p class="form-error" id="reviewError" hidden>Please choose a rating and add a review.</p>
          <button class="btn-pill" type="submit">Post review</button>
        </form>
      </div>
    `;
  }

  function renderReviewsSection(biz) {
    const container = document.getElementById("reviewsSection");
    container.innerHTML = reviewsSectionInnerHtml(biz);

    const form = document.getElementById("reviewForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.reviewerName.value.trim() || "Anonymous";
      const rating = Number(form.elements.rating.value);
      const text = form.elements.comment.value.trim();

      if (!rating || !text) {
        document.getElementById("reviewError").hidden = false;
        return;
      }

      addReview(biz.id, { name, rating, text, date: "Just now" });
      renderReviewsSection(biz);
    });
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
    const favourited = isFavourited(biz.id);
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

      ${ratingSummaryHtml(biz)}

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

      <div class="section-heading" style="margin-top:2rem;">
        <h2>Reviews</h2>
      </div>
      <div id="reviewsSection"></div>

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

    document.title = `${biz.name} | Lámhelle`;
    root.innerHTML = profileHtml(biz);

    const favBtn = document.getElementById("favBtn");
    favBtn.addEventListener("click", () => {
      const nowFavourited = toggleFavourite(biz.id);
      favBtn.innerHTML = nowFavourited ? "&#9829; Saved" : "&#9825; Save";
    });

    renderReviewsSection(biz);
  }

  render();
})();
