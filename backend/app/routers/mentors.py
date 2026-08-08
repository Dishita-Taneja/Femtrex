"""
Smart Mentor Match
- POST /mentors/seed             — populates Firestore with 10 realistic mentors (idempotent)
- GET  /mentors/match?uid={uid}  — tag overlap + Gemini "why this fits" explanations
- POST /mentors/{mentor_id}/book — books a session, saves to Firestore
- GET  /mentors                  — list/filter
"""
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Query, Depends, HTTPException, Path, Body
from pydantic import BaseModel
from app.db.firestore import (
    list_documents, read_document, save_document,
    create_document, DEFAULT_FOUNDER_PROFILE
)
from app.models.mentor import Mentor, MentorRegistrationRequest, MentorProfile
from app.core.firebase import get_current_user
from app.ai.gemini_utils import _call_gemini_json

logger = logging.getLogger("femtrex.mentors")
router = APIRouter(tags=["mentors"])

# -------------------------------------------------------------------
# Seed data — 10 realistic mentors
# -------------------------------------------------------------------
SEED_MENTORS = [
    {
        "id": "kavitha-reddy",
        "name": "Kavitha Reddy",
        "role": "D2C Textile & Export Mentor",
        "expertise": ["Manufacturing", "Export", "Pricing", "D2C", "Textile"],
        "industry": "Textile Manufacturing",
        "years_experience": 18,
        "rating": 4.9,
        "sessions": 218,
        "price": "Free through WEP",
        "nextSlot": "Today, 6:30 PM",
        "bio": "18 years in textile manufacturing and exports. Built a ₹40 Cr D2C brand from a single loom. Specialist in export compliance, pricing strategy, and government scheme applications for MSME textile units.",
        "tags": ["Manufacturing", "Export", "Textile", "MSME", "Women Entrepreneurs", "Pricing", "D2C"],
        "review": "Helped me turn a grant application into a clear two-page funding story."
    },
    {
        "id": "ananya-singh",
        "name": "Ananya Singh",
        "role": "Seed Fund & Government Scheme Advisor",
        "expertise": ["Grants", "Investor Decks", "Government Schemes", "Fundraising", "DPIIT"],
        "industry": "Startup Ecosystem",
        "years_experience": 12,
        "rating": 4.8,
        "sessions": 164,
        "price": "₹499 / 15 min",
        "nextSlot": "Tomorrow, 10:00 AM",
        "bio": "Ex-SIDBI venture capital analyst. Has helped 60+ startups secure over ₹25 Crore in seed funding and government grants including Stand-Up India, WEP, and Startup India Seed Fund.",
        "tags": ["Grants", "Government Schemes", "Fundraising", "Investor Decks", "DPIIT", "Seed Stage", "Women Entrepreneurs"],
        "review": "Very tactical. I left with exact changes for my pitch deck."
    },
    {
        "id": "meera-kapoor",
        "name": "Meera Kapoor",
        "role": "MSME Finance & Compliance Operator",
        "expertise": ["Loans", "Cash Flow", "Compliance", "Udyam", "GST", "MSME"],
        "industry": "Financial Services",
        "years_experience": 15,
        "rating": 4.7,
        "sessions": 132,
        "price": "₹399 / 15 min",
        "nextSlot": "Fri, 2:15 PM",
        "bio": "Chartered Accountant with 15 years specialising in MSME finance. Expert in Mudra loans, CGTMSE guarantees, Udyam registration, and GST compliance. Helped 200+ MSMEs get collateral-free credit.",
        "tags": ["Loans", "MSME", "Cash Flow", "Compliance", "GST", "Udyam", "Manufacturing", "Banking"],
        "review": "Mapped the right lender and fixed our checklist in one session."
    },
    {
        "id": "sunita-nair",
        "name": "Sunita Nair",
        "role": "AgriTech & Rural Enterprise Advisor",
        "expertise": ["Agriculture", "Rural Business", "SHG", "NABARD", "Food Processing"],
        "industry": "Agriculture",
        "years_experience": 14,
        "rating": 4.8,
        "sessions": 95,
        "price": "Free through NABARD program",
        "nextSlot": "Mon, 11:00 AM",
        "bio": "Former NABARD district manager. Specialises in rural women entrepreneurs, SHG linkage banking, agri-enterprise setup, food processing units, and MKSP scheme navigation.",
        "tags": ["Agriculture", "Rural Business", "NABARD", "Food Processing", "SHG", "Women Entrepreneurs", "Government Schemes"],
        "review": "Helped our SHG link to the bank and get our first ₹5 Lakh credit."
    },
    {
        "id": "preethi-rajan",
        "name": "Preethi Rajan",
        "role": "Technology Startup & Product Mentor",
        "expertise": ["Technology", "Product Development", "SaaS", "DPIIT", "Startup India"],
        "industry": "Technology",
        "years_experience": 10,
        "rating": 4.6,
        "sessions": 87,
        "price": "₹599 / 30 min",
        "nextSlot": "Sat, 4:00 PM",
        "bio": "Built and sold two B2B SaaS startups. Deep expertise in DPIIT recognition, Startup India benefits, IT scheme applications, and product-market fit for tech founders.",
        "tags": ["Technology", "SaaS", "DPIIT", "Startup India", "Product Development", "Seed Stage", "Fundraising"],
        "review": "Cut our DPIIT application process from 3 months to 3 weeks."
    },
    {
        "id": "deepa-varma",
        "name": "Deepa Varma",
        "role": "Retail & D2C Brand Builder",
        "expertise": ["Retail", "D2C", "E-commerce", "Brand Building", "Marketing"],
        "industry": "Retail",
        "years_experience": 11,
        "rating": 4.7,
        "sessions": 143,
        "price": "₹349 / 15 min",
        "nextSlot": "Wed, 3:30 PM",
        "bio": "Scaled a handloom brand from local fairs to ₹8 Cr annual e-commerce revenue. Expert in marketplace strategy, D2C brand building, pricing, and working capital management for retail businesses.",
        "tags": ["Retail", "D2C", "E-commerce", "Brand Building", "Handloom", "Textile", "Marketing"],
        "review": "In one session she rewired our entire pricing strategy and doubled our margin."
    },
    {
        "id": "rohini-krishna",
        "name": "Rohini Krishna",
        "role": "Investor Relations & Fundraising Strategist",
        "expertise": ["Investor Relations", "Fundraising", "Pitch Deck", "Angel Investors", "VC"],
        "industry": "Finance",
        "years_experience": 9,
        "rating": 4.9,
        "sessions": 76,
        "price": "₹799 / 30 min",
        "nextSlot": "Tue, 5:00 PM",
        "bio": "Ex-investment banker and angel investor. Has evaluated 300+ pitch decks, helped 40 women-led startups close angel and pre-seed rounds. Expert in crafting investor narratives and data rooms.",
        "tags": ["Investor Relations", "Fundraising", "Pitch Deck", "Angel Investors", "VC", "Growth Stage", "Women Entrepreneurs"],
        "review": "Her data room template alone helped us close our angel round in 6 weeks."
    },
    {
        "id": "lalitha-bai",
        "name": "Lalitha Bai",
        "role": "Handicraft & Artisan Enterprise Expert",
        "expertise": ["Handicraft", "Artisan", "Export", "GI Tags", "Government Subsidies"],
        "industry": "Handicraft",
        "years_experience": 20,
        "rating": 4.8,
        "sessions": 189,
        "price": "Free through WEP / TREAD",
        "nextSlot": "Thu, 2:00 PM",
        "bio": "20+ years in artisan enterprise development. Expert in GI tagging, TREAD scheme, craft cluster subsidies, export certification for handicrafts, and linking artisans to retail markets.",
        "tags": ["Handicraft", "Artisan", "Export", "GI Tags", "TREAD", "Government Subsidies", "Rural Business"],
        "review": "She navigated the GI tag process for our block printing cluster in just 4 months."
    },
    {
        "id": "vijaya-lakshmi",
        "name": "Vijaya Lakshmi",
        "role": "Food & Beverage Business Coach",
        "expertise": ["Food Processing", "FSSAI", "Food Business", "Packaging", "B2B Sales"],
        "industry": "Food & Beverage",
        "years_experience": 13,
        "rating": 4.6,
        "sessions": 112,
        "price": "₹299 / 15 min",
        "nextSlot": "Mon, 9:30 AM",
        "bio": "Built a ₹15 Cr packaged food brand from a home kitchen. Expert in FSSAI licensing, food packaging regulations, supply chain for F&B, and scaling from catering to organised retail.",
        "tags": ["Food Processing", "FSSAI", "Food Business", "Packaging", "Annapurna Scheme", "Women Entrepreneurs"],
        "review": "Got our FSSAI license in 2 weeks and Annapurna loan approved in 30 days with her guidance."
    },
    {
        "id": "shobha-patel",
        "name": "Shobha Patel",
        "role": "Export & International Trade Advisor",
        "expertise": ["Export", "International Trade", "DGFT", "Forex", "Trade Finance"],
        "industry": "All Sectors",
        "years_experience": 16,
        "rating": 4.7,
        "sessions": 154,
        "price": "₹499 / 20 min",
        "nextSlot": "Fri, 11:00 AM",
        "bio": "16 years in international trade, DGFT consulting, and forex management. Specialises in helping Indian MSMEs export for the first time — covering IEC codes, trade agreements, letter of credit, and export incentive schemes.",
        "tags": ["Export", "DGFT", "Trade Finance", "Manufacturing", "Textile", "Handicraft", "International Markets"],
        "review": "Her export roadmap saved us from 3 common mistakes first-time exporters make."
    }
]

