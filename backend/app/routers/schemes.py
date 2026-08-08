"""
RAG-Based AI Scheme Matcher
- POST /schemes/ingest   — embeds all schemes into ChromaDB (idempotent)
- GET  /schemes/match    — similarity search + Gemini scoring/fallback per result
- GET  /schemes          — filter/list endpoint
"""
import json
import os
import logging
from typing import List, Optional
from fastapi import APIRouter, Query, Depends, HTTPException
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from app.db.chroma import get_chroma_client
from app.db.firestore import list_documents, read_document, DEFAULT_FOUNDER_PROFILE
from app.models.scheme import Scheme
from app.core.firebase import get_current_user
from app.ai.gemini_utils import _call_gemini_json

logger = logging.getLogger("femtrex.schemes")
router = APIRouter(tags=["schemes"])

COLLECTION_NAME = "femtrex_schemes"
_ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

def _get_schemes_collection():
    client = get_chroma_client()
    if not client:
        raise HTTPException(status_code=503, detail="ChromaDB unavailable")
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=_ef,
        metadata={"hnsw:space": "cosine"}
    )

def _scheme_to_doc_text(scheme: dict) -> str:
    """Build a rich text blob for embedding — captures all searchable dimensions."""
    return (
        f"{scheme['name']}. "
        f"Type: {scheme['type']}. "
        f"Sector: {scheme['sector']}. "
        f"Stage: {scheme.get('stage', 'Any')}. "
        f"Eligibility: {scheme['eligibility']}. "
        f"Description: {scheme['description']}. "
        f"Amount: {scheme['amount']}. "
        f"Women only: {'yes' if scheme.get('womenOnly') else 'no'}."
    )

def _generate_fallback_explanation(profile: dict, scheme_meta: dict, match_pct: int) -> str:
    """Generates a highly realistic match explanation if the AI is unavailable."""
    name = profile.get("name", "Priya")
    company = profile.get("company", "TextCraft")
    industry = profile.get("industry", "Textile Manufacturing").lower()
    location = profile.get("location", "Maharashtra")
    
    scheme_id = scheme_meta.get("id", "")
    scheme_name = scheme_meta.get("name", "")
    sector = scheme_meta.get("sector", "All Sectors").lower()
    women_only = scheme_meta.get("womenOnly") == "True" or scheme_meta.get("womenOnly") is True

    if "standup" in scheme_id or "stand-up" in scheme_id.lower():
        return f"Fits because {name} is a woman entrepreneur setting up a greenfield {industry} enterprise in {location}."
    elif "msme-tech" in scheme_id or "upgradation" in scheme_name.lower():
        return f"Highly compatible with {company}'s profile as a manufacturing MSME in {location} seeking technology upgrades."
    elif "mahila-udyam" in scheme_id or "udyam-nidhi" in scheme_id:
        return f"Excellent match as a soft loan program targeting women-led small scale {industry} businesses."
    elif "wep-accelerator" in scheme_id:
        return f"Strong fit for {company}'s expansion goals, offering mentorship, funding, and VC access."
    elif "ficci-flo" in scheme_id:
        return f"Eligible grant for women-led businesses with traction, matching your {industry} expansion plans."
    elif "annapurna" in scheme_id:
        if "food" in industry or "beverage" in industry or "catering" in industry:
            return f"Excellent fit for purchasing kitchen equipment and scaling your food business."
        return f"Low match: Annapurna scheme is restricted to food businesses, while you operate in {industry}."
    
    # Generic intelligent fallbacks
    if women_only:
        return f"Matches because {name} is a woman entrepreneur and the scheme supports {sector} projects."
    return f"Fits your business sector ({sector}) and expansion goals in {location}."

