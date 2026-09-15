import json
import re
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import db

FRONTEND_DIR = Path(__file__).parent.parent

app = FastAPI(title="Lámhelle API")


@app.on_event("startup")
def startup():
    db.init_schema()
    db.seed_if_empty()


def business_row_to_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "area": row["area"],
        "address": row["address"],
        "lat": row["lat"],
        "lng": row["lng"],
        "blurb": row["blurb"],
        "tags": json.loads(row["tags"]),
        "priceLevel": row["price_level"],
        "featured": bool(row["featured"]),
        "photoIds": json.loads(row["photo_ids"]),
        "hours": json.loads(row["hours"]),
    }


@app.get("/api/businesses")
def list_businesses():
    conn = db.get_connection()
    rows = conn.execute("SELECT * FROM businesses ORDER BY name").fetchall()
    conn.close()
    return [business_row_to_dict(r) for r in rows]


@app.get("/api/businesses/{business_id}")
def get_business(business_id: str):
    conn = db.get_connection()
    row = conn.execute("SELECT * FROM businesses WHERE id = ?", (business_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Business not found")
    return business_row_to_dict(row)


@app.get("/api/reviews")
def list_all_reviews():
    """All reviews for all businesses, grouped by business id, with any
    owner reply embedded. Fetched once by the frontend rather than per
    business, since the whole dataset is tiny."""
    conn = db.get_connection()
    rows = conn.execute(
        """SELECT r.id, r.business_id, r.name, r.rating, r.text, r.review_date,
                  r.is_seed, r.created_at, rep.text AS reply_text, rep.created_at AS reply_created_at
           FROM reviews r
           LEFT JOIN replies rep ON rep.review_id = r.id
           ORDER BY r.is_seed ASC, r.created_at DESC"""
    ).fetchall()
    conn.close()

    grouped = {}
    for r in rows:
        grouped.setdefault(r["business_id"], []).append({
            "id": r["id"],
            "name": r["name"],
            "rating": r["rating"],
            "text": r["text"],
            "date": r["review_date"],
            "reply": {"text": r["reply_text"], "date": "Just now"} if r["reply_text"] else None,
        })
    return grouped


class ReviewIn(BaseModel):
    name: str = Field(default="Anonymous", max_length=80)
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=1, max_length=1000)


@app.post("/api/businesses/{business_id}/reviews")
def create_review(business_id: str, review: ReviewIn):
    conn = db.get_connection()
    exists = conn.execute("SELECT 1 FROM businesses WHERE id = ?", (business_id,)).fetchone()
    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Business not found")

    review_id = f"r{uuid.uuid4().hex[:12]}"
    name = (review.name or "").strip() or "Anonymous"
    conn.execute(
        """INSERT INTO reviews (id, business_id, name, rating, text, review_date, is_seed)
           VALUES (?, ?, ?, ?, ?, 'Just now', 0)""",
        (review_id, business_id, name, review.rating, review.text.strip()),
    )
    conn.commit()
    conn.close()
    return {"id": review_id, "name": name, "rating": review.rating, "text": review.text.strip(), "date": "Just now", "reply": None}


class ReplyIn(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


@app.post("/api/reviews/{review_id}/reply")
def create_or_update_reply(review_id: str, reply: ReplyIn):
    conn = db.get_connection()
    exists = conn.execute("SELECT 1 FROM reviews WHERE id = ?", (review_id,)).fetchone()
    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Review not found")

    conn.execute(
        """INSERT INTO replies (review_id, text) VALUES (?, ?)
           ON CONFLICT(review_id) DO UPDATE SET text = excluded.text, created_at = datetime('now')""",
        (review_id, reply.text.strip()),
    )
    conn.commit()
    conn.close()
    return {"text": reply.text.strip(), "date": "Just now"}


class SignupIn(BaseModel):
    businessName: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=60)
    area: str = Field(min_length=1, max_length=80)
    address: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=500)
    contactName: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=200)
    phone: str | None = None
    website: str | None = None


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@app.post("/api/signups")
def create_signup(signup: SignupIn):
    if not EMAIL_RE.match(signup.email):
        raise HTTPException(status_code=422, detail="Invalid email address")

    conn = db.get_connection()
    conn.execute(
        """INSERT INTO signups (business_name, category, area, address, description, contact_name, email, phone, website)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            signup.businessName.strip(), signup.category.strip(), signup.area.strip(),
            signup.address.strip(), signup.description.strip(), signup.contactName.strip(),
            signup.email.strip(), (signup.phone or "").strip() or None, (signup.website or "").strip() or None,
        ),
    )
    conn.commit()
    conn.close()
    return {"status": "saved"}


@app.get("/api/signups")
def list_signups():
    """No admin auth yet (matches the rest of the prototype) -- exists so
    submitted applications are actually visible somewhere, not just sitting
    silently in the database."""
    conn = db.get_connection()
    rows = conn.execute("SELECT * FROM signups ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# Serve the static frontend (same origin as the API, so no CORS setup needed).
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
