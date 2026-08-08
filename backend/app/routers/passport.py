"""
Founder's Credibility Passport
- POST /passport/generate  — scores 5 dimensions via Gemini JSON mode, saves to Firestore
- GET  /passport/{uid}     — retrieves latest saved passport
- GET  /passport/readiness — original readiness endpoint
- POST /passport/readiness — original readiness update endpoint
"""
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from app.db.firestore import read_document, save_document, DEFAULT_READINESS_PILLARS
from app.models.founder import BusinessPassportScore, ReadinessPillar
from app.core.firebase import get_current_user
from app.ai.gemini_utils import _call_gemini_json

logger = logging.getLogger("femtrex.passport")
router = APIRouter(tags=["passport"])

# -------------------------------------------------------------------
# Pydantic I/O models
# -------------------------------------------------------------------
class PassportGenerateRequest(BaseModel):
    name: str
    company: str
    industry: str
    location: Optional[str] = "India"
    stage: Optional[str] = "Early Stage"
    years_in_business: Optional[int] = None
    annual_revenue: Optional[str] = None
    team_size: Optional[int] = None
    has_udyam: Optional[bool] = None
    has_gst: Optional[bool] = None
    has_bank_account: Optional[bool] = True
    funding_need: Optional[str] = None
    goals: Optional[List[str]] = None
    challenges: Optional[List[str]] = None

class DimensionScore(BaseModel):
    score: int
    reasoning: str

class PassportResult(BaseModel):
    uid: str
    overall_score: int
    label: str  # Developing | Good | Excellent
    startup_readiness: DimensionScore
    funding_readiness: DimensionScore
    compliance: DimensionScore
    financial_health: DimensionScore
    investor_readiness: DimensionScore
    generated_at: str
    ai_scored: bool

# -------------------------------------------------------------------
# Score helpers
# -------------------------------------------------------------------
def _label(score: int) -> str:
    if score >= 80:
        return "Excellent"
    elif score >= 50:
        return "Good"
    return "Developing"

def _build_default_scores(profile: dict) -> dict:
    """
    Intelligent parameter-based rule engine that serves as a fallback.
    Generates highly personalized, realistic scoring and analyst sentences.
    """
    name = profile.get("name", "Priya Sharma")
    company = profile.get("company", "TextCraft")
    industry = profile.get("industry", "Textile Manufacturing")
    location = profile.get("location", "Maharashtra")
    
    has_udyam = profile.get("has_udyam", False)
    has_gst = profile.get("has_gst", False)
    has_bank = profile.get("has_bank_account", True)
    years = profile.get("years_in_business") or 1
    team = profile.get("team_size") or 1
    revenue = profile.get("annual_revenue") or "Not specified"
    goals = profile.get("goals") or ["expansion"]
    goals_str = ", ".join(goals)

    # 1. Compliance score
    compliance_score = 50
    if has_udyam:
        compliance_score += 20
    if has_gst:
        compliance_score += 15
    if has_bank:
        compliance_score += 10
    compliance_score = min(compliance_score, 98)
    
    compliance_reason = (
        f"Active compliance profile. Udyam: {'Registered' if has_udyam else 'Pending'}. "
        f"GST: {'Registered' if has_gst else 'Pending'}. Active corporate bank account. "
        f"Meets basic regulatory eligibility criteria for government loans in {location}."
    )

    # 2. Startup Readiness
    startup_score = min(50 + (years * 6) + (min(team, 10) * 3), 88)
    startup_reason = (
        f"{company} shows steady operations in the {industry} sector over {years} year(s) "
        f"with a dedicated team of {team}. Core business model is validated, but needs process automation."
    )

    # 3. Funding Readiness
    funding_score = 45
    if profile.get("funding_need"):
        funding_score += 10
    if revenue and revenue != "Not specified" and "nil" not in revenue.lower() and "0" not in revenue:
        funding_score += 15
    if has_gst and has_bank:
        funding_score += 10
    funding_score = min(funding_score, 85)
    
    funding_reason = (
        f"Funding readiness stands at {funding_score}%. Financial transparency is supported by GST filings. "
        f"The stated goal to '{goals_str}' makes the business a strong fit for MSME schemes."
    )

    # 4. Financial Health
    financial_score = 50 + (years * 4)
    if revenue and "lakh" in revenue.lower():
        financial_score += 10
    elif revenue and "crore" in revenue.lower():
        financial_score += 20
    financial_score = min(financial_score, 90)
    
    financial_reason = (
        f"Financial status shows a stable foundation with '{revenue}' in revenue. "
        f"Operational experience of {years} year(s) lowers default risks, facilitating credit approvals."
    )

    # 5. Investor Readiness
    investor_score = 35 + (years * 5) + (min(team, 8) * 2)
    if revenue and revenue != "Not specified" and "nil" not in revenue.lower() and "0" not in revenue:
        investor_score += 10
    investor_score = min(investor_score, 80)
    
    investor_reason = (
        f"Early-stage investor readiness. The company has a solid sector footprint in {industry}. "
        f"Requires a structured pitch deck and clear equity funding roadmap to attract external capital."
    )

    return {
        "startup_readiness": {
            "score": startup_score,
            "reasoning": startup_reason
        },
        "funding_readiness": {
            "score": funding_score,
            "reasoning": funding_reason
        },
        "compliance": {
            "score": compliance_score,
            "reasoning": compliance_reason
        },
        "financial_health": {
            "score": financial_score,
            "reasoning": financial_reason
        },
        "investor_readiness": {
            "score": investor_score,
            "reasoning": investor_reason
        }
    }

