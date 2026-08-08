import sys
import time
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def make_request(path: str, method: str = "GET", body: dict = None) -> dict:
    url = f"{BASE_URL}{path}"
    print(f"\n--- Running: {method} {path} ---")
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers = {"Content-Type": "application/json"}
    
    # Setup mock authorization header
    headers["Authorization"] = "Bearer priya-demo"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            print(f"Status: {response.status}")
            print(json.dumps(res_json, indent=2)[:1000] + ("\n... [truncated]" if len(res_body) > 1000 else ""))
            return res_json
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        try:
            err_body = e.read().decode("utf-8")
            print(f"Error Body: {err_body}")
        except Exception:
            pass
        sys.exit(1)
    except Exception as e:
        print(f"Connection Error: {e}")
        sys.exit(1)

def run_tests():
    print("Starting Femtrex End-To-End Verification...")
    
    # 1. Ingest Schemes (idempotent)
    ingest_res = make_request("/schemes/ingest", method="POST")
    assert ingest_res.get("status") == "ok", "Ingestion failed"
    
    # 2. Match Schemes
    match_res = make_request("/schemes/match?uid=priya-demo", method="GET")
    assert isinstance(match_res, list) and len(match_res) > 0, "No matches found"
    first_match = match_res[0]
    assert "name" in first_match, "Scheme match shape incorrect"
    assert "match_percent" in first_match, "Scheme match shape incorrect"
    assert "explanation" in first_match, "Scheme match shape incorrect"
    
    # 3. Generate Credibility Passport
    passport_payload = {
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
        "funding_need": "₹15 Lakhs for machinery expansion",
        "goals": ["expand production", "access government funding"],
        "challenges": ["working capital", "collateral requirements"]
    }
    gen_res = make_request("/passport/generate", method="POST", body=passport_payload)
    assert gen_res.get("overall_score") is not None, "Overall score not returned"
    
    # 4. Get Credibility Passport
    get_res = make_request("/passport/priya-demo", method="GET")
    assert get_res.get("overall_score") == gen_res.get("overall_score"), "Passport reload mismatch"
    
    # 5. Seed Mentors
    seed_res = make_request("/mentors/seed", method="POST")
    assert seed_res.get("status") == "ok", "Mentor seeding failed"
    
    # 6. Match Mentors
    mentor_match_res = make_request("/mentors/match?uid=priya-demo", method="GET")
    assert len(mentor_match_res.get("top_matches", [])) > 0, "Mentor match empty"
    first_mentor = mentor_match_res["top_matches"][0]
    assert "why_fits" in first_mentor, "Mentor match explanation missing"
    
    # 7. Book Mentor Session
    booking_payload = {
        "agenda": ["Discuss SIDBI loan application", "Check export pricing"],
        "notes": "Looking forward to learning from your experience scaling from one loom."
    }
    book_res = make_request(f"/mentors/{first_mentor['id']}/book", method="POST", body=booking_payload)
    assert book_res.get("status") == "confirmed", "Booking confirmation failed"
    assert book_res.get("booking_id") is not None, "Booking ID missing"
    
    # 8. Book Micro Mentorship Session & Generate Action Plan
    micro_book_payload = {
        "uid": "priya-demo",
        "challenge_description": "Need guidance on Stand-Up India collateral requirement and bank interview preparation.",
        "category": "Government Schemes & Loans"
    }
    micro_session = make_request("/micro-mentorship/book", method="POST", body=micro_book_payload)
    assert micro_session.get("status") == "confirmed", "Micro session status incorrect"
    assert micro_session.get("type") == "micro", "Micro session type incorrect"
    assert micro_session.get("duration") == "15min", "Micro session duration incorrect"
    session_id = micro_session["id"]

    plan_res = make_request(f"/micro-mentorship/{session_id}/action-plan", method="POST")
    assert len(plan_res.get("action_plan", [])) >= 3, "Action plan generation failed"
    assert "1." in plan_res["action_plan"][0], "Action plan step numbering missing"

    # 9. AI Founder Copilot Chat with Tool Invocation
    copilot_payload = {
        "uid": "priya-demo",
        "message": "What government schemes am I eligible for as a textile startup?"
    }
    copilot_res = make_request("/copilot/chat", method="POST", body=copilot_payload)
    assert "answer" in copilot_res and len(copilot_res["answer"]) > 0, "Copilot response empty"
    assert "tools_called" in copilot_res, "Copilot tools_called metadata missing"
    assert "scheme_lookup" in copilot_res["tools_called"], "Copilot scheme_lookup tool call missing"

    print("\n[SUCCESS] All 9 end-to-end verification tests passed successfully!")

if __name__ == "__main__":
    # Give server time to startup if running async
    time.sleep(1)
    run_tests()

