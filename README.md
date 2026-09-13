# Lamhelle (name under review)

A discovery platform that makes it as easy to find and support independent
Irish businesses as it is to shop from major online retailers.

This is an early prototype focused on two views:

- **Map** (`index.html`) — search and filter South Dublin independent
  businesses by category or keyword, shown on an interactive map.
- **Recommended** (`recommended.html`) — a curated, filterable grid of
  picks for the week.

## Running locally

No build step or dependencies are required — it's a static site. From this
folder, run:

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

## Next steps (from the original pitch)

- Broaden coverage beyond South Dublin
- Business profiles with photos, hours, and story/heritage
- Customer reviews and personalised recommendations
- Business-side dashboard (freemium: free profile, paid promotion/insights)
- Loyalty rewards, click-and-collect, live stock availability
