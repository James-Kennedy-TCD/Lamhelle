import json
import sqlite3
from pathlib import Path

import seed_data

DB_PATH = Path(__file__).parent / "lamhelle.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_schema():
    conn = get_connection()
    conn.executescript(SCHEMA_PATH.read_text())
    conn.commit()
    conn.close()


def seed_if_empty():
    """Populates businesses + their seed reviews on first run only. Real
    submitted reviews/replies/signups are never touched here."""
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM businesses").fetchone()[0]
    if count > 0:
        conn.close()
        return

    for biz in seed_data.BUSINESSES:
        photo_ids = seed_data.PHOTO_LIBRARY.get(biz["category"], [])
        hours = seed_data.HOURS_PRESETS.get(biz["category"], ["Closed"] * 7)
        conn.execute(
            """INSERT INTO businesses
               (id, name, category, area, address, lat, lng, blurb, tags, price_level, featured, photo_ids, hours)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                biz["id"], biz["name"], biz["category"], biz["area"], biz["address"],
                biz["lat"], biz["lng"], biz["blurb"], json.dumps(biz["tags"]),
                biz["priceLevel"], int(biz["featured"]), json.dumps(photo_ids), json.dumps(hours),
            ),
        )

        for review in seed_data.seed_reviews_for(biz["id"], biz["category"]):
            conn.execute(
                """INSERT INTO reviews (id, business_id, name, rating, text, review_date, is_seed)
                   VALUES (?, ?, ?, ?, ?, ?, 1)""",
                (f"{biz['id']}-{review['id']}", biz["id"], review["name"], review["rating"], review["text"], review["date"]),
            )

    conn.commit()
    conn.close()
