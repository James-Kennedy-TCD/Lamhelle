# Lámhelle (name under review)

**Live demo (static, no backend):** https://james-kennedy-tcd.github.io/Lamhelle/

A discovery platform that makes it as easy to find and support independent
Irish businesses as it is to shop from major online retailers.

There are two ways to run this: as a **static site** (no dependencies,
what the live demo above runs), or with the **real backend** in
[`backend/`](backend/), which persists businesses/reviews/replies/signups
to a database instead of the browser's localStorage. The frontend detects
which one it's talking to automatically — see [Backend](#backend) below.

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
  (free profile, matching the pitch's freemium model). Saves the
  application locally and, if the backend is running, server-side too;
  either way it also hands off to the visitor's own email client
  (pre-filled) so the application reaches the Lámhelle team.
- **Manage your reviews** (`owner-reviews.html`): a business owner picks
  their listing (no real accounts yet) and replies publicly to its
  reviews. Linked from every business profile and the site footer.

## Running locally

**Static only** (no build step or dependencies — what the live demo runs):

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Reviews/replies/favourites/signups are
stored in the browser's localStorage.

**With the real backend** (persists everything to a real database instead):

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip.exe install -r requirements.txt   # .venv/bin/pip on macOS/Linux
.venv/Scripts/python.exe run_server.py               # .venv/bin/python on macOS/Linux
```

Then open http://localhost:8100 — the backend serves the frontend itself
(same origin, so no CORS setup needed) alongside its `/api/*` routes.

## Backend

[`backend/`](backend/) is a small FastAPI + SQLite app (`lamhelle.db`,
created and seeded automatically on first run from
[`backend/seed_data.py`](backend/seed_data.py) — a Python port of
`js/data.js`, kept deliberately in sync with it). Routes:

| Route | Does |
|---|---|
| `GET /api/businesses` | All businesses, with photos/hours embedded |
| `GET /api/businesses/{id}` | One business |
| `GET /api/reviews` | Every business's reviews, replies embedded |
| `POST /api/businesses/{id}/reviews` | Submit a review |
| `POST /api/reviews/{id}/reply` | Owner reply (create or update) |
| `POST /api/signups` | Business owner application |
| `GET /api/signups` | List submitted applications (no admin login yet — see Next steps) |

**How the frontend picks between static and backend mode:** every page
calls `hydrateFromApi()` (in `js/common.js`) on load, which tries
`/api/businesses` and `/api/reviews` with a 2s timeout. If that succeeds,
the page runs entirely off the backend for the rest of the session
(reviews/replies/signups all hit `/api/*`, with an optimistic local update
so the UI feels instant while the request is in flight). If it fails —
no backend running, or a static host like GitHub Pages that can't run one
— everything falls back to the original localStorage-based behaviour with
zero functional difference to the visitor. The one visible side effect in
fallback mode: the browser's own devtools will log two harmless 404s per
page load (for the two failed `/api/*` requests) — that's the browser
logging the network failure itself, not something the app's `try/catch`
can suppress, and it doesn't affect anything working correctly.

**Deploying it for real:** GitHub Pages is static-only and can't run this,
so the current live demo link stays in static/localStorage mode. Putting
the backend somewhere that can run a Python process (Railway, Render, Fly.io,
etc.) — and pointing a real domain at it — is the natural next step, not
done here since it means creating/paying for a hosting account, which is
your call to make.

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
(`REVIEW_TEMPLATES`, picked deterministically per business — ported 1:1
between `js/data.js`/`js/common.js` for the static path and
`backend/seed_data.py` for the backend path) so the reviews section and
average rating aren't empty. Reviews submitted through the "Write a
review" form layer on top of the seeded ones, in localStorage or the
backend database depending on which mode is active.

## Next steps (from the original pitch)

- Broaden coverage beyond South Dublin
- Let business owners upload their own real photos
- Personalised recommendations
- **Owner accounts** — the biggest remaining gap. Anyone can currently open
  `owner-reviews.html`, pick any business, and reply as if they owned it;
  there's no login tying a reply to a verified owner yet
- An admin view for the `/api/signups` list (currently just a raw JSON
  endpoint, nothing browses it)
- Deploy the backend somewhere that can actually run it (see Backend above),
  and a business-side dashboard (freemium: free profile, paid
  promotion/insights)
- Loyalty rewards, click-and-collect, live stock availability
