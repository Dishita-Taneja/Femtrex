from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str  # user | assistant
    content: str
    timestamp: Optional[str] = None
