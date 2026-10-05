import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.ticket import CustomerSentiment, TicketPriority, TicketStatus, ResolutionType


class SourceCitation(BaseModel):
    document_name: str
    chunk_index: int
    relevance_score: float
    excerpt: str


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    ticket_id: Optional[uuid.UUID] = None
    requester_email: Optional[str] = "customer@example.com"
    requester_name: Optional[str] = "Customer User"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentStepTrace(BaseModel):
    node: str
    action: str
    details: Dict[str, Any] = Field(default_factory=dict)


class ChatMessageResponse(BaseModel):
    ticket_id: uuid.UUID
    response: str
    resolved_by_ai: bool
    status: TicketStatus
    resolution_type: ResolutionType
    confidence_score: float
    sentiment: CustomerSentiment
    priority: TicketPriority
    area_name: Optional[str] = None
    category_name: Optional[str] = None
    assigned_agent: Optional[str] = None
    citations: List[SourceCitation] = Field(default_factory=list)
    agent_trace: List[AgentStepTrace] = Field(default_factory=list)
