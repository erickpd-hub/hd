from fastapi import APIRouter
from app.api.v1.endpoints import chat, tickets, documents, analytics, tenants

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["Chat & Multi-Agent Runtime"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["Tickets & Escalations"])
api_router.include_router(documents.router, prefix="/documents", tags=["Knowledge Base & RAG Ingestion"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Operational Analytics"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["Tenants & Provisioning"])
