import asyncio
import base64
import uuid
from typing import Dict, Any
from celery.utils.log import get_task_logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.workers.celery_app import celery_app
from app.core.config import settings
from app.services.rag_service import rag_service

logger = get_task_logger(__name__)

# Synchronous engine for Celery tasks (lazy-initialized)
_sync_engine = None
_SyncSessionLocal = None


def _get_sync_session():
    global _sync_engine, _SyncSessionLocal
    if _sync_engine is None:
        _sync_engine = create_engine(
            settings.SYNC_DATABASE_URL,
            pool_pre_ping=True
        )
        _SyncSessionLocal = sessionmaker(bind=_sync_engine, autoflush=False, autocommit=False)
    return _SyncSessionLocal


@celery_app.task(bind=True, name="app.workers.ingestion.process_document_ingestion")
def process_document_ingestion(
    self,
    file_base64: str,
    filename: str,
    tenant_id: str,
    area_id: str,
    custom_metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Asynchronous document ingestion worker:
    1. Extracts and sanitizes content.
    2. Performs section-aware hierarchical chunking.
    3. Enriches metadata with tenant_id, area_id, document_name.
    4. Generates OpenAI embeddings in batch.
    5. Stores records in document_chunks with pgvector indexing.
    """
    logger.info(f"Starting ingestion for file='{filename}', tenant='{tenant_id}', area='{area_id}'")
    try:
        # 1. Decode & Extract
        file_bytes = base64.b64decode(file_base64)
        raw_text = rag_service.extract_text(file_bytes, filename)
        logger.info(f"Extracted {len(raw_text)} characters from '{filename}'")

        # 2. Structured Section-aware Chunking
        chunks = rag_service.structured_chunking(raw_text, chunk_size=800, chunk_overlap=150)
        logger.info(f"Generated {len(chunks)} chunks for '{filename}'")

        if not chunks:
            return {"status": "warning", "message": "Document contains no extractable text", "chunks_created": 0}

        # 3. Batch Vectorization
        chunk_texts = [c["content"] for c in chunks]
        embeddings = rag_service.generate_embeddings_batch(chunk_texts)

        # 4. Insert into PostgreSQL with RLS context
        with _get_sync_session()() as session:
            # Set PostgreSQL session for tenant RLS
            session.execute(
                text("SET LOCAL app.current_tenant_id = :tenant_id"),
                {"tenant_id": tenant_id}
            )

            insert_stmt = text("""
                INSERT INTO document_chunks (
                    id, tenant_id, area_id, document_name, chunk_index, content, embedding, metadata
                ) VALUES (
                    :id, :tenant_id, :area_id, :document_name, :chunk_index, :content, :embedding::vector, :metadata::jsonb
                )
            """)

            import json
            for i, chunk in enumerate(chunks):
                chunk_id = str(uuid.uuid4())
                emb_vector_str = "[" + ",".join(map(str, embeddings[i])) + "]"
                enriched_metadata = {
                    **custom_metadata,
                    "tenant_id": tenant_id,
                    "area_id": area_id,
                    "document_name": filename,
                    "header_breadcrumb": chunk["header_breadcrumb"],
                    "char_count": chunk["char_count"]
                }

                session.execute(
                    insert_stmt,
                    {
                        "id": chunk_id,
                        "tenant_id": tenant_id,
                        "area_id": area_id,
                        "document_name": filename,
                        "chunk_index": chunk["chunk_index"],
                        "content": chunk["content"],
                        "embedding": emb_vector_str,
                        "metadata": json.dumps(enriched_metadata)
                    }
                )

            session.commit()
            logger.info(f"Successfully stored {len(chunks)} chunks in document_chunks for '{filename}'")

        return {
            "status": "success",
            "document_name": filename,
            "tenant_id": tenant_id,
            "area_id": area_id,
            "chunks_created": len(chunks)
        }

    except Exception as exc:
        logger.error(f"Error ingesting document '{filename}': {str(exc)}", exc_info=True)
        raise exc
