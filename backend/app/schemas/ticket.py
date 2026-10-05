import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.ticket import (
    TicketStatus,
    AssignmentStatus,
    ResolutionType,
    TicketPriority,
    CustomerSentiment,
)


class TicketMessageRead(BaseModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    sender_type: str
    sender_id: Optional[uuid.UUID]
    content: str
    agent_reasoning: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class TicketBase(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM
    area_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None


class TicketCreate(TicketBase):
    requester_email: str
    requester_name: str


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    assignment_status: Optional[AssignmentStatus] = None
    assigned_agent_id: Optional[uuid.UUID] = None
    priority: Optional[TicketPriority] = None
    resolution_type: Optional[ResolutionType] = None
    resolution_notes: Optional[str] = None


class TicketRead(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    description: str
    status: TicketStatus
    assignment_status: AssignmentStatus
    resolution_type: ResolutionType
    priority: TicketPriority
    sentiment: CustomerSentiment
    summary: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_by_ai: bool
    confidence_score: Optional[float] = None
    sla_deadline: Optional[datetime] = None
    area_id: Optional[uuid.UUID] = None
    area_name: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    category_name: Optional[str] = None
    requester_id: uuid.UUID
    requester_email: Optional[str] = None
    assigned_agent_id: Optional[uuid.UUID] = None
    assigned_agent_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[TicketMessageRead] = Field(default_factory=list)

    class Config:
        from_attributes = True


class TicketListFilter(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    area_id: Optional[uuid.UUID] = None
    resolved_by_ai: Optional[bool] = None
    limit: int = 50
    offset: int = 0
