// Owner reviews page: lets a business owner pick their listing (there's no
// real accounts/auth in this prototype) and reply publicly to its reviews.

(async function () {
  await hydrateFromApi();

  function populateBusinessSelect() {
    const select = document.getElementById("ownerBusinessSelect");
    [...BUSINESSES]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((biz) => {
        const opt = document.createElement("option");
        opt.value = biz.id;
        opt.textContent = `${biz.name} (${biz.area})`;
        select.appendChild(opt);
      });
  }

  function reviewRowHtml(biz, review) {
    const reply = getReply(biz.id, review.id);
    return `
      <div class="owner-review-row">
        <div class="review-card">
          <div class="review-top">
            <span class="review-name">${escapeHtml(review.name)}</span>
            <span class="review-date">${escapeHtml(review.date)}</span>
          </div>
          ${starsHtml(review.rating)}
          <p>${escapeHtml(review.text)}</p>
        </div>

        <form class="owner-reply-form" data-review-id="${review.id}">
          <label for="reply-${review.id}">${reply ? "Edit your reply" : "Write a reply"}</label>
          <textarea id="reply-${review.id}" rows="2" maxlength="500" placeholder="Thanks so much for the kind words...">${reply ? escapeHtml(reply.text) : ""}</textarea>
          <button class="btn-pill outline" type="submit">${reply ? "Update reply" : "Post reply"}</button>
        </form>
      </div>
    `;
  }

  function renderBusinessReviews(biz) {
    const root = document.getElementById("ownerRoot");
    const reviews = allReviews(biz);

    root.innerHTML = `
      <div class="section-heading">
        <h2>${escapeHtml(biz.name)}</h2>
        <p>${escapeHtml(biz.category)} &middot; ${escapeHtml(biz.area)}</p>
      </div>
      ${ratingSummaryHtml(biz)}
      ${
        reviews.length
          ? `<div class="owner-review-list">${reviews.map((r) => reviewRowHtml(biz, r)).join("")}</div>`
          : '<div class="empty-state">No reviews yet for this business.</div>'
      }
    `;

    root.querySelectorAll(".owner-reply-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const reviewId = form.dataset.reviewId;
        const text = form.querySelector("textarea").value.trim();
        if (!text) return;
        setReply(biz.id, reviewId, text);
        renderBusinessReviews(biz);
      });
    });
  }

  function setupSelect() {
    const select = document.getElementById("ownerBusinessSelect");
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get("business");

    select.addEventListener("change", () => {
      const biz = BUSINESSES.find((b) => b.id === select.value);
      if (biz) renderBusinessReviews(biz);
    });

    if (preselect && BUSINESSES.some((b) => b.id === preselect)) {
      select.value = preselect;
      renderBusinessReviews(BUSINESSES.find((b) => b.id === preselect));
    }
  }

  populateBusinessSelect();
  setupSelect();
})();
