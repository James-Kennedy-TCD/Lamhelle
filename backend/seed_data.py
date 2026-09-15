# Seed data, ported 1:1 from ../js/data.js. This is the single place both
# the frontend's offline fallback and the backend's database should agree
# with -- if you change one, change the other.

PHOTO_LIBRARY = {
    "Cafe": ["1453614512568-c4024d13c247", "1545418314-7ce0b9b53901", "1521017432531-fbd92d768814"],
    "Boutique Clothing": ["1441986300917-64674bd600d8", "1532453288672-3a27e9be9efd", "1546213290-e1b492ab3eee"],
    "Florist": ["1589244159943-460088ed5c92", "1531058240690-006c446962d8", "1487070183336-b863922373d4"],
    "Homeware": ["1740760540616-a3dd85e51352", "1740760540552-11d27a7e8df7", "1771033834141-023d630b3965"],
    "Gift Shop": ["1515711660811-48832a4c6f69", "1603912699214-92627f304eb6", "1598305762558-328f599df683"],
    "Bakery": ["1568254183919-78a4f43a2877", "1587241321921-91a834d6d191", "1583338917451-face2751d8d5"],
    "Bookshop": ["1566131807516-e3b3cd1a89d1", "1700906010457-c7a565935b81", "1643250048998-7ffa83ae2c63"],
    "Baby & Kids": ["1560506840-ec148e82a604", "1622218286192-95f6a20083c7", "1560859259-fcf2b952aed8"],
    "Specialist Service": ["1630272777562-17735957d8c0", "1623578059518-bbdb071eab81", "1584184924103-e310d9dc82fc"],
    "Deli": ["1615828700429-12144f98604f", "1610057052613-bb574bb4e4c9", "1511018953270-acf4f613483a"],
}

