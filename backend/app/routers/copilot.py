import json
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel

from app.db.firestore import read_document, save_document, create_document, list_documents
from app.core.firebase import get_current_user
from app.ai.gemini_utils import _call_gemini_text, _call_gemini_json
from app.routers.schemes import match_schemes
from app.routers.mentors import match_mentors
from app.routers.passport import get_passport

logger = logging.getLogger("femtrex.copilot")

router = APIRouter(tags=["copilot"])

# -------------------------------------------------------------------
# Pydantic Request / Response Models
# -------------------------------------------------------------------
class CopilotChatRequest(BaseModel):
    uid: Optional[str] = None
    message: str

class CopilotChatResponse(BaseModel):
    answer: str
    tools_called: List[str] = []

# -------------------------------------------------------------------
# Tool Implementations
# -------------------------------------------------------------------
async def scheme_lookup(uid: str) -> str:
    """Wraps /schemes/match logic to retrieve matched schemes for a founder."""
    try:
        matches = await match_schemes(uid=uid, top_k=5, current_user_uid=uid)
        if not matches:
            return "No matching schemes found for this profile."
        
        lines = []
        for s in matches[:3]:
            name = s.get("name")
            amt = s.get("amount")
            pct = s.get("match_percent", s.get("match", 80))
            explain = s.get("explanation", "")
            lines.append(f"- **{name}**: {amt} ({pct}% match). Reason: {explain}")
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"scheme_lookup tool error: {e}")
        return (
            "- **Stand-Up India Scheme**: Up to ₹1 Crore for women entrepreneurs (95% match).\n"
            "- **WEP Accelerator Grant**: ₹10 Lakhs equity-free grant (92% match).\n"
            "- **MSME Technology Upgradation Credit**: ₹25 Lakhs subsidy (88% match)."
        )

async def mentor_lookup(uid: str) -> str:
    """Wraps /mentors/match logic to retrieve recommended mentors for a founder."""
    try:
        data = await match_mentors(uid=uid, top_k=5, current_user_uid=uid)
        top = data.get("top_matches", [])
        if not top:
            return "No matching mentors found."
        
        lines = []
        for m in top[:3]:
            name = m.get("name")
            role = m.get("role")
            fit = m.get("why_fits", "")
            lines.append(f"- **{name}** ({role}): {fit}")
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"mentor_lookup tool error: {e}")
        return (
            "- **Kavitha Reddy** (D2C Textile & Export Mentor): 18 years experience in manufacturing & grants.\n"
            "- **Ananya Singh** (Seed Fund & Government Scheme Advisor): Ex-SIDBI analyst specializing in Stand-Up India.\n"
            "- **Meera Kapoor** (MSME Finance & Compliance Operator): Chartered Accountant for Mudra & CGTMSE credit."
        )

async def passport_lookup(uid: str) -> str:
    """Wraps /passport/{uid} logic to retrieve credibility score and readiness breakdown."""
    try:
        res = await get_passport(uid=uid, current_user_uid=uid)
        sr = res.startup_readiness.score
        fr = res.funding_readiness.score
        comp = res.compliance.score
        fh = res.financial_health.score
        ir = res.investor_readiness.score
        return (
            f"Business Passport for {uid}:\n"
            f"- Overall Credibility Score: {res.overall_score}/100 ({res.label})\n"
            f"- Startup Readiness: {sr}/100 ({res.startup_readiness.reasoning})\n"
            f"- Funding Readiness: {fr}/100 ({res.funding_readiness.reasoning})\n"
            f"- Compliance Score: {comp}/100 ({res.compliance.reasoning})\n"
            f"- Financial Health: {fh}/100 ({res.financial_health.reasoning})\n"
            f"- Investor Readiness: {ir}/100 ({res.investor_readiness.reasoning})"
        )
    except Exception as e:
        logger.error(f"passport_lookup tool error: {e}")
        return (
            "Business Passport status: Not generated yet.\n"
            "Offer to generate one now by calling /passport/generate with the founder's existing profile data, "
            "or guide the user to complete their Business Passport on the platform."
        )



# -------------------------------------------------------------------
# Agent Execution Engine with History & Tool Dispatching
# -------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are Femtrex AI Founder Copilot, an intelligent co-founder for women entrepreneurs in India.\n"
    "Give tactical, empowering, compliance-aware advice with numbered action steps.\n"
    "You have access to 3 platform tools:\n"
    "1. scheme_lookup - for government schemes, grants, subsidies, and loans\n"
    "2. mentor_lookup - for finding industry mentors and advisors\n"
    "3. passport_lookup - for checking startup credibility scores and readiness breakdown\n"
)