def _generate_mentor_why_fits(profile: dict, mentor: dict) -> str:
    """Generates a highly personalized match reason if the AI is unavailable."""
    company = profile.get("company", "your business")
    industry = profile.get("industry", "Textile Manufacturing").lower()
    
    mid = mentor.get("id", "")
    role = mentor.get("role", "")
    
    if mid == "kavitha-reddy":
        return f"Kavitha's 18 years in Textile Manufacturing directly matches {company}'s sector to guide you on MSME schemes and exports."
    elif mid == "ananya-singh":
        return f"Ananya can assist {company} with securing seed grants like Stand-Up India and preparing investor pitch decks."
    elif mid == "meera-kapoor":
        return f"Meera is a perfect finance fit to help {company} secure Mudra loans and set up GST/Udyam compliance."
    elif mid == "sunita-nair":
        return f"Sunita's agricultural focus aligns with sourcing raw cotton or organic fibers for your {industry} company."
    elif mid == "preethi-rajan":
        return f"Preethi provides excellent tech and product guidance, helping {company} establish a digital-first SaaS/D2C platform."
    elif mid == "deepa-varma":
        return f"Deepa can guide {company} on retail branding and scaling your offline handloom sales to D2C e-commerce."
    elif mid == "rohini-krishna":
        return f"Rohini's venture connections will help refine {company}'s equity narrative and set up your seed-round data room."
    elif mid == "lalitha-bai":
        return f"Lalitha specializes in artisan cluster subsidies and GI tags, key to sourcing authentic materials for {company}."
    elif mid == "vijaya-lakshmi":
        return f"Vijaya's experience scaling home kitchens to commercial operations supports packaging and scaling B2B distribution."
    elif mid == "shobha-patel":
        return f"Shobha's expertise in international DGFT trade and trade finance is ideal for expanding {company}'s export markets."
        
    return f"Strong expertise overlap in {', '.join(mentor.get('expertise', [])[:3])} relevant to your {industry} business."

