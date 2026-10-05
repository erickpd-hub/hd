import base64
import json
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.deps import get_tenant_db, get_tenant_id_from_header
from app.schemas.document import DocumentIngestionResponse
from app.workers.ingestion import process_document_ingestion
from app.core.config import settings

router = APIRouter()


@router.post("/upload", response_model=DocumentIngestionResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_knowledge_document(
    file: UploadFile = File(...),
    area_id: str = Form(...),
    metadata_json: Optional[str] = Form("{}"),
    tenant_id: uuid.UUID = Depends(get_tenant_id_from_header),
    db: AsyncSession = Depends(get_tenant_db)
):
    """
    Upload and ingest internal documentation for RAG.
    Dispatches asynchronous task to extract text, perform hierarchical chunking,
    and generate OpenAI pgvector embeddings.
    """
    filename = file.filename or "uploaded_doc.txt"
    extension = filename.split(".")[-1].lower()
    if extension not in ["pdf", "md", "markdown", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only PDF, Markdown (.md), and plain text (.txt) files are supported."
        )

    try:
        content_bytes = await file.read()
        file_base64 = base64.b64encode(content_bytes).decode("utf-8")
        parsed_metadata = json.loads(metadata_json or "{}")

        area_uuid = uuid.UUID(area_id)

        # Dispatch Celery async task (with in-process fallback if Celery/Redis is not up)
        task_id = str(uuid.uuid4())
        try:
            async_result = process_document_ingestion.delay(
                file_base64=file_base64,
                filename=filename,
                tenant_id=str(tenant_id),
                area_id=str(area_uuid),
                custom_metadata=parsed_metadata
            )
            task_id = async_result.id
        except Exception:
            # Fallback direct call
            process_document_ingestion(
                file_base64=file_base64,
                filename=filename,
                tenant_id=str(tenant_id),
                area_id=str(area_uuid),
                custom_metadata=parsed_metadata
            )

        return DocumentIngestionResponse(
            task_id=task_id,
            status="processing",
            message=f"Document '{filename}' scheduled for ingestion and vector indexing.",
            tenant_id=tenant_id,
            area_id=area_uuid,
            document_name=filename
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit document for processing: {str(e)}"
        )