# -------------------------------------------------------------------
# POST /schemes/ingest
# -------------------------------------------------------------------
@router.post("/schemes/ingest")
async def ingest_schemes(current_user_uid: str = Depends(get_current_user)):
    """
    Loads data/schemes.json, embeds each scheme using sentence-transformers,
    and upserts into ChromaDB. Idempotent — safe to run multiple times.
    """
    data_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "data", "schemes.json"
    )
    data_path = os.path.abspath(data_path)

    if not os.path.exists(data_path):
         # Try parent folder as well
         data_path = os.path.join(os.path.dirname(__file__), "..", "data", "schemes.json")
         data_path = os.path.abspath(data_path)

    if not os.path.exists(data_path):
        raise HTTPException(status_code=500, detail=f"schemes.json not found at {data_path}")

    with open(data_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    collection = _get_schemes_collection()
    existing_ids = set(collection.get()["ids"])

    new_count = 0
    updated_count = 0
    for scheme in schemes:
        scheme_id = scheme["id"]
        doc_text = _scheme_to_doc_text(scheme)
        metadata = {
            "id": scheme_id,
            "name": scheme["name"],
            "type": scheme["type"],
            "amount": scheme["amount"],
            "sector": scheme["sector"],
            "stage": scheme.get("stage", "Any"),
            "deadline": scheme.get("deadline", "Rolling"),
            "womenOnly": str(scheme.get("womenOnly", False)),
            "closingSoon": str(scheme.get("closingSoon", False)),
        }
        collection.upsert(
            ids=[scheme_id],
            documents=[doc_text],
            metadatas=[metadata]
        )
        if scheme_id in existing_ids:
            updated_count += 1
        else:
            new_count += 1

    return {
        "status": "ok",
        "total_schemes": len(schemes),
        "newly_added": new_count,
        "updated": updated_count,
        "collection": COLLECTION_NAME,
        "embedding_model": "all-MiniLM-L6-v2 (sentence-transformers)"
    }

# -------------------------------------------------------------------
# GET /schemes/match
# -------------------------------------------------------------------
@router.get("/schemes/match")
async def match_schemes(
    uid: str = Query(default="priya-demo", description="Founder UID from Firestore"),
    top_k: int = Query(default=8, ge=3, le=15),
    current_user_uid: str = Depends(get_current_user)
):
    """
    1. Fetches founder profile from Firestore
    2. Similarity-searches ChromaDB (top_k results)
    3. Calls Gemini/Grok to score match_percent + eligibility + explanation per scheme
    4. Returns ranked list matching shape {name, type, amount, match_percent, eligible, explanation}
    """
    # 1. Load founder profile
    profile = await read_document("profiles", uid)
    if not profile:
        profile = DEFAULT_FOUNDER_PROFILE
        logger.info(f"No profile for uid={uid}, using default demo profile.")

    name = profile.get("name", "Priya Sharma")
    company = profile.get("company", "TextCraft")
    industry = profile.get("industry", "Textile Manufacturing")
    location = profile.get("location", "Maharashtra")
    stage = profile.get("stage", "MSME, 2 years of operations")
    goals = profile.get("goals", ["expand production", "access government funding"])
    if isinstance(goals, list):
        goals_str = ", ".join(goals)
    else:
        goals_str = str(goals)

    # 2. Build embedding query
    query_text = (
        f"Women entrepreneur {industry} business in {location}. "
        f"Stage: {stage}. Goals: {goals_str}. "
        f"Looking for government schemes, grants, loans, subsidies for MSME expansion."
    )

    # 3. ChromaDB similarity search
    collection = _get_schemes_collection()
    total_in_collection = collection.count()
    if total_in_collection == 0:
        raise HTTPException(
            status_code=400,
            detail="Scheme collection is empty. Run POST /schemes/ingest first."
        )

    results = collection.query(
        query_texts=[query_text],
        n_results=min(top_k, total_in_collection)
    )

    ids = results["ids"][0]
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    # 4. Call Gemini/Grok
    schemes_for_gemini = []
    for i, (sid, doc, meta) in enumerate(zip(ids, documents, metadatas)):
        similarity_pct = round((1 - distances[i]) * 100, 1)
        schemes_for_gemini.append({
            "scheme_id": sid,
            "name": meta.get("name"),
            "type": meta.get("type"),
            "amount": meta.get("amount"),
            "sector": meta.get("sector"),
            "stage": meta.get("stage"),
            "womenOnly": meta.get("womenOnly") == "True",
            "description_snippet": doc[:300],
            "vector_similarity_pct": similarity_pct
        })

    gemini_prompt = f"""
You are a scheme eligibility expert for Indian women entrepreneurs.

Founder Profile:
- Name: {name}
- Company: {company}
- Industry: {industry}
- Location: {location}
- Stage: {stage}
- Goals: {goals_str}

For each of the following schemes, return a JSON array with one object per scheme:
{{
  "scheme_id": "<id>",
  "match_percent": <integer 0-100>,
  "eligible": <true or false>,
  "explanation": "<one sentence: why this scheme fits or doesn't fit this founder>"
}}

Rules:
- match_percent must reflect how well the scheme matches THIS specific founder's industry, stage, location, and goals
- eligible=true only if the founder clearly meets the stated eligibility criteria
- explanation must be specific to this founder, not generic
- Return ONLY the JSON array, no other text

Schemes to evaluate:
{json.dumps(schemes_for_gemini, indent=2)}
"""

    gemini_scores = _call_gemini_json(gemini_prompt)

    scores_map = {}
    if isinstance(gemini_scores, list):
        for item in gemini_scores:
            if isinstance(item, dict) and "scheme_id" in item:
                scores_map[item["scheme_id"]] = item

    # 5. Assemble final response
    matched = []
    for i, (sid, meta) in enumerate(zip(ids, metadatas)):
        sim_pct = round((1 - distances[i]) * 100, 1)
        g = scores_map.get(sid, {})
        
        # Calculate heuristics in case AI fallback is needed
        fallback_match = int(sim_pct)
        # Apply name based adjustments
        sec = meta.get("sector", "").lower()
        ind = industry.lower()
        if "textile" in ind and "textile" in sec:
            fallback_match = min(96, fallback_match + 20)
        elif "manufacturing" in ind and "manufacturing" in sec:
            fallback_match = min(94, fallback_match + 15)
        elif sec == "all sectors" or "women" in sec:
            fallback_match = min(90, fallback_match + 10)
            
        if meta.get("womenOnly") == "True":
            fallback_match = min(98, fallback_match + 10)
            
        fallback_eligible = fallback_match >= 75
        fallback_explain = _generate_fallback_explanation(profile, meta, fallback_match)

        matched.append({
            "id": sid,
            "name": meta.get("name"),
            "type": meta.get("type"),
            "amount": meta.get("amount"),
            "sector": meta.get("sector"),
            "deadline": meta.get("deadline", "Rolling"),
            "womenOnly": meta.get("womenOnly") == "True",
            "closingSoon": meta.get("closingSoon") == "True",
            "match_percent": g.get("match_percent", fallback_match),
            "match": g.get("match_percent", fallback_match), # compatible
            "eligible": g.get("eligible", fallback_eligible),
            "explanation": g.get("explanation", fallback_explain)
        })

    # Sort by match_percent descending
    matched.sort(key=lambda x: x["match_percent"], reverse=True)
    return matched

# -------------------------------------------------------------------
# GET /schemes  (original filter endpoint)
# -------------------------------------------------------------------
@router.get("/schemes", response_model=List[Scheme])
async def get_schemes(
    query: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    womenOnly: bool = Query(False),
    sector: Optional[str] = Query(None),
    current_user_uid: str = Depends(get_current_user)
):
    """Retrieves and filters schemes from Firestore (keyword-based, original endpoint)."""
    raw_schemes = await list_documents("schemes")
    filtered_schemes = []
    search_query = query.lower().strip() if query else None

    for item in raw_schemes:
        try:
            scheme = Scheme(**item)
        except Exception:
            continue
        if search_query:
            search_space = f"{scheme.name} {scheme.description} {scheme.sector}".lower()
            if search_query not in search_space:
                continue
        if type and scheme.type != type:
            continue
        if status:
            if status == "Closing Soon" and not scheme.closingSoon:
                continue
            elif status == "Open" and scheme.closingSoon:
                continue
        if womenOnly and not scheme.womenOnly:
            continue
        if sector and scheme.sector != sector and scheme.sector != "All Sectors":
            continue
        filtered_schemes.append(scheme)

    return filtered_schemes
