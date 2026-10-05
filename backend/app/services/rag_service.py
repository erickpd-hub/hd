import io
import re
import uuid
from typing import List, Dict, Any, Tuple, Optional
import pypdf
from langchain_openai import OpenAIEmbeddings
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings


class RAGService:
    def __init__(self):
        # Initialize OpenAI embeddings if key exists, otherwise provide fallback mechanism
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL_NAME,
            dimensions=settings.EMBEDDING_DIMENSIONS,
            openai_api_key=settings.OPENAI_API_KEY or "dummy-key-for-init"
        )

    @staticmethod
    def extract_text(file_content: bytes, filename: str) -> str:
        """Extract and sanitize text from PDF, Markdown, or TXT."""
        extension = filename.split(".")[-1].lower()
        extracted_text = ""

        if extension == "pdf":
            reader = pypdf.PdfReader(io.BytesIO(file_content))
            pages = []
            for i, page in enumerate(reader.pages):
                text_page = page.extract_text() or ""
                pages.append(f"[Page {i+1}]\n{text_page}")
            extracted_text = "\n\n".join(pages)
        elif extension in ["md", "markdown", "txt"]:
            extracted_text = file_content.decode("utf-8", errors="replace")
        else:
            raise ValueError(f"Unsupported file format: {extension}")

        # Sanitization: remove null bytes, excessive spaces, keep markdown structure
        cleaned = re.sub(r"\x00", "", extracted_text)
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    @staticmethod
    def structured_chunking(
        text_content: str,
        chunk_size: int = 800,
        chunk_overlap: int = 150
    ) -> List[Dict[str, Any]]:
        """
        Section-based chunking that injects hierarchical header breadcrumbs
        (e.g., 'Document > Section > Subsection') to maintain context.
        """
        lines = text_content.splitlines()
        chunks: List[Dict[str, Any]] = []

        current_headers = {1: "", 2: "", 3: ""}
        current_chunk_lines: List[str] = []
        current_char_count = 0
        chunk_idx = 0

        def get_header_context():
            breadcrumbs = [current_headers[lvl] for lvl in (1, 2, 3) if current_headers[lvl]]
            return " > ".join(breadcrumbs) if breadcrumbs else "General"

        for line in lines:
            header_match = re.match(r"^(#{1,3})\s+(.*)", line)
            if header_match:
                level = len(header_match.group(1))
                title = header_match.group(2).strip()
                current_headers[level] = title
                # Clear deeper sub-headers
                for l in range(level + 1, 4):
                    current_headers[l] = ""

            line_length = len(line) + 1
            if current_char_count + line_length > chunk_size and current_chunk_lines:
                # Flush chunk
                content_text = "\n".join(current_chunk_lines)
                context_prefix = f"[Context: {get_header_context()}]\n"
                full_chunk_text = context_prefix + content_text

                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": full_chunk_text,
                    "header_breadcrumb": get_header_context(),
                    "char_count": len(full_chunk_text)
                })
                chunk_idx += 1

                # Retain overlap lines
                overlap_lines: List[str] = []
                overlap_count = 0
                for rev_line in reversed(current_chunk_lines):
                    if overlap_count + len(rev_line) < chunk_overlap:
                        overlap_lines.insert(0, rev_line)
                        overlap_count += len(rev_line)
                    else:
                        break
                current_chunk_lines = overlap_lines
                current_char_count = overlap_count

            current_chunk_lines.append(line)
            current_char_count += line_length

        # Flush remaining lines
        if current_chunk_lines:
            content_text = "\n".join(current_chunk_lines)
            context_prefix = f"[Context: {get_header_context()}]\n"
            full_chunk_text = context_prefix + content_text
            chunks.append({
                "chunk_index": chunk_idx,
                "content": full_chunk_text,
                "header_breadcrumb": get_header_context(),
                "char_count": len(full_chunk_text)
            })

        return chunks

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Vectorize a batch of text chunks using text-embedding-3-small."""
        if not settings.OPENAI_API_KEY:
            # Fallback deterministic vector for testing when API key is missing
            import hashlib
            dummy_vectors = []
            for t in texts:
                val = int(hashlib.md5(t.encode()).hexdigest(), 16)
                # Create 1536 float array normalized
                vec = [((val >> (i % 32)) & 1) * 0.05 for i in range(settings.EMBEDDING_DIMENSIONS)]
                dummy_vectors.append(vec)
            return dummy_vectors

        return self.embeddings.embed_documents(texts)

    def generate_query_embedding(self, query: str) -> List[float]:
        """Vectorize single query."""
        if not settings.OPENAI_API_KEY:
            return self.generate_embeddings_batch([query])[0]
        return self.embeddings.embed_query(query)

    async def search_similar_chunks(
        self,
        session: AsyncSession,
        tenant_id: uuid.UUID,
        query: str,
        area_id: Optional[uuid.UUID] = None,
        top_k: int = 5,
        threshold: float = 0.65
    ) -> List[Dict[str, Any]]:
        """
        Multi-tenant vector search over document_chunks with pgvector cosine similarity.
        Strictly isolated by tenant_id and optional area_id.
        """
        query_vector = self.generate_query_embedding(query)
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"

        # Cosine distance: 1 - cosine_similarity. So cosine similarity = 1 - (embedding <=> query_vector)
        sql = text("""
            SELECT 
                id, 
                tenant_id, 
                area_id, 
                document_name, 
                chunk_index, 
                content, 
                metadata,
                1 - (embedding <=> :vector::vector) AS similarity
            FROM document_chunks
            WHERE tenant_id = :tenant_id
              AND (:area_id::uuid IS NULL OR area_id = :area_id)
              AND (1 - (embedding <=> :vector::vector)) >= :threshold
            ORDER BY embedding <=> :vector::vector ASC
            LIMIT :top_k;
        """)

        result = await session.execute(
            sql,
            {
                "vector": vector_str,
                "tenant_id": str(tenant_id),
                "area_id": str(area_id) if area_id else None,
                "threshold": threshold,
                "top_k": top_k
            }
        )

        rows = result.mappings().all()
        chunks = []
        for r in rows:
            chunks.append({
                "id": str(r["id"]),
                "document_name": r["document_name"],
                "chunk_index": r["chunk_index"],
                "content": r["content"],
                "metadata": r["metadata"],
                "similarity": float(r["similarity"])
            })
        return chunks


rag_service = RAGService()
