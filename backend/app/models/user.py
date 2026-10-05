import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    END_USER = "end_user"
    AGENT_L2 = "agent_l2"
    ADMIN_AREA = "admin_area"
    SUPER_ADMIN = "super_admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role", create_type=False), nullable=False, default=UserRole.END_USER)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    assigned_areas = relationship("AgentArea", back_populates="agent", cascade="all, delete-orphan")
    requested_tickets = relationship("Ticket", foreign_keys="Ticket.requester_id", back_populates="requester")
    assigned_tickets = relationship("Ticket", foreign_keys="Ticket.assigned_agent_id", back_populates="assigned_agent")
