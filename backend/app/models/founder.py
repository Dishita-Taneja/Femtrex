from pydantic import BaseModel
from typing import List, Optional

class FounderProfile(BaseModel):
    name: str
    email: str
    company: str
    industry: str
    initials: Optional[str] = None
    location: Optional[str] = None
    updatedAt: Optional[str] = None

class PillarMetric(BaseModel):
    label: str
    value: int
    note: str

class ReadinessPillar(BaseModel):
    id: str
    label: str
    subtitle: str
    score: int
    status: str  # Strong | Good | Developing | Needs Work
    color: str   # violet | pink | mint | amber | blue
    metrics: List[PillarMetric]

class BusinessPassportScore(BaseModel):
    pillars: List[ReadinessPillar]
    overall_score: int
