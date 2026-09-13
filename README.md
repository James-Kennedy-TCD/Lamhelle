# Lámhelle (name under review)

**Live demo:** https://james-kennedy-tcd.github.io/Lamhelle/

A discovery platform that makes it as easy to find and support independent
Irish businesses as it is to shop from major online retailers.

This is an early prototype focused on two views:

- **Map** (`index.html`): filter South Dublin independent businesses by
  category, shown on an interactive map. The search bar takes you to the
  search results page.
- **Search** (`search.html?q=...&category=...`): the search bar on every
  page lands here, with keyword and category results shareable via the URL.
- **Recommended** (`recommended.html`): a curated, category-filterable
  grid of picks for the week.
- **Business profile** (`business.html?id=...`): photos, opening hours,
  tags, similar businesses, a Save button, and reviews (see below).
- **Favourites** (`favourites.html`): businesses saved via the Save button,
  stored in this browser's localStorage (per-device, not synced).
- **List your business** (`signup.html`): a business owner signup form
  (free profile, matching the pitch's freemium model). There's no backend
  yet, so submitting saves the entry locally and hands off to the visitor's
  own email client (pre-filled) to actually reach the Lámhelle team.

## Running locally

No build step or dependencies are required, since it's a static site. From
this folder, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Data

Business listings live in [`js/data.js`](js/data.js) and are currently
sample/fictional data scoped to South Dublin (Ranelagh, Dundrum, Rathmines,
Sandymount, Blackrock, Dun Laoghaire, Dalkey, etc.) so the map and
recommendations work end-to-end. Replace this file with a real feed (API or
CMS) before launch.

Photos are stock images from [Unsplash](https://unsplash.com) (free to use
under the [Unsplash License](https://unsplash.com/license)), chosen per
category as stand-ins. `PHOTO_LIBRARY` in `js/data.js` maps each category to
a few photo IDs, and `businessPhotoIds()` in `js/common.js` rotates through
them so businesses in the same category don't show identical photo sets.
Replace these with each owner's real photos before launch.

Each business is also seeded with two sample reviews matched to its category
(`REVIEW_TEMPLATES` in `js/data.js`, picked deterministically per business in
`seedReviewsFor()` in `js/common.js`) so the reviews section and average
rating aren't empty. Reviews submitted through the "Write a review" form on
a business profile are stored in localStorage (`lamhelle_reviews`) and
layered on top of the seeded ones, again per-device until there's a backend.

## Next steps (from the original pitch)

- Broaden coverage beyond South Dublin
- Let business owners upload their own real photos
- Personalised recommendations
- A real backend for signups and reviews, and a business-side dashboard
  (freemium: free profile, paid promotion/insights)
- Loyalty rewards, click-and-collect, live stock availability
