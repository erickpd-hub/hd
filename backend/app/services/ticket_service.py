import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.area import Area, TicketCategory
from app.models.ticket import (
    Ticket,
    TicketMessage,
    TicketStatus,
    AssignmentStatus,
    ResolutionType,
    TicketPriority,
    CustomerSentiment,
)
from app.agents.graph import support_graph
from app.agents.state import SupportAgentState
from app.schemas.chat import ChatMessageResponse, SourceCitation, AgentStepTrace


class TicketService:
    @staticmethod
    async def get_or_create_user(
        session: AsyncSession,
        tenant_id: uuid.UUID,
        email: str,
        full_name: str
    ) -> User:
        """Find user by email or create new end_user in tenant."""
        stmt = select(User).where(User.tenant_id == tenant_id, User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                email=email,
                full_name=full_name,
                role=UserRole.END_USER,
                hashed_password="not_used_for_chat_requester",
                is_active=True
            )
            session.add(user)
            await session.flush()
        return user

    @staticmethod
    async def get_or_create_area(
        session: AsyncSession,
        tenant_id: uuid.UUID,
        area_name: str
    ) -> Area:
        """Find or create departmental area."""
        stmt = select(Area).where(Area.tenant_id == tenant_id, Area.name == area_name)
        result = await session.execute(stmt)
        area = result.scalar_one_or_none()
        if not area:
            area = Area(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                name=area_name,
                description=f"Automated department for {area_name}"
            )
            session.add(area)
            await session.flush()
        return area

    async def process_chat_interaction(
        self,
        session: AsyncSession,
        tenant_id: uuid.UUID,
        user_message: str,
        ticket_id: Optional[uuid.UUID] = None,
        requester_email: str = "customer@example.com",
        requester_name: str = "Customer User",
        metadata: Optional[Dict[str, Any]] = None
    ) -> ChatMessageResponse:
        """
        Main pipeline coordinating:
        1. User creation/lookup.
        2. Ticket initialization/fetch.
        3. LangGraph execution.
        4. State persistence & audit logging.
        """
        # Ensure RLS session variable is set
        await session.execute(
            text("SET LOCAL app.current_tenant_id = :tenant_id"),
            {"tenant_id": str(tenant_id)}
        )

        user = await self.get_or_create_user(session, tenant_id, requester_email, requester_name)

        ticket: Optional[Ticket] = None
        if ticket_id:
            stmt = select(Ticket).where(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id)
            result = await session.execute(stmt)
            ticket = result.scalar_one_or_none()

        if not ticket:
            ticket = Ticket(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                requester_id=user.id,
                title=user_message[:100],
                description=user_message,
                status=TicketStatus.OPEN,
                assignment_status=AssignmentStatus.UNASSIGNED,
                resolution_type=ResolutionType.UNRESOLVED,
                priority=TicketPriority.MEDIUM,
                sentiment=CustomerSentiment.NEUTRAL,
                created_at=datetime.now(timezone.utc)
            )
            session.add(ticket)
            await session.flush()

        # Log User Message
        user_msg_entry = TicketMessage(
            id=uuid.uuid4(),
            ticket_id=ticket.id,
            tenant_id=tenant_id,
            sender_type="end_user",
            sender_id=user.id,
            content=user_message
        )
        session.add(user_msg_entry)
        await session.flush()

        # Build initial agent state
        initial_state: SupportAgentState = {
            "tenant_id": str(tenant_id),
            "requester_id": str(user.id),
            "requester_email": user.email,
            "requester_name": user.full_name,
            "ticket_id": str(ticket.id),
            "user_message": user_message,
            "messages_history": [],
            "agent_trace": []
        }

        # Run Multi-Agent DAG Orchestrator
        final_state = await support_graph.ainvoke(initial_state)

        # Map state back to ticket
        sentiment_str = final_state.get("sentiment", "neutral").lower()
        if sentiment_str in CustomerSentiment._value2member_map_:
            ticket.sentiment = CustomerSentiment(sentiment_str)

        priority_str = final_state.get("priority", "medium").lower()
        if priority_str in TicketPriority._value2member_map_:
            ticket.priority = TicketPriority(priority_str)

        ticket.summary = final_state.get("summary")
        ticket.confidence_score = final_state.get("confidence_score")
        resolved_by_ai = final_state.get("is_resolved", False)
        ticket.resolved_by_ai = resolved_by_ai

        # Match or set area
        area_name = final_state.get("area_name", "Technical Support")
        area = await self.get_or_create_area(session, tenant_id, area_name)
        ticket.area_id = area.id

        if resolved_by_ai:
            ticket.status = TicketStatus.CLOSED
            ticket.assignment_status = AssignmentStatus.RESOLVED
            ticket.resolution_type = ResolutionType.RESOLVED_BY_AI
            ticket.closed_at = datetime.now(timezone.utc)
        else:
            ticket.status = TicketStatus.ESCALATED
            ticket.assignment_status = AssignmentStatus.ASSIGNED
            ticket.resolution_type = ResolutionType.RESOLVED_BY_HUMAN
            assigned_id = final_state.get("assigned_agent_id")
            if assigned_id:
                ticket.assigned_agent_id = uuid.UUID(assigned_id)
            # Set SLA deadline (e.g. 12 hours for critical/escalated)
            ticket.sla_deadline = datetime.now(timezone.utc) + timedelta(hours=12)

        final_response_text = final_state.get("final_response", "Tu solicitud está siendo procesada.")

        # Log AI Agent Message
        ai_msg_entry = TicketMessage(
            id=uuid.uuid4(),
            ticket_id=ticket.id,
            tenant_id=tenant_id,
            sender_type="ai_agent",
            content=final_response_text,
            agent_reasoning={
                "trace": final_state.get("agent_trace", []),
                "confidence_score": final_state.get("confidence_score"),
                "guardrail_critique": final_state.get("guardrail_critique")
            }
        )
        session.add(ai_msg_entry)
        await session.commit()

        # Format Source Citations
        citations = []
        for chunk in final_state.get("retrieved_chunks", []):
            citations.append(
                SourceCitation(
                    document_name=chunk.get("document_name", "Unknown"),
                    chunk_index=chunk.get("chunk_index", 0),
                    relevance_score=chunk.get("similarity", 0.0),
                    excerpt=chunk.get("content", "")[:200]
                )
            )

        # Format Agent Trace
        traces = [
            AgentStepTrace(node=t["node"], action=t["action"], details=t.get("details", {}))
            for t in final_state.get("agent_trace", [])
        ]

        return ChatMessageResponse(
            ticket_id=ticket.id,
            response=final_response_text,
            resolved_by_ai=resolved_by_ai,
            status=ticket.status,
            resolution_type=ticket.resolution_type,
            confidence_score=float(ticket.confidence_score or 0.0),
            sentiment=ticket.sentiment,
            priority=ticket.priority,
            area_name=area_name,
            category_name=final_state.get("category_name"),
            assigned_agent=final_state.get("assigned_agent_name"),
            citations=citations,
            agent_trace=traces
        )


ticket_service = TicketService()