HOURS_PRESETS = {
    "Cafe": ["7:30–17:00", "7:30–17:00", "7:30–17:00", "7:30–17:00", "7:30–17:00", "8:00–17:00", "9:00–16:00"],
    "Bakery": ["7:00–17:30", "7:00–17:30", "7:00–17:30", "7:00–17:30", "7:00–17:30", "7:30–17:00", "8:30–14:00"],
    "Boutique Clothing": ["10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:30", "10:00–18:00", "12:00–17:00"],
    "Florist": ["9:00–18:00", "9:00–18:00", "9:00–18:00", "9:00–18:00", "9:00–18:00", "9:00–17:00", "Closed"],
    "Homeware": ["10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "12:00–17:00"],
    "Gift Shop": ["10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "10:00–18:00", "12:00–17:00"],
    "Bookshop": ["9:30–18:00", "9:30–18:00", "9:30–18:00", "9:30–18:00", "9:30–18:00", "9:30–18:00", "12:00–17:00"],
    "Baby & Kids": ["10:00–17:30", "10:00–17:30", "10:00–17:30", "10:00–17:30", "10:00–17:30", "10:00–17:30", "Closed"],
    "Specialist Service": ["9:00–17:30", "9:00–17:30", "9:00–17:30", "9:00–17:30", "9:00–17:30", "10:00–14:00", "Closed"],
    "Deli": ["8:00–19:00", "8:00–19:00", "8:00–19:00", "8:00–19:00", "8:00–19:00", "8:00–18:00", "9:00–17:00"],
}

REVIEWER_NAMES = [
    "Aoife", "Cian", "Niamh", "Sean", "Roisin", "Cathal", "Sinead", "Eoin",
    "Grainne", "Declan", "Aisling", "Fionn", "Orla", "Padraig", "Saoirse", "Conor",
]

REVIEW_DATES = ["5 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago", "2 months ago"]

REVIEW_TEMPLATES = {
    "Cafe": [
        {"rating": 5, "text": "My go-to spot for a flat white before work. Always consistent, and the staff remember your order."},
        {"rating": 4, "text": "Lovely atmosphere and great pastries, though it does get busy at the weekend."},
        {"rating": 5, "text": "Best coffee in the area, hands down. The daily bakes are worth the trip alone."},
    ],
    "Boutique Clothing": [
        {"rating": 5, "text": "Found the perfect outfit for a wedding here. The staff really know how to style you."},
        {"rating": 4, "text": "Great selection of Irish designers, a bit pricey but worth it for special pieces."},
        {"rating": 5, "text": "Always something unique in stock, never feels like a chain store."},
    ],
    "Florist": [
        {"rating": 5, "text": "Ordered a bouquet for my mother's birthday and it was even better than the photos."},
        {"rating": 5, "text": "Beautiful, seasonal arrangements every time. My go-to for last-minute gifts."},
        {"rating": 4, "text": "Gorgeous flowers, just wish they had slightly longer opening hours on Sundays."},
    ],
    "Homeware": [
        {"rating": 5, "text": "Such a lovely selection of Irish-made pieces. I bought three things I didn't plan to!"},
        {"rating": 4, "text": "Great quality homeware, a little pricey but you're paying for craftsmanship."},
        {"rating": 5, "text": "My favourite shop for gifts. Everything feels considered and well made."},
    ],
    "Gift Shop": [
        {"rating": 5, "text": "Always find something special here, great for last-minute presents."},
        {"rating": 4, "text": "Lovely handmade items, though stock can be limited on popular pieces."},
        {"rating": 5, "text": "The staff helped me pick the perfect gift. Really personal service."},
    ],
    "Bakery": [
        {"rating": 5, "text": "The sourdough is unreal, and the croissants are the best I've had outside of France."},
        {"rating": 5, "text": "Ordered a celebration cake and it was both stunning and delicious."},
        {"rating": 4, "text": "Great bakes, get there early as the good stuff sells out fast."},
    ],
    "Bookshop": [
        {"rating": 5, "text": "A proper independent bookshop with staff who actually read and recommend well."},
        {"rating": 4, "text": "Great Irish-interest section, cosy spot to browse on a rainy day."},
        {"rating": 5, "text": "My kids love the storytime mornings. It's become a weekly tradition for us."},
    ],
    "Baby & Kids": [
        {"rating": 5, "text": "Beautiful baby gifts, ordered a hamper and the presentation was gorgeous."},
        {"rating": 5, "text": "Lovely Irish-made knitwear, sized generously and washes really well."},
        {"rating": 4, "text": "Great range for newborns, a little more expensive than the high street but worth it."},
    ],
    "Specialist Service": [
        {"rating": 5, "text": "Fixed a dress that I thought was beyond saving. Brilliant work."},
        {"rating": 4, "text": "Reliable and fairly priced, though it's worth booking ahead as they get busy."},
        {"rating": 5, "text": "Excellent attention to detail, will definitely be back for future alterations."},
    ],
    "Deli": [
        {"rating": 5, "text": "Best cheese counter in South Dublin, the staff always have great recommendations."},
        {"rating": 4, "text": "Great picnic hampers, slightly pricey but the quality is obvious."},
        {"rating": 5, "text": "My weekly stop for local produce. Everything is always fresh."},
    ],
}

BUSINESSES = [
    {"id": "b1", "name": "The Ranelagh Roastery", "category": "Cafe", "area": "Ranelagh", "address": "14 Ranelagh Village, Dublin 6", "lat": 53.3252, "lng": -6.2540, "blurb": "Small-batch coffee roasted on site, with a daily-changing bake selection.", "tags": ["coffee", "brunch", "pastries"], "priceLevel": 2, "featured": True},
    {"id": "b2", "name": "Dundrum Bloom & Stem", "category": "Florist", "area": "Dundrum", "address": "3 Main Street, Dundrum, Dublin 14", "lat": 53.2905, "lng": -6.2450, "blurb": "Family-run florist specialising in seasonal Irish-grown flowers and wedding work.", "tags": ["flowers", "gifts", "weddings"], "priceLevel": 2, "featured": True},
    {"id": "b3", "name": "Sandymount Wool & Weave", "category": "Homeware", "area": "Sandymount", "address": "22 Sandymount Green, Dublin 4", "lat": 53.3323, "lng": -6.2168, "blurb": "Irish linen, knitwear throws and handmade ceramics for the home.", "tags": ["homeware", "irish-made", "gifts"], "priceLevel": 3, "featured": False},
    {"id": "b4", "name": "Rathmines Rare Books", "category": "Bookshop", "area": "Rathmines", "address": "56 Rathmines Road Lower, Dublin 6", "lat": 53.3231, "lng": -6.2653, "blurb": "New and second-hand books with a strong Irish-interest and poetry section.", "tags": ["books", "gifts", "quiet-browse"], "priceLevel": 1, "featured": False},
    {"id": "b5", "name": "Little Acorns Baby Co.", "category": "Baby & Kids", "area": "Terenure", "address": "8 Terenure Village, Dublin 6W", "lat": 53.3013, "lng": -6.2887, "blurb": "Baby gifts, hampers and Irish-made knitwear for newborns.", "tags": ["baby-gift", "newborn", "hampers"], "priceLevel": 2, "featured": True},
    {"id": "b6", "name": "Blackrock Boutique", "category": "Boutique Clothing", "area": "Blackrock", "address": "11 Main Street, Blackrock, Co. Dublin", "lat": 53.3020, "lng": -6.1780, "blurb": "Curated women's fashion from independent Irish and European designers.", "tags": ["fashion", "occasion-wear", "accessories"], "priceLevel": 3, "featured": False},
    {"id": "b7", "name": "Dun Laoghaire Deli & Provisions", "category": "Deli", "area": "Dun Laoghaire", "address": "45 George's Street Upper, Dun Laoghaire", "lat": 53.2938, "lng": -6.1319, "blurb": "Irish farmhouse cheeses, cured meats and picnic hampers by the harbour.", "tags": ["cheese", "picnic", "local-produce"], "priceLevel": 2, "featured": True},
    {"id": "b8", "name": "Dalkey Craft & Gift", "category": "Gift Shop", "area": "Dalkey", "address": "2 Castle Street, Dalkey, Co. Dublin", "lat": 53.2773, "lng": -6.1030, "blurb": "Handmade pottery, jewellery and cards from Irish makers.", "tags": ["gifts", "handmade", "jewellery"], "priceLevel": 2, "featured": False},
    {"id": "b9", "name": "Rathgar Bakehouse", "category": "Bakery", "area": "Rathgar", "address": "19 Rathgar Road, Dublin 6", "lat": 53.3138, "lng": -6.2686, "blurb": "Sourdough, viennoiserie and celebration cakes baked fresh every morning.", "tags": ["bakery", "sourdough", "celebration-cakes"], "priceLevel": 1, "featured": True},
    {"id": "b10", "name": "Stillorgan Stitch & Mend", "category": "Specialist Service", "area": "Stillorgan", "address": "Stillorgan Shopping Centre, Co. Dublin", "lat": 53.2789, "lng": -6.2050, "blurb": "Alterations, tailoring and bespoke fittings for every occasion.", "tags": ["tailoring", "alterations", "occasion-wear"], "priceLevel": 2, "featured": False},
    {"id": "b11", "name": "Donnybrook Home Studio", "category": "Homeware", "area": "Donnybrook", "address": "5 Donnybrook Road, Dublin 4", "lat": 53.3225, "lng": -6.2312, "blurb": "Irish-designed lighting, cushions and small furniture pieces.", "tags": ["homeware", "irish-made", "interiors"], "priceLevel": 3, "featured": False},
    {"id": "b12", "name": "Ballsbridge Petal Co.", "category": "Florist", "area": "Ballsbridge", "address": "60 Merrion Road, Ballsbridge, Dublin 4", "lat": 53.3298, "lng": -6.2276, "blurb": "Contemporary bouquets and same-day local delivery across South Dublin.", "tags": ["flowers", "same-day-delivery", "gifts"], "priceLevel": 2, "featured": True},
    {"id": "b13", "name": "Terenure Coffee Room", "category": "Cafe", "area": "Terenure", "address": "34 Terenure Road East, Dublin 6W", "lat": 53.3013, "lng": -6.2887, "blurb": "Neighbourhood cafe known for its all-day brunch and traybakes.", "tags": ["coffee", "brunch", "traybakes"], "priceLevel": 2, "featured": False},
    {"id": "b14", "name": "Dundrum Bookworm", "category": "Bookshop", "area": "Dundrum", "address": "17 Main Street, Dundrum, Dublin 14", "lat": 53.2905, "lng": -6.2450, "blurb": "Children's books, book clubs and an in-store storytime every Saturday.", "tags": ["books", "kids", "storytime"], "priceLevel": 1, "featured": False},
    {"id": "b15", "name": "Sandymount Style Edit", "category": "Boutique Clothing", "area": "Sandymount", "address": "9 Sandymount Green, Dublin 4", "lat": 53.3323, "lng": -6.2168, "blurb": "Everyday womenswear from Irish designers, sized inclusively.", "tags": ["fashion", "irish-designers", "everyday-wear"], "priceLevel": 2, "featured": True},
    {"id": "b16", "name": "Rathmines Green Grocer", "category": "Deli", "area": "Rathmines", "address": "12 Rathmines Road Upper, Dublin 6", "lat": 53.3231, "lng": -6.2653, "blurb": "Fresh local produce, deli counter and ready-made meals.", "tags": ["local-produce", "deli", "ready-meals"], "priceLevel": 1, "featured": False},
    {"id": "b17", "name": "Blackrock Framing & Gifts", "category": "Specialist Service", "area": "Blackrock", "address": "27 Main Street, Blackrock, Co. Dublin", "lat": 53.3020, "lng": -6.1780, "blurb": "Custom picture framing alongside a small curated gift corner.", "tags": ["framing", "gifts", "custom-work"], "priceLevel": 2, "featured": False},
    {"id": "b18", "name": "Dalkey Little Ones", "category": "Baby & Kids", "area": "Dalkey", "address": "14 Railway Road, Dalkey, Co. Dublin", "lat": 53.2773, "lng": -6.1030, "blurb": "Baby clothing, toys and christening gifts made in Ireland.", "tags": ["baby-gift", "toys", "christening"], "priceLevel": 2, "featured": False},
]


def seed_reviews_for(business_id, category):
    """Mirrors seedReviewsFor() in js/common.js exactly, so a fresh database
    shows the same sample reviews the offline frontend fallback would."""
    templates = REVIEW_TEMPLATES.get(category, [])
    if not templates:
        return []

    seed = sum(ord(ch) for ch in business_id)
    first = seed % len(templates)
    second = (first + 1) % len(templates)

    reviews = []
    for i, template_idx in enumerate([first, second]):
        reviews.append({
            "id": f"seed-{i}",
            "name": REVIEWER_NAMES[(seed + i * 5) % len(REVIEWER_NAMES)],
            "rating": templates[template_idx]["rating"],
            "text": templates[template_idx]["text"],
            "date": REVIEW_DATES[(seed + i * 3) % len(REVIEW_DATES)],
        })
    return reviews
