import enum
import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Numeric,
    JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    ESCALATED = "escalated"


class AssignmentStatus(str, enum.Enum):
    UNASSIGNED = "unassigned"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class ResolutionType(str, enum.Enum):
    RESOLVED_BY_AI = "resolved_by_ai"
    RESOLVED_BY_HUMAN = "resolved_by_human"
    UNRESOLVED = "unresolved"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CustomerSentiment(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    FRUSTRATED = "frustrated"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("ticket_categories.id", ondelete="SET NULL"), nullable=True)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_agent_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus, name="ticket_status", create_type=False), nullable=False, default=TicketStatus.OPEN)
    assignment_status = Column(Enum(AssignmentStatus, name="assignment_status", create_type=False), nullable=False, default=AssignmentStatus.UNASSIGNED)
    resolution_type = Column(Enum(ResolutionType, name="resolution_type", create_type=False), nullable=False, default=ResolutionType.UNRESOLVED)
    priority = Column(Enum(TicketPriority, name="ticket_priority", create_type=False), nullable=False, default=TicketPriority.MEDIUM)
    sentiment = Column(Enum(CustomerSentiment, name="customer_sentiment", create_type=False), nullable=False, default=CustomerSentiment.NEUTRAL)

    summary = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by_ai = Column(Boolean, nullable=False, default=False)
    confidence_score = Column(Numeric(4, 3), nullable=True)
    sla_deadline = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="tickets")
    area = relationship("Area", back_populates="tickets")
    category = relationship("TicketCategory", back_populates="tickets")
    requester = relationship("User", foreign_keys=[requester_id], back_populates="requested_tickets")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id], back_populates="assigned_tickets")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketMessage.created_at.asc()")


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(String(20), nullable=False)  # 'end_user', 'ai_agent', 'agent_l2', 'system'
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    agent_reasoning = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    ticket = relationship("Ticket", back_populates="messages")
