import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    area_id = Column(UUID(as_uuid=True), ForeignKey("areas.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(255), nullable=False)
    chunk_index = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=False)
    metadata_ = Column("metadata", JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="document_chunks")
    area = relationship("Area", back_populates="document_chunks")
