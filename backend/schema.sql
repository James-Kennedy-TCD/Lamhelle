CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  blurb TEXT NOT NULL,
  tags TEXT NOT NULL,
  price_level INTEGER NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  photo_ids TEXT NOT NULL,
  hours TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  review_date TEXT NOT NULL,
  is_seed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS replies (
  review_id TEXT PRIMARY KEY REFERENCES reviews(id),
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
