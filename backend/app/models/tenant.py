import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    areas = relationship("Area", back_populates="tenant", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="tenant", cascade="all, delete-orphan")
    document_chunks = relationship("DocumentChunk", back_populates="tenant", cascade="all, delete-orphan")
