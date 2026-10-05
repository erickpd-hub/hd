import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Area(Base):
    __tablename__ = "areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="areas")
    agent_assignments = relationship("AgentArea", back_populates="area", cascade="all, delete-orphan")
    categories = relationship("TicketCategory", back_populates="area", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="area")
    document_chunks = relationship("DocumentChunk", back_populates="area", cascade="all, delete-orphan")


class AgentArea(Base):
    __tablename__ = "agent_areas"

    agent_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id", ondelete="CASCADE"), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    agent = relationship("User", back_populates="assigned_areas")
    area = relationship("Area", back_populates="agent_assignments")


class TicketCategory(Base):
    __tablename__ = "ticket_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id", ondelete="CASCADE"), nullable=False, index=True)
    category_name = Column(String(100), nullable=False)
    subcategory_name = Column(String(100), nullable=False)
    sla_hours = Column(Integer, default=24, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    area = relationship("Area", back_populates="categories")
    tickets = relationship("Ticket", back_populates="category")
