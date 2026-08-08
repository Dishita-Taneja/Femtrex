from pydantic import BaseModel, Field
from typing import List, Optional, Union


class Mentor(BaseModel):
    """
    Read model — matches the shape stored in Firestore by the seed script
    and the registration endpoint. All fields optional so partial docs load safely.
    """
    id: str
    name: str
    role: str
    expertise: List[str] = Field(default_factory=list)
    industry: Optional[str] = ""
    years_experience: Optional[int] = 0
    rating: Optional[float] = 0.0
    sessions: Optional[int] = 0
    price: Optional[str] = ""
    nextSlot: Optional[str] = "TBD"
    bio: Optional[str] = ""
    tags: Optional[List[str]] = Field(default_factory=list)
    review: Optional[str] = ""


class MentorRegistrationRequest(BaseModel):
    """
    Inbound payload from POST /mentors/register.
    Only the fields the mentor fills out — system fields
    (rating, sessions, review, nextSlot) are NOT accepted from the user.
    """
    name: str
    role: str
    expertise: List[str] = Field(default_factory=list)
    industry: str = ""
    years_experience: Union[int, str] = 0
    price: str = ""
    bio: str = ""
    tags: Optional[List[str]] = Field(default_factory=list)


class MentorProfile(BaseModel):
    """
    Complete stored mentor profile — exactly matches the Firestore document schema.
    All system-managed fields default safely if omitted.
    """
    id: str
    name: str
    role: str
    expertise: List[str] = Field(default_factory=list)
    industry: str = ""
    years_experience: int = 0
    rating: float = 0.0
    sessions: int = 0
    price: str = ""
    nextSlot: str = "TBD"
    bio: str = ""
    tags: List[str] = Field(default_factory=list)
    review: str = ""
    status: Optional[str] = "active"
    created_at: Optional[str] = None
