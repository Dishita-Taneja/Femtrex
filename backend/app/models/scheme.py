from pydantic import BaseModel
from typing import List, Optional

class Scheme(BaseModel):
    id: str
    name: str
    type: str  # Grant | Loan | Subsidy | Incubator | Accelerator
    description: str
    amount: str
    deadline: str
    sector: str
    match: int
    closingSoon: Optional[bool] = False
    womenOnly: Optional[bool] = False
    checklist: List[str]

class SchemeMatch(BaseModel):
    scheme: Scheme
    match_score: int
    reasoning: Optional[str] = None
