import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.deps import get_tenant_db, get_tenant_id_from_header
from app.models.ticket import (
    Ticket,
    TicketStatus,
    TicketPriority,
    AssignmentStatus,
    ResolutionType,
)
from app.schemas.ticket import (
    TicketRead,
    TicketCreate,
    TicketUpdate,
    TicketMessageRead,
)

router = APIRouter()


@router.get("/", response_model=List[TicketRead])
async def list_tickets(
    status_filter: Optional[TicketStatus] = Query(None, alias="status"),
    priority_filter: Optional[TicketPriority] = Query(None, alias="priority"),
    area_id: Optional[uuid.UUID] = None,
    resolved_by_ai: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    tenant_id: uuid.UUID = Depends(get_tenant_id_from_header),
    db: AsyncSession = Depends(get_tenant_db)
):
    """List tickets for the current tenant with RLS enforcement."""
    stmt = (
        select(Ticket)
        .where(Ticket.tenant_id == tenant_id)
        .options(
            selectinload(Ticket.messages),
            selectinload(Ticket.area),
            selectinload(Ticket.category),
            selectinload(Ticket.requester),
            selectinload(Ticket.assigned_agent)
        )
        .order_by(desc(Ticket.created_at))
        .offset(offset)
        .limit(limit)
    )

    if status_filter:
        stmt = stmt.where(Ticket.status == status_filter)
    if priority_filter:
        stmt = stmt.where(Ticket.priority == priority_filter)
    if area_id:
        stmt = stmt.where(Ticket.area_id == area_id)
    if resolved_by_ai is not None:
        stmt = stmt.where(Ticket.resolved_by_ai == resolved_by_ai)

    result = await db.execute(stmt)
    tickets = result.scalars().all()

    response: List[TicketRead] = []
    for t in tickets:
        response.append(
            TicketRead(
                id=t.id,
                tenant_id=t.tenant_id,
                title=t.title,
                description=t.description,
                status=t.status,
                assignment_status=t.assignment_status,
                resolution_type=t.resolution_type,
                priority=t.priority,
                sentiment=t.sentiment,
                summary=t.summary,
                resolution_notes=t.resolution_notes,
                resolved_by_ai=t.resolved_by_ai,
                confidence_score=float(t.confidence_score) if t.confidence_score else None,
                sla_deadline=t.sla_deadline,
                area_id=t.area_id,
                area_name=t.area.name if t.area else None,
                category_id=t.category_id,
                category_name=t.category.category_name if t.category else None,
                requester_id=t.requester_id,
                requester_email=t.requester.email if t.requester else None,
                assigned_agent_id=t.assigned_agent_id,
                assigned_agent_name=t.assigned_agent.full_name if t.assigned_agent else None,
                created_at=t.created_at,
                updated_at=t.updated_at,
                messages=[TicketMessageRead.model_validate(m) for m in t.messages]
            )
        )
    return response


@router.get("/{ticket_id}", response_model=TicketRead)
async def get_ticket(
    ticket_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_tenant_id_from_header),
    db: AsyncSession = Depends(get_tenant_db)
):
    """Retrieve details and full message history of a single ticket."""
    stmt = (
        select(Ticket)
        .where(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id)
        .options(
            selectinload(Ticket.messages),
            selectinload(Ticket.area),
            selectinload(Ticket.category),
            selectinload(Ticket.requester),
            selectinload(Ticket.assigned_agent)
        )
    )
    result = await db.execute(stmt)
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return TicketRead(
        id=t.id,
        tenant_id=t.tenant_id,
        title=t.title,
        description=t.description,
        status=t.status,
        assignment_status=t.assignment_status,
        resolution_type=t.resolution_type,
        priority=t.priority,
        sentiment=t.sentiment,
        summary=t.summary,
        resolution_notes=t.resolution_notes,
        resolved_by_ai=t.resolved_by_ai,
        confidence_score=float(t.confidence_score) if t.confidence_score else None,
        sla_deadline=t.sla_deadline,
        area_id=t.area_id,
        area_name=t.area.name if t.area else None,
        category_id=t.category_id,
        category_name=t.category.category_name if t.category else None,
        requester_id=t.requester_id,
        requester_email=t.requester.email if t.requester else None,
        assigned_agent_id=t.assigned_agent_id,
        assigned_agent_name=t.assigned_agent.full_name if t.assigned_agent else None,
        created_at=t.created_at,
        updated_at=t.updated_at,
        messages=[TicketMessageRead.model_validate(m) for m in t.messages]
    )


@router.patch("/{ticket_id}", response_model=TicketRead)
async def update_ticket(
    ticket_id: uuid.UUID,
    payload: TicketUpdate,
    tenant_id: uuid.UUID = Depends(get_tenant_id_from_header),
    db: AsyncSession = Depends(get_tenant_db)
):
    """Update ticket status, agent assignment, or resolution notes."""
    stmt = select(Ticket).where(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id)
    result = await db.execute(stmt)
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if payload.status is not None:
        t.status = payload.status
    if payload.assignment_status is not None:
        t.assignment_status = payload.assignment_status
    if payload.assigned_agent_id is not None:
        t.assigned_agent_id = payload.assigned_agent_id
    if payload.priority is not None:
        t.priority = payload.priority
    if payload.resolution_type is not None:
        t.resolution_type = payload.resolution_type
    if payload.resolution_notes is not None:
        t.resolution_notes = payload.resolution_notes

    await db.commit()
    return await get_ticket(ticket_id=ticket_id, tenant_id=tenant_id, db=db)
