import logging
import uuid
from typing import Dict, Any, List, Optional
from app.core.firebase import is_firebase_ready

logger = logging.getLogger("femtrex.firestore")

# Local in-memory DB fallback for local dev
_local_db: Dict[str, Dict[str, Any]] = {}

# Mock data definitions to seed the database (local and/or Firestore)
DEFAULT_FOUNDER_PROFILE = {
    "name": "Priya Sharma",
    "email": "priya@texcraft.in",
    "company": "TextCraft",
    "industry": "Textile Manufacturing",
    "initials": "PS",
    "location": "Maharashtra"
}

DEFAULT_SCHEMES = [
    {
        "id": "wep-accelerator",
        "name": "WEP Accelerator Program - Cohort 8",
        "type": "Accelerator",
        "description": "Women Entrepreneurship Platform accelerator offering grant funding, mentorship, market access and investor readiness.",
        "amount": "₹5 Lakhs + VC Access",
        "deadline": "20 Aug 2026",
        "sector": "All Sectors",
        "match": 81,
        "closingSoon": True,
        "womenOnly": True,
        "checklist": ["Pitch deck", "Founder profile", "Business registration", "Three month execution roadmap"]
    },
    {
        "id": "startup-seed",
        "name": "Startup India Seed Fund Scheme",
        "type": "Grant",
        "description": "Seed funding for early-stage startups to validate proof of concept and prototype development.",
        "amount": "₹20 Lakhs",
        "deadline": "15 Aug 2026",
        "sector": "Technology",
        "match": 79,
        "closingSoon": True,
        "womenOnly": False,
        "checklist": ["DPIIT recognition", "Prototype demo", "Budget plan", "Incubator application"]
    },
    {
        "id": "ficci-flo",
        "name": "FICCI FLO Women Startup Grant",
        "type": "Grant",
        "description": "Annual grant by FICCI Ladies Organisation for women-led startups demonstrating social and economic impact.",
        "amount": "₹3 Lakhs",
        "deadline": "10 Aug 2026",
        "sector": "All Sectors",
        "match": 76,
        "closingSoon": True,
        "womenOnly": True,
        "checklist": ["Impact statement", "Company profile", "Founder video", "Use-of-funds note"]
    },
    {
        "id": "msme-tech",
        "name": "MSME Technology Upgradation Fund",
        "type": "Grant",
        "description": "Capital subsidy for technology modernization in MSME units. Covers machinery, process upgrades and digital systems.",
        "amount": "₹25 Lakhs",
        "deadline": "30 Sep 2026",
        "sector": "Manufacturing",
        "match": 92,
        "closingSoon": False,
        "womenOnly": False,
        "checklist": ["Udyam certificate", "Vendor quotation", "Bank statement", "Technology upgrade proposal"]
    },
    {
        "id": "mudra-tarun",
        "name": "Pradhan Mantri Mudra Yojana - Tarun",
        "type": "Loan",
        "description": "Collateral-free loans up to ₹10 Lakhs for small business and micro enterprises under the Tarun category.",
        "amount": "₹10 Lakhs",
        "deadline": "Rolling",
        "sector": "All Sectors",
        "match": 91,
        "closingSoon": False,
        "womenOnly": False,
        "checklist": ["KYC documents", "Business plan", "Projected cash flow", "Bank application"]
    },
    {
        "id": "mahila-udyam",
        "name": "Mahila Udyam Nidhi Scheme",
        "type": "Loan",
        "description": "Soft loans for women-led small enterprises to establish or expand business operations.",
        "amount": "₹10 Lakhs",
        "deadline": "31 Dec 2026",
        "sector": "Women Entrepreneurs",
        "match": 88,
        "closingSoon": False,
        "womenOnly": True,
        "checklist": ["Entrepreneur profile", "Project report", "Collateral declaration", "Repayment estimate"]
    }
]

