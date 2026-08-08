from pydantic import BaseModel
from typing import List, Optional

class MentorshipSession(BaseModel):
    id: Optional[str] = None
    mentorId: str
    agenda: List[str]
    createdAt: Optional[str] = None