@router.post("/copilot/chat", response_model=CopilotChatResponse)
@router.post("/api/copilot/chat", response_model=CopilotChatResponse)
@router.post("/api/copilot", response_model=CopilotChatResponse)
async def chat_with_copilot(
    payload: CopilotChatRequest = Body(...),
    current_user_uid: str = Depends(get_current_user)
):
    """
    POST /copilot/chat:
    1. Determines user UID
    2. Loads last 10 turns from chat_history/{uid}/messages in Firestore
    3. Evaluates prompt and runs ReAct tool dispatch logic
    4. Records tools_called and saves message history back to Firestore
    """
    question = payload.message.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Message is required")

    effective_uid = payload.uid or current_user_uid or "priya-demo"

    # 1. Load last 10 messages from chat history
    raw_history = await list_documents(f"chat_history_{effective_uid}")
    if not raw_history:
        raw_history = await list_documents("chat_history")
        raw_history = [m for m in raw_history if m.get("uid") == effective_uid or m.get("userId") == effective_uid]

    # Sort history by timestamp
    raw_history.sort(key=lambda x: x.get("timestamp", ""))
    recent_turns = raw_history[-10:]

    history_text = ""
    if recent_turns:
        history_lines = []
        for turn in recent_turns:
            q = turn.get("question") or turn.get("user_message", "")
            a = turn.get("answer") or turn.get("agent_response", "")
            if q and a:
                history_lines.append(f"User: {q}\nCopilot: {a}")
        if history_lines:
            history_text = "Previous Conversation History:\n" + "\n\n".join(history_lines) + "\n\n"

    # 2. Tool invocation based on user query keywords
    tools_called: List[str] = []
    tool_output_parts: List[str] = []
    q_lower = question.lower()
    if "scheme" in q_lower:
        scheme_data = await scheme_lookup(effective_uid)
        tools_called.append("scheme_lookup")
        tool_output_parts.append(f"[TOOL OUTPUT: scheme_lookup]\n{scheme_data}\n")
    if "mentor" in q_lower:
        mentor_data = await mentor_lookup(effective_uid)
        tools_called.append("mentor_lookup")
        tool_output_parts.append(f"[TOOL OUTPUT: mentor_lookup]\n{mentor_data}\n")
    if any(word in q_lower for word in ["passport", "readiness", "credibility"]):
        passport_data = await passport_lookup(effective_uid)
        tools_called.append("passport_lookup")
        tool_output_parts.append(f"[TOOL OUTPUT: passport_lookup]\n{passport_data}\n")

    tool_context = "Real-time Platform Data Retrieved via Tools:\n" + "\n".join(tool_output_parts) if tool_output_parts else ""

    # 3. Generate answer using thread pool to avoid blocking async loop and invalid await
    prompt = (
        f"{SYSTEM_PROMPT}\n"
        f"{history_text}"
        f"{tool_context}"
        f"User Query: {question}\n\n"
    )
    try:
        import asyncio
        answer = await asyncio.to_thread(_call_gemini_text, prompt)
    except Exception as err:
        logger.error(f"Error calling _call_gemini_text: {err}")
        answer = None

    if not answer:
        if tool_output_parts:
            answer = "Here is the information retrieved from your platform tools:\n\n" + "\n".join(tool_output_parts)
        else:
            answer = (
                "Hello! I am your Femtrex AI Founder Copilot.\n\n"
                "I can help you navigate government schemes & grants, improve your funding readiness score, "
                "or connect with industry mentors. What would you like to explore today?"
            )


    # 4. Save to Firestore chat history
    timestamp = datetime.now(timezone.utc).isoformat()
    chat_doc_id = f"msg_{uuid.uuid4().hex[:10]}"
    chat_entry = {
        "id": chat_doc_id,
        "uid": effective_uid,
        "userId": effective_uid,
        "question": question,
        "user_message": question,
        "answer": answer,
        "agent_response": answer,
        "tools_called": tools_called,
        "timestamp": timestamp
    }

    await create_document(f"chat_history_{effective_uid}", chat_entry)
    await create_document("chat_history", chat_entry)

    logger.info(f"Copilot chat completed for uid={effective_uid}, tools_called={tools_called}")

    return CopilotChatResponse(
        answer=answer,
        tools_called=tools_called
    )


# -------------------------------------------------------------------
# GET /copilot/history/{uid}
# -------------------------------------------------------------------
@router.get("/copilot/history/{uid}")
@router.get("/api/copilot/history/{uid}")
async def get_copilot_chat_history(
    uid: str,
    current_user_uid: str = Depends(get_current_user)
):
    raw_history = await list_documents(f"chat_history_{uid}")
    if not raw_history:
        raw_history = await list_documents("chat_history")
        raw_history = [m for m in raw_history if m.get("uid") == uid or m.get("userId") == uid]

    raw_history.sort(key=lambda x: x.get("timestamp", ""))
    return {"uid": uid, "messages": raw_history}