# -------------------------------------------------------------------
# POST /mentors/seed
# -------------------------------------------------------------------
@router.post("/mentors/seed")
async def seed_mentors(current_user_uid: str = Depends(get_current_user)):
    """
    Populates Firestore with 10 realistic mentor profiles.
    Idempotent — safe to re-run, updates existing records.
    """
    seeded = []
    for mentor in SEED_MENTORS:
        mentor_data = {k: v for k, v in mentor.items()}
        mentor_data["seeded_at"] = datetime.now(timezone.utc).isoformat()
        await save_document("mentors", mentor["id"], mentor_data)
        seeded.append({"id": mentor["id"], "name": mentor["name"]})

    return {
        "status": "ok",
        "seeded_count": len(seeded),
        "mentors": seeded
    }

# -------------------------------------------------------------------
# POST /mentors/register
# -------------------------------------------------------------------
@router.post("/mentors/register", response_model=MentorProfile)
async def register_mentor(
    request: MentorRegistrationRequest,
    current_user_uid: str = Depends(get_current_user)
):
    """
    Registers a new mentor by saving their profile to Firestore under mentors/{uid}.

    - Accepts only user-supplied fields (name, role, expertise, industry,
      years_experience, price, bio, tags).
    - System fields (rating, sessions, review, nextSlot) are always initialised
      to their zero/empty defaults — never accepted from the client.
    - Uses the authenticated Firebase uid as the Firestore document id, so the
      same document is immediately returned by GET /mentors/match without any
      extra step.
    - Idempotent: re-submitting overwrites with the latest form data.
    """
    resolved_tags = request.tags if request.tags else list(request.expertise)

    try:
        years_exp = int(request.years_experience)
    except (ValueError, TypeError):
        years_exp = 0

    profile_data = {
        "id": current_user_uid,
        "name": request.name,
        "role": request.role,
        "expertise": list(request.expertise),
        "industry": request.industry,
        "years_experience": years_exp,
        "rating": 0.0,
        "sessions": 0,
        "price": request.price,
        "nextSlot": "TBD",
        "bio": request.bio,
        "tags": resolved_tags,
        "review": "",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    saved = await save_document("mentors", current_user_uid, profile_data)
    logger.info(f"Registered new mentor uid={current_user_uid} name={request.name}")

    return MentorProfile(**{k: v for k, v in saved.items() if k != "id"}, id=current_user_uid)


# -------------------------------------------------------------------
@router.get("/mentors/match")
async def match_mentors(
    uid: str = Query(default="priya-demo"),
    top_k: int = Query(default=5, ge=1, le=10),
    current_user_uid: str = Depends(get_current_user)
):
    """
    1. Loads founder profile and all mentors from Firestore
    2. Scores each mentor by tag overlap with founder's industry/goals
    3. Calls Gemini/Grok for a personalised "why this fits" explanation per top match
    4. Returns ranked mentor list
    """
    # Load founder profile
    profile = await read_document("profiles", uid)
    if not profile:
        profile = DEFAULT_FOUNDER_PROFILE.copy()
        logger.info(f"Using default profile for uid={uid}")

    founder_industry = profile.get("industry", "Textile Manufacturing")
    founder_goals = profile.get("goals") or ["expand", "government funding"]
    if isinstance(founder_goals, str):
        founder_goals = [founder_goals]
    founder_challenges = profile.get("challenges") or ["compliance", "loans"]
    if isinstance(founder_challenges, str):
        founder_challenges = [founder_challenges]

    # Build founder tag set (industry words + goal keywords)
    founder_tags = set()
    for word in founder_industry.split():
        founder_tags.add(word.lower())
    for goal in founder_goals:
        for word in goal.split():
            founder_tags.add(word.lower())
    for ch in founder_challenges:
        for word in ch.split():
            founder_tags.add(word.lower())

    # Load all mentors
    raw_mentors = await list_documents("mentors")
    if not raw_mentors:
        # Auto seed if empty to avoid 400 errors for the user
        await seed_mentors(current_user_uid)
        raw_mentors = await list_documents("mentors")

    # Score each mentor by tag overlap
    scored = []
    for m in raw_mentors:
        mentor_tags = set(t.lower() for t in m.get("tags", m.get("expertise", [])))
        mentor_words = set()
        for tag in mentor_tags:
            mentor_words.update(tag.split())
        mentor_words.update(m.get("industry", "").lower().split())

        overlap = len(founder_tags & mentor_words)
        tag_match_pct = min(round((overlap / max(len(founder_tags), 1)) * 100), 100)
        
        # Give special industry boost if exact match
        if m.get("industry", "").lower() == founder_industry.lower():
            tag_match_pct = min(100, tag_match_pct + 25)

        scored.append({
            "id": m.get("id"),
            "name": m.get("name"),
            "role": m.get("role"),
            "expertise": m.get("expertise", []),
            "industry": m.get("industry", ""),
            "years_experience": m.get("years_experience", 0),
            "rating": m.get("rating", 4.5),
            "sessions": m.get("sessions", 0),
            "price": m.get("price", "Contact for pricing"),
            "nextSlot": m.get("nextSlot", "TBD"),
            "bio": m.get("bio", ""),
            "tags": list(mentor_tags),
            "review": m.get("review", ""),
            "tag_overlap": overlap,
            "tag_match_pct": tag_match_pct,
        })

    # Sort by tag overlap descending
    scored.sort(key=lambda x: (x["tag_match_pct"], x["rating"]), reverse=True)
    top_matches = scored[:top_k]

    mentors_for_prompt = [
        {
            "id": m["id"],
            "name": m["name"],
            "role": m["role"],
            "expertise": m["expertise"],
            "bio": m["bio"][:150]
        }
        for m in top_matches
    ]

    gemini_prompt = f"""
You are a mentor matching expert for Indian women entrepreneurs.

Founder Profile:
- Industry: {founder_industry}
- Goals: {', '.join(founder_goals)}
- Challenges: {', '.join(founder_challenges)}

For each mentor below, write ONE concise sentence (max 20 words) explaining why they are a strong fit for THIS specific founder.
Return a JSON array with exactly one object per mentor:
{{"mentor_id": "<id>", "why_fits": "<one sentence>"}}

Mentors:
{json.dumps(mentors_for_prompt, indent=2)}
"""

    gemini_explanations = _call_gemini_json(gemini_prompt)
    explanations_map = {}
    if isinstance(gemini_explanations, list):
        for item in gemini_explanations:
            if isinstance(item, dict) and "mentor_id" in item:
                explanations_map[item["mentor_id"]] = item.get("why_fits", "")

    # Assemble final response
    results = []
    for m in top_matches:
        mid = m["id"]
        fallback_why = _generate_mentor_why_fits(profile, m)
        results.append({
            "id": mid,
            "name": m["name"],
            "role": m["role"],
            "expertise": m["expertise"],
            "rating": m["rating"],
            "sessions": m["sessions"],
            "price": m["price"],
            "nextSlot": m["nextSlot"],
            "review": m["review"],
            "years_experience": m["years_experience"],
            "tag_match_pct": m["tag_match_pct"],
            "why_fits": explanations_map.get(mid) or fallback_why,
            "ai_explained": bool(explanations_map.get(mid)),
        })

    return {
        "founder": {
            "uid": uid,
            "industry": founder_industry,
            "goals": founder_goals
        },
        "total_mentors_evaluated": len(raw_mentors),
        "top_matches": results
    }

# -------------------------------------------------------------------
# POST /mentors/{mentor_id}/book
# -------------------------------------------------------------------
class BookingRequest(BaseModel):
    agenda: List[str]
    preferred_slot: Optional[str] = None
    notes: Optional[str] = None

class BookingConfirmation(BaseModel):
    booking_id: str
    mentor_id: str
    mentor_name: str
    status: str
    agenda: List[str]
    preferred_slot: Optional[str]
    notes: Optional[str]
    created_at: str
    uid: str

@router.post("/mentors/{mentor_id}/book", response_model=BookingConfirmation)
async def book_mentor_session(
    mentor_id: str = Path(..., description="Mentor ID to book"),
    request: BookingRequest = Body(...),
    current_user_uid: str = Depends(get_current_user)
):
    """
    Creates a confirmed session booking in Firestore.
    Returns full booking confirmation.
    """
    mentor = await read_document("mentors", mentor_id)
    if not mentor:
        raise HTTPException(
            status_code=404,
            detail=f"Mentor '{mentor_id}' not found. Run POST /mentors/seed first."
        )

    created_at = datetime.now(timezone.utc).isoformat()
    booking_data = {
        "mentor_id": mentor_id,
        "mentor_name": mentor.get("name", mentor_id),
        "uid": current_user_uid,
        "status": "confirmed",
        "agenda": request.agenda,
        "preferred_slot": request.preferred_slot or mentor.get("nextSlot", "TBD"),
        "notes": request.notes,
        "created_at": created_at,
    }

    saved = await create_document("mentor_sessions", booking_data)

    return BookingConfirmation(
        booking_id=saved["id"],
        **{k: v for k, v in booking_data.items()}
    )

# -------------------------------------------------------------------
# GET /mentors  (original list/filter endpoint)
# -------------------------------------------------------------------
@router.get("/mentors/{mentor_id}", response_model=MentorProfile)
async def get_mentor_profile(
    mentor_id: str = Path(...),
    current_user_uid: str = Depends(get_current_user)
):
    """Fetches a single mentor profile by document ID."""
    mentor = await read_document("mentors", mentor_id)
    if not mentor:
        raise HTTPException(
            status_code=404,
            detail=f"Mentor profile '{mentor_id}' not found."
        )
    return MentorProfile(**{k: v for k, v in mentor.items() if k != "id"}, id=mentor_id)


@router.get("/mentors", response_model=List[Mentor])
async def get_mentors(
    query: Optional[str] = Query(None),
    expertise: Optional[str] = Query(None),
    current_user_uid: str = Depends(get_current_user)
):
    raw_mentors = await list_documents("mentors")
    filtered = []
    search_query = query.lower().strip() if query else None
    for item in raw_mentors:
        try:
            mentor = Mentor(**item)
        except Exception:
            continue
        if search_query:
            search_space = f"{mentor.name} {mentor.role} {' '.join(mentor.expertise)}".lower()
            if search_query not in search_space:
                continue
        if expertise and expertise not in mentor.expertise:
            continue
        filtered.append(mentor)
    return filtered

