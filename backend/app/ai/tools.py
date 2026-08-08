from typing import AsyncGenerator
import logging
from app.routers.schemes import match_schemes
from app.routers.mentors import match_mentors
from app.routers.passport import get_passport
from langchain.tools import tool

logger = logging.getLogger("femtrex.tools")

@tool
async def scheme_lookup(uid: str) -> str:
    """Retrieve matched schemes for a founder."""
    try:
        matches = await match_schemes(uid=uid, top_k=5, current_user_uid=uid)
        if not matches:
            return "No matching schemes found."
        lines = []
        for s in matches[:3]:
            name = s.get("name")
            amt = s.get("amount")
            pct = s.get("match_percent", s.get("match", 80))
            explain = s.get("explanation", "")
            lines.append(f"- **{name}**: {amt} ({pct}% match). Reason: {explain}")
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"scheme_lookup error: {e}")
        return "Error retrieving schemes."

@tool
async def mentor_lookup(uid: str) -> str:
    """Retrieve recommended mentors for a founder."""
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
        logger.error(f"mentor_lookup error: {e}")
        return "Error retrieving mentors."

@tool
async def passport_lookup(uid: str) -> str:
    """Retrieve business passport data for a founder."""
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
        logger.error(f"passport_lookup error: {e}")
        return (
            "Business Passport status: Not generated yet.\n"
            "Offer to generate one now by calling /passport/generate with the founder's existing profile data, "
            "or guide the user to complete their Business Passport on the platform."
        )