DEFAULT_READINESS_PILLARS = [
    {
        "id": "startup",
        "label": "Startup Readiness",
        "subtitle": "Business model, team, product-market fit",
        "score": 72,
        "status": "Developing",
        "color": "violet",
        "metrics": [
            {"label": "Business Model", "value": 80, "note": "Strong"},
            {"label": "Team Strength", "value": 65, "note": "Good"},
            {"label": "Product-Market Fit", "value": 70, "note": "Good"},
            {"label": "Execution Capability", "value": 75, "note": "Good"}
        ]
    },
    {
        "id": "funding",
        "label": "Funding Readiness",
        "subtitle": "Capital plan, documents, lender fit",
        "score": 58,
        "status": "Needs Work",
        "color": "pink",
        "metrics": [
            {"label": "Pitch Materials", "value": 54, "note": "Needs Work"},
            {"label": "Use of Funds", "value": 63, "note": "Developing"},
            {"label": "Revenue Evidence", "value": 57, "note": "Needs Work"},
            {"label": "Application Quality", "value": 61, "note": "Developing"}
        ]
    },
    {
        "id": "compliance",
        "label": "Compliance",
        "subtitle": "Registration, tax, licenses",
        "score": 85,
        "status": "Strong",
        "color": "mint",
        "metrics": [
            {"label": "Udyam Registration", "value": 95, "note": "Strong"},
            {"label": "GST Hygiene", "value": 78, "note": "Good"},
            {"label": "Licenses", "value": 84, "note": "Strong"},
            {"label": "Financial Records", "value": 83, "note": "Strong"}
        ]
    },
    {
        "id": "financial",
        "label": "Financial Health",
        "subtitle": "Cash flow, margins, repayment strength",
        "score": 63,
        "status": "Developing",
        "color": "amber",
        "metrics": [
            {"label": "Cash Flow", "value": 68, "note": "Good"},
            {"label": "Margin Quality", "value": 62, "note": "Developing"},
            {"label": "Receivables", "value": 57, "note": "Needs Work"},
            {"label": "Repayment Capacity", "value": 65, "note": "Good"}
        ]
    },
    {
        "id": "investor",
        "label": "Investor Readiness",
        "subtitle": "Deck, traction, narrative",
        "score": 54,
        "status": "Needs Work",
        "color": "blue",
        "metrics": [
            {"label": "Pitch Deck", "value": 51, "note": "Needs Work"},
            {"label": "Traction Proof", "value": 57, "note": "Needs Work"},
            {"label": "Market Story", "value": 60, "note": "Developing"},
            {"label": "Data Room", "value": 48, "note": "Needs Work"}
        ]
    }
]

DEFAULT_MENTORS = [
    {
        "id": "kavitha",
        "name": "Kavitha Reddy",
        "role": "D2C Textile Mentor",
        "expertise": ["Manufacturing", "Export", "Pricing"],
        "rating": 4.9,
        "sessions": 218,
        "price": "Free through WEP",
        "nextSlot": "Today, 6:30 PM",
        "review": "Helped me turn a grant application into a clear two-page funding story."
    },
    {
        "id": "ananya",
        "name": "Ananya Singh",
        "role": "Seed Fund Advisor",
        "expertise": ["Grants", "Investor Decks", "Government Schemes"],
        "rating": 4.8,
        "sessions": 164,
        "price": "₹499 / 15 min",
        "nextSlot": "Tomorrow, 10:00 AM",
        "review": "Very tactical. I left with exact changes for my pitch deck."
    },
    {
        "id": "meera",
        "name": "Meera Kapoor",
        "role": "MSME Finance Operator",
        "expertise": ["Loans", "Cash Flow", "Compliance"],
        "rating": 4.7,
        "sessions": 132,
        "price": "₹399 / 15 min",
        "nextSlot": "Fri, 2:15 PM",
        "review": "Mapped the right lender and fixed our checklist in one session."
    }
]

DEFAULT_CONVERSATIONS = [
    {
        "id": "msme",
        "title": "MSME Grant Eligibility",
        "preview": "You qualify for 3 schemes under M...",
        "time": "1d ago"
    },
    {
        "id": "funding-readiness",
        "title": "Improving Funding Readiness",
        "preview": "Your funding readiness is at 67%...",
        "time": "3d ago"
    },
    {
        "id": "mentor-agri",
        "title": "Mentor for Agri-Tech",
        "preview": "I found 2 mentors with agri-tech ex...",
        "time": "3d ago"
    }
]

db_client = None
if is_firebase_ready():
    try:
        from firebase_admin import firestore
        db_client = firestore.client()
    except Exception as e:
        logger.error(f"Failed to load Firestore client: {e}. Falling back to memory DB.")

