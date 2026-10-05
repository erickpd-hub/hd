import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.deps import get_tenant_db, get_tenant_id_from_header
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.ticket_service import ticket_service

router = APIRouter()


@router.post("/", response_model=ChatMessageResponse, status_code=status.HTTP_200_OK)
async def send_chat_message(
    payload: ChatMessageRequest,
    tenant_id: uuid.UUID = Depends(get_tenant_id_from_header),
    db: AsyncSession = Depends(get_tenant_db)
):
    """
    Main endpoint for customer messages:
    Runs the multi-agent DAG (Triage -> RAG -> Guardrail -> Escalation), persists conversation,
    updates ticket status, and returns full resolution with traces and citations.
    """
    try:
        response = await ticket_service.process_chat_interaction(
            session=db,
            tenant_id=tenant_id,
            user_message=payload.message,
            ticket_id=payload.ticket_id,
            requester_email=payload.requester_email or "customer@example.com",
            requester_name=payload.requester_name or "Customer User",
            metadata=payload.metadata
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing multi-agent workflow: {str(e)}"
        )
