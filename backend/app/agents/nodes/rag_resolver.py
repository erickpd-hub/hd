import json
import logging
import uuid
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from app.agents.state import SupportAgentState
from app.agents.tools.actions import support_toolbox
from app.core.config import settings
from app.services.rag_service import rag_service
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

logger = logging.getLogger(__name__)

RAG_RESOLVER_SYSTEM_PROMPT = """You are an elite AI L1 Technical Support Engineer for a SaaS platform.
Your objective is to provide a complete, polite, accurate, and actionable answer to the customer.

RULES:
1. Base your answer strictly on the provided KNOWLEDGE BASE CHUNKS and TOOL OUTPUTS.
2. If the knowledge base does not contain sufficient information to solve the user's issue with high confidence, state what you know and indicate that an L2 engineer may be required.
3. Include clear step-by-step guidance whenever applicable.
4. Cite sources transparently where relevant, e.g., '[Fuente: document_name.pdf]'.
5. End your response with a self-assessed confidence score in a JSON block at the very end formatted as:
```json
{
  "confidence_score": 0.92,
  "can_fully_resolve": true,
  "sources_used": ["filename.pdf"]
}
```
"""


async def rag_resolver_node(state: SupportAgentState) -> Dict[str, Any]:
    """
    RAG & Tool Execution Node:
    Retrieves isolated document chunks, executes appropriate tools, and synthesizes
    a grounded response with citations and confidence metrics.
    """
    trace = list(state.get("agent_trace", []))
    user_message = state.get("user_message", "")
    tenant_id = state.get("tenant_id")
    area_id = state.get("area_id")
    requester_email = state.get("requester_email", "customer@example.com")

    trace.append({
        "node": "RAGResolverNode",
        "action": "Initiating pgvector semantic retrieval and tool detection",
        "details": {"query": user_message}
    })

    # 1. Retrieve Knowledge Base Chunks from pgvector
    retrieved_chunks: List[Dict[str, Any]] = []
    async with AsyncSessionLocal() as session:
        # Set tenant session
        if tenant_id:
            await session.execute(
                text("SET LOCAL app.current_tenant_id = :tenant_id"),
                {"tenant_id": str(tenant_id)}
            )
            area_uuid = uuid.UUID(area_id) if area_id else None
            tenant_uuid = uuid.UUID(tenant_id)
            try:
                retrieved_chunks = await rag_service.search_similar_chunks(
                    session=session,
                    tenant_id=tenant_uuid,
                    query=user_message,
                    area_id=area_uuid,
                    top_k=settings.MAX_RAG_CHUNKS,
                    threshold=settings.RAG_SIMILARITY_THRESHOLD
                )
            except Exception as e:
                logger.warning(f"Vector search failed (e.g. pgvector not initialized yet): {str(e)}")

    trace.append({
        "node": "RAGResolverNode",
        "action": "Knowledge retrieval complete",
        "details": {"chunks_found": len(retrieved_chunks)}
    })

    # 2. Tool Execution Detection
    tool_calls: List[Dict[str, Any]] = []
    msg_lower = user_message.lower()
    if any(k in msg_lower for k in ["plan", "suscripción", "subscription", "factura", "billing"]):
        sub_info = support_toolbox.check_user_subscription(requester_email)
        tool_calls.append({"tool": "check_user_subscription", "result": sub_info})
    if any(k in msg_lower for k in ["caído", "down", "status", "estado", "latencia", "incident"]):
        status_info = support_toolbox.check_system_incidents("core_api")
        tool_calls.append({"tool": "check_system_incidents", "result": status_info})

    # 3. Format Context for LLM
    context_sections = []
    for c in retrieved_chunks:
        context_sections.append(f"--- Document: {c['document_name']} (Chunk {c['chunk_index']}) ---\n{c['content']}")
    
    if tool_calls:
        context_sections.append("--- EXECUTED ACTION TOOL RESULTS ---")
        for tc in tool_calls:
            context_sections.append(f"Tool {tc['tool']}: {json.dumps(tc['result'])}")

    combined_context = "\n\n".join(context_sections) if context_sections else "No matching internal documentation found for this query."

    # 4. Generate Response
    draft_response = ""
    confidence_score = 0.50

    if settings.OPENAI_API_KEY:
        try:
            llm = ChatOpenAI(
                model=settings.L1_AGENT_MODEL_NAME,
                temperature=0.2,
                openai_api_key=settings.OPENAI_API_KEY
            )
            prompt = f"""Context:
{combined_context}

Customer Issue:
{user_message}

Provide the resolution following the instructions."""

            messages = [
                SystemMessage(content=RAG_RESOLVER_SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]

            response = await llm.ainvoke(messages)
            raw_text = response.content.strip()

            # Parse out JSON confidence block if present
            if "```json" in raw_text:
                parts = raw_text.split("```json")
                draft_response = parts[0].strip()
                json_part = parts[1].split("```")[0].strip()
                meta = json.loads(json_part)
                confidence_score = float(meta.get("confidence_score", 0.85))
            else:
                draft_response = raw_text
                confidence_score = 0.82 if retrieved_chunks else 0.55
        except Exception as e:
            logger.error(f"Error in RAG generation: {str(e)}")
            draft_response = "Hemos recibido tu consulta y estamos procesando la información técnica de nuestros sistemas."
            confidence_score = 0.50
    else:
        # Fallback response generator when testing without external LLM API
        if retrieved_chunks or tool_calls:
            draft_response = f"¡Hola! Según la documentación y el estado de tu cuenta ({requester_email}), hemos validado tu solicitud.\n\n"
            if tool_calls:
                draft_response += f"✓ Validación de herramientas: {tool_calls[0]['tool']} completada exitosamente.\n"
            if retrieved_chunks:
                top_doc = retrieved_chunks[0]['document_name']
                draft_response += f"✓ Solución documentada en [{top_doc}]: Sigue los pasos indicados en la guía oficial para resolver tu incidencia.\n\nSi necesitas asistencia adicional, nuestro equipo L2 está a tu disposición."
            confidence_score = 0.88
        else:
            draft_response = "Gracias por contactarnos. No disponemos de información suficiente en la base de conocimientos L1 para resolver tu solicitud automáticamente."
            confidence_score = 0.40

    trace.append({
        "node": "RAGResolverNode",
        "action": "Draft response generated",
        "details": {
            "confidence_score": confidence_score,
            "tool_calls_count": len(tool_calls),
            "response_preview": draft_response[:100]
        }
    })

    return {
        "retrieved_chunks": retrieved_chunks,
        "tool_calls_executed": tool_calls,
        "draft_response": draft_response,
        "confidence_score": confidence_score,
        "agent_trace": trace
    }