def get_db():
    return db_client

async def save_document(collection_name: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    client = get_db()
    if client:
        try:
            doc_ref = client.collection(collection_name).document(doc_id)
            doc_ref.set(data, merge=True)
            return {"id": doc_id, **data}
        except Exception as e:
            logger.error(f"Firestore save_document error: {e}. Falling back to memory store.")

    if collection_name not in _local_db:
        _local_db[collection_name] = {}
    existing = _local_db[collection_name].get(doc_id, {})
    merged = {**existing, **data}
    _local_db[collection_name][doc_id] = merged
    return {"id": doc_id, **merged}

async def create_document(collection_name: str, data: Dict[str, Any], doc_id: Optional[str] = None) -> Dict[str, Any]:
    actual_id = doc_id or str(uuid.uuid4())
    client = get_db()
    if client:
        try:
            doc_ref = client.collection(collection_name).document(actual_id)
            doc_ref.set(data)
            return {"id": actual_id, **data}
        except Exception as e:
            logger.error(f"Firestore create_document error: {e}. Falling back to memory store.")

    if collection_name not in _local_db:
        _local_db[collection_name] = {}
    _local_db[collection_name][actual_id] = data
    return {"id": actual_id, **data}

async def read_document(collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
    client = get_db()
    if client:
        try:
            doc_ref = client.collection(collection_name).document(doc_id)
            doc_snap = doc_ref.get()
            if doc_snap.exists:
                return {"id": doc_snap.id, **doc_snap.to_dict()}
            return None
        except Exception as e:
            logger.error(f"Firestore read_document error: {e}. Falling back to memory store.")

    if collection_name in _local_db:
        if doc_id in _local_db[collection_name]:
            return {"id": doc_id, **_local_db[collection_name][doc_id]}
    return None

async def list_documents(collection_name: str) -> List[Dict[str, Any]]:
    client = get_db()
    if client:
        try:
            docs = client.collection(collection_name).stream()
            return [{"id": d.id, **d.to_dict()} for d in docs]
        except Exception as e:
            logger.error(f"Firestore list_documents error: {e}. Falling back to memory store.")

    if collection_name in _local_db:
        return [{"id": k, **v} for k, v in _local_db[collection_name].items()]
    return []

async def delete_document(collection_name: str, doc_id: str) -> bool:
    client = get_db()
    if client:
        try:
            client.collection(collection_name).document(doc_id).delete()
            return True
        except Exception as e:
            logger.error(f"Firestore delete_document error: {e}. Falling back to memory store.")

    if collection_name in _local_db:
        if doc_id in _local_db[collection_name]:
            del _local_db[collection_name][doc_id]
            return True
    return False

async def verify_firestore_connectivity() -> bool:
    """
    Returns True if Firestore is reachable.
    If using the local fallback, returns True (mock status).
    """
    client = get_db()
    if not client:
        # If running in mock dev mode, Firestore verification returns True
        # but registers a warning.
        logger.debug("Firestore in mock mode. Connection verification returns True.")
        return True
    try:
        # Check connectivity by performing a dummy fetch
        client.collection("health_check").document("ping").get()
        return True
    except Exception as e:
        logger.error(f"Firestore connection check failed: {e}")
        return False

# Initialize database seed data
async def seed_database():
    """
    Seeds default mock profiles, mentors, and schemes into Firestore or memory database
    if they do not already exist.
    """
    logger.info("Seeding database default values...")
    
    # Seed Founder profile
    await save_document("profiles", "priya-demo", DEFAULT_FOUNDER_PROFILE)

    # Seed Readiness Pillars
    await save_document("passport", "priya-demo", {"pillars": DEFAULT_READINESS_PILLARS})

    # Seed Schemes
    for scheme in DEFAULT_SCHEMES:
        await save_document("schemes", scheme["id"], scheme)

    # Seed Mentors
    for mentor in DEFAULT_MENTORS:
        await save_document("mentors", mentor["id"], mentor)

    # Seed Chat History
    for chat in DEFAULT_CONVERSATIONS:
        await save_document("chat_history", chat["id"], chat)

    logger.info("Database seeding completed.")
