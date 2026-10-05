import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class DocumentIngestionRequest(BaseModel):
    area_id: uuid.UUID
    document_name: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentIngestionResponse(BaseModel):
    task_id: str
    status: str
    message: str
    tenant_id: uuid.UUID
    area_id: uuid.UUID
    document_name: str


class DocumentChunkRead(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    area_id: uuid.UUID
    document_name: str
    chunk_index: int
    content: str
    metadata_: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
