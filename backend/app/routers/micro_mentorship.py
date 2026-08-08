import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Body
from pydantic import BaseModel

from app.db.firestore import create_document, read_document, save_document, list_documents
from app.core.firebase import get_current_user
from app.ai.gemini_utils import _call_gemini_json, _call_gemini_text

logger = logging.getLogger("femtrex.micro_mentorship")

router = APIRouter(tags=["micro-mentorship"])

# -------------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------------
class MicroBookRequest(BaseModel):
    uid: Optional[str] = None
    challenge_description: str
    category: Optional[str] = "General Strategy"
    mentor_name: Optional[str] = "Kavitha Reddy"

class SessionResponse(BaseModel):
    id: str
    uid: str
    challenge_description: str
    category: str
    mentor_name: str
    type: str = "micro"
    duration: str = "15min"
    status: str = "confirmed"
    createdAt: str
    action_plan: List[str] = []

class ActionPlanResponse(BaseModel):
    session_id: str
    challenge_description: str
    category: str
    action_plan: List[str]
    session: dict

# Fallback generator if Gemini is unavailable
def _generate_fallback_action_plan(category: str, challenge: str) -> List[str]:
    c_lower = (category + " " + challenge).lower()
    if "grant" in c_lower or "scheme" in c_lower or "funding" in c_lower:
        return [
            "1. Download and review mandatory eligibility documents (Udyam, GST, 6-month bank statements).",
            "2. Draft a clear two-page use-of-funds proposal outlining equipment or operational expansion.",
            "3. Apply via the online government portal or schedule a call with a nodal bank officer.",
            "4. Track application reference ID and follow up after 5 business days."
        ]
    elif "export" in c_lower or "textile" in c_lower or "manufacturing" in c_lower:
        return [
            "1. Obtain IEC (Import Export Code) registration from the DGFT portal.",
            "2. Benchmark export pricing structure against target regional markets.",
            "3. Prepare sample product catalogs with standardized HS codes.",
            "4. Connect with WEP export mentors to identify qualified international buyer channels."
        ]
    elif "marketing" in c_lower or "d2c" in c_lower or "customer" in c_lower:
        return [
            "1. Conduct 5 customer discovery interviews with target buyers.",
            "2. Refine core value proposition and product packaging strategy.",
            "3. Set up a low-cost performance ad experiment on Instagram/Meta.",
            "4. Track visitor-to-order conversion rate and optimize product landing page."
        ]
    
    return [
        "1. Map out core business metrics and identify current operational bottleneck.",
        "2. Prepare a 1-page summary of financial requirements and projected 6-month ROI.",
        "3. Review compliance checklist (Udyam, GST, bank account status).",
        "4. Schedule a 15-minute tactical execution check-in with your assigned mentor."
    ]

# -------------------------------------------------------------------
# POST /micro-mentorship/book  (and /api/micro-mentorship/book)
# -------------------------------------------------------------------
@router.post("/micro-mentorship/book", response_model=SessionResponse)
@router.post("/api/micro-mentorship/book", response_model=SessionResponse)
async def book_micro_session(
    payload: MicroBookRequest,
    current_user_uid: str = Depends(get_current_user)
):
    """
    Books a 15-minute tactical micro-mentorship session.
    Stores session doc in Firestore with status=confirmed, duration=15min, type=micro.
    """
    effective_uid = payload.uid or current_user_uid or "priya-demo"
    created_at = datetime.now(timezone.utc).isoformat()
    session_id = f"micro_session_{uuid.uuid4().hex[:10]}"

    session_data = {
        "id": session_id,
        "uid": effective_uid,
        "userId": effective_uid,
        "challenge_description": payload.challenge_description,
        "category": payload.category or "General Strategy",
        "mentor_name": payload.mentor_name or "Kavitha Reddy",
        "type": "micro",
        "duration": "15min",
        "status": "confirmed",
        "createdAt": created_at,
        "action_plan": []
    }

    # Save to primary & legacy Firestore collections
    await save_document("micro_mentorship_sessions", session_id, session_data)
    await save_document("microMentorshipSessions", session_id, session_data)

    logger.info(f"Booked micro mentorship session {session_id} for uid={effective_uid}")

    return SessionResponse(**session_data)