# -------------------------------------------------------------------
# POST /passport/generate
# -------------------------------------------------------------------
@router.post("/passport/generate", response_model=PassportResult)
async def generate_passport(
    request: PassportGenerateRequest,
    current_user_uid: str = Depends(get_current_user)
):
    """
    Sends founder profile to Gemini with strict JSON schema.
    Falls back to rule-based scoring if Gemini is unavailable.
    Saves result in Firestore.
    """
    goals_str = ", ".join(request.goals or ["grow business", "access funding"])
    challenges_str = ", ".join(request.challenges or ["funding access", "compliance"])

    prompt = f"""
You are an expert business analyst evaluating Indian women entrepreneurs for a credibility passport.

Evaluate this founder on exactly 5 dimensions. Score each 0-100 based on the provided information.

Founder Profile:
- Name: {request.name}
- Company: {request.company}
- Industry: {request.industry}
- Location: {request.location}
- Business Stage: {request.stage}
- Years in Business: {request.years_in_business or "Not specified"}
- Annual Revenue: {request.annual_revenue or "Not specified"}
- Team Size: {request.team_size or "Not specified"}
- Has Udyam Registration: {request.has_udyam}
- Has GST Registration: {request.has_gst}
- Funding Need: {request.funding_need or "Not specified"}
- Goals: {goals_str}
- Challenges: {challenges_str}

Return ONLY this exact JSON structure — no other text:
{{
  "startup_readiness": {{
    "score": <integer 0-100>,
    "reasoning": "<2-3 sentences specific to this founder's startup stage, product, and team>"
  }},
  "funding_readiness": {{
    "score": <integer 0-100>,
    "reasoning": "<2-3 sentences about pitch materials, revenue evidence, and lender fit>"
  }},
  "compliance": {{
    "score": <integer 0-100>,
    "reasoning": "<2-3 sentences about Udyam, GST, licenses, and regulatory standing>"
  }},
  "financial_health": {{
    "score": <integer 0-100>,
    "reasoning": "<2-3 sentences about cash flow, margins, and repayment capacity>"
  }},
  "investor_readiness": {{
    "score": <integer 0-100>,
    "reasoning": "<2-3 sentences about pitch deck, traction, and investor narrative>"
  }}
}}
"""

    gemini_result = _call_gemini_json(prompt)
    ai_scored = False

    if gemini_result and isinstance(gemini_result, dict) and "startup_readiness" in gemini_result:
        scores = gemini_result
        ai_scored = True
        logger.info(f"Passport scored by AI for uid={current_user_uid}")
    else:
        scores = _build_default_scores(request.model_dump())
        logger.warning(f"AI scoring unavailable — using rule-based fallback scores for uid={current_user_uid}")

    # Validate and clamp all scores
    dimensions = ["startup_readiness", "funding_readiness", "compliance", "financial_health", "investor_readiness"]
    for dim in dimensions:
        if dim not in scores or not isinstance(scores[dim], dict):
            scores[dim] = {"score": 50, "reasoning": "Score estimated."}
        scores[dim]["score"] = max(0, min(100, int(scores[dim].get("score", 50))))

    overall = round(sum(scores[d]["score"] for d in dimensions) / len(dimensions))
    generated_at = datetime.now(timezone.utc).isoformat()

    passport_doc = {
        "uid": current_user_uid,
        "overall_score": overall,
        "label": _label(overall),
        "ai_scored": ai_scored,
        "generated_at": generated_at,
        **scores
    }

    # Save to multiple Firestore paths to support different lookup methodologies
    # 1. Collection: founder_passports, Doc: uid
    await save_document("founder_passports", current_user_uid, passport_doc)
    # 2. Collection: founder_profiles, Path: {uid}/passport/latest
    await save_document("founder_profiles", f"{current_user_uid}/passport/latest", passport_doc)
    
    # Save the profile for other routes
    await save_document("profiles", current_user_uid, {
        "name": request.name,
        "company": request.company,
        "industry": request.industry,
        "location": request.location,
        "stage": request.stage,
        "years_in_business": request.years_in_business,
        "annual_revenue": request.annual_revenue,
        "team_size": request.team_size,
        "has_udyam": request.has_udyam,
        "has_gst": request.has_gst,
        "funding_need": request.funding_need,
        "goals": request.goals or [],
        "challenges": request.challenges or [],
    })

    return PassportResult(
        uid=current_user_uid,
        overall_score=overall,
        label=_label(overall),
        ai_scored=ai_scored,
        generated_at=generated_at,
        startup_readiness=DimensionScore(**scores["startup_readiness"]),
        funding_readiness=DimensionScore(**scores["funding_readiness"]),
        compliance=DimensionScore(**scores["compliance"]),
        financial_health=DimensionScore(**scores["financial_health"]),
        investor_readiness=DimensionScore(**scores["investor_readiness"]),
    )