# -------------------------------------------------------------------
# POST /micro-mentorship/{session_id}/action-plan
# -------------------------------------------------------------------
@router.post("/micro-mentorship/{session_id}/action-plan", response_model=ActionPlanResponse)
@router.post("/api/micro-mentorship/{session_id}/action-plan", response_model=ActionPlanResponse)
async def generate_action_plan(
    session_id: str = Path(..., description="Micro mentorship session ID"),
    current_user_uid: str = Depends(get_current_user)
):
    """
    Sends challenge details to Gemini, receives 3-5 concrete numbered action steps,
    and updates the session document in Firestore.
    """
    # Load session document
    doc = await read_document("micro_mentorship_sessions", session_id)
    if not doc:
        doc = await read_document("microMentorshipSessions", session_id)
    
    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Micro mentorship session '{session_id}' not found. Book a session first."
        )

    challenge = doc.get("challenge_description", "Business growth strategy")
    category = doc.get("category", "General Strategy")

    prompt = f"""
You are an expert startup advisor for Indian women entrepreneurs.
A founder booked a 15-minute micro mentorship session with the following challenge:

Category: {category}
Challenge Description: {challenge}

Generate 3 to 5 concrete, tactical, numbered action steps that the founder can execute within 7 days.
Return ONLY a JSON array of strings. Example:
[
  "1. Step one instructions...",
  "2. Step two instructions...",
  "3. Step three instructions...",
  "4. Step four instructions..."
]
"""

    gemini_result = _call_gemini_json(prompt)
    steps = []

    if gemini_result and isinstance(gemini_result, list) and len(gemini_result) >= 3:
        for idx, item in enumerate(gemini_result):
            step_str = str(item).strip()
            if not step_str.startswith(tuple(f"{i}." for i in range(1, 10))):
                step_str = f"{idx + 1}. {step_str}"
            steps.append(step_str)
        logger.info(f"Generated action plan via AI for session_id={session_id}")
    else:
        steps = _generate_fallback_action_plan(category, challenge)
        logger.info(f"Using rule-based fallback action plan for session_id={session_id}")

    # Update session doc in Firestore
    doc["action_plan"] = steps
    doc["actionItems"] = steps
    doc["updatedAt"] = datetime.now(timezone.utc).isoformat()

    await save_document("micro_mentorship_sessions", session_id, doc)
    await save_document("microMentorshipSessions", session_id, doc)

    return ActionPlanResponse(
        session_id=session_id,
        challenge_description=challenge,
        category=category,
        action_plan=steps,
        session=doc
    )


# -------------------------------------------------------------------
# GET /micro-mentorship/{session_id}
# -------------------------------------------------------------------
@router.get("/micro-mentorship/{session_id}", response_model=SessionResponse)
@router.get("/api/micro-mentorship/{session_id}", response_model=SessionResponse)
async def get_micro_session(
    session_id: str,
    current_user_uid: str = Depends(get_current_user)
):
    doc = await read_document("micro_mentorship_sessions", session_id)
    if not doc:
        doc = await read_document("microMentorshipSessions", session_id)
    
    if not doc:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    
    doc.setdefault("type", "micro")
    doc.setdefault("duration", "15min")
    doc.setdefault("status", "confirmed")
    doc.setdefault("mentor_name", "Kavitha Reddy")
    doc.setdefault("action_plan", doc.get("actionItems", []))
    
    return SessionResponse(**doc)


# -------------------------------------------------------------------
# GET /micro-mentorship/user/{uid}
# -------------------------------------------------------------------
@router.get("/micro-mentorship/user/{uid}")
@router.get("/api/micro-mentorship/user/{uid}")
async def get_user_micro_sessions(
    uid: str,
    current_user_uid: str = Depends(get_current_user)
):
    raw_sessions = await list_documents("micro_mentorship_sessions")
    user_sessions = [s for s in raw_sessions if s.get("uid") == uid or s.get("userId") == uid]
    return {"uid": uid, "count": len(user_sessions), "sessions": user_sessions}