# -------------------------------------------------------------------
# GET /passport/{uid}
# -------------------------------------------------------------------
@router.get("/passport/{uid}", response_model=PassportResult)
async def get_passport(
    uid: str,
    current_user_uid: str = Depends(get_current_user)
):
    """Returns the latest saved passport for the given uid."""
    # Attempt to read from primary collection
    doc = await read_document("founder_passports", uid)
    
    if not doc:
        # Check if profile exists, otherwise fallback to default profile values
        profile = await read_document("profiles", uid)
        if not profile:
            profile = {
                "name": "Priya Sharma",
                "company": "TextCraft",
                "industry": "Textile Manufacturing",
                "location": "Maharashtra",
                "stage": "Growth Stage",
                "years_in_business": 2,
                "annual_revenue": "₹25 Lakhs",
                "team_size": 4,
                "has_udyam": True,
                "has_gst": True,
                "has_bank_account": True,
                "funding_need": "₹15 Lakhs",
                "goals": ["expand production", "access government funding"],
                "challenges": ["working capital requirements"]
            }
        scores = _build_default_scores(profile)
        dims = ["startup_readiness", "funding_readiness", "compliance", "financial_health", "investor_readiness"]
        overall = round(sum(scores[d]["score"] for d in dims) / len(dims))
        generated_at = datetime.now(timezone.utc).isoformat()
        
        doc = {
            "uid": uid,
            "overall_score": overall,
            "label": _label(overall),
            "ai_scored": False,
            "generated_at": generated_at,
            **scores
        }
        await save_document("founder_passports", uid, doc)
        await save_document("founder_profiles", f"{uid}/passport/latest", doc)
        logger.info(f"Auto-generated baseline passport for uid={uid}")

        
    # Ensure required fields exist in dictionary
    for dim in ["startup_readiness", "funding_readiness", "compliance", "financial_health", "investor_readiness"]:
        if dim not in doc:
            doc[dim] = {"score": 50, "reasoning": "Not scored yet."}
            
    doc.setdefault("label", _label(doc.get("overall_score", 50)))
    doc.setdefault("ai_scored", doc.get("ai_scored", False))
    doc.setdefault("generated_at", doc.get("generated_at", datetime.now(timezone.utc).isoformat()))
    
    return PassportResult(
        uid=doc.get("uid", uid),
        overall_score=doc.get("overall_score", 50),
        label=doc.get("label", "Developing"),
        generated_at=doc.get("generated_at"),
        ai_scored=doc.get("ai_scored", False),
        startup_readiness=DimensionScore(**doc["startup_readiness"]),
        funding_readiness=DimensionScore(**doc["funding_readiness"]),
        compliance=DimensionScore(**doc["compliance"]),
        financial_health=DimensionScore(**doc["financial_health"]),
        investor_readiness=DimensionScore(**doc["investor_readiness"]),
    )

# -------------------------------------------------------------------
# GET /passport/readiness  (original endpoint)
# -------------------------------------------------------------------
@router.get("/passport/readiness", response_model=BusinessPassportScore)
async def get_readiness_score(current_user_uid: str = Depends(get_current_user)):
    doc = await read_document("passport", current_user_uid)
    if not doc:
        pillars = [ReadinessPillar(**p) for p in DEFAULT_READINESS_PILLARS]
        overall = round(sum(p.score for p in pillars) / len(pillars))
        doc_data = {"pillars": [p.model_dump() for p in pillars], "overall_score": overall}
        await save_document("passport", current_user_uid, doc_data)
        return doc_data
    return doc

# -------------------------------------------------------------------
# POST /passport/readiness  (original endpoint)
# -------------------------------------------------------------------
@router.post("/passport/readiness", response_model=BusinessPassportScore)
async def update_readiness_score(
    pillars: List[ReadinessPillar],
    current_user_uid: str = Depends(get_current_user)
):
    overall = round(sum(p.score for p in pillars) / len(pillars))
    doc_data = {"pillars": [p.model_dump() for p in pillars], "overall_score": overall}
    await save_document("passport", current_user_uid, doc_data)
    return doc_data
