import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy import text
from app.agents.state import SupportAgentState
from app.core.database import AsyncSessionLocal

logger = logging.getLogger(__name__)


async def escalation_node(state: SupportAgentState) -> Dict[str, Any]:
    """
    Escalation & Handoff Node:
    Finds available human L2 agents matching the area, updates assignment status,
    and constructs a transparent handoff briefing.
    """
    trace = list(state.get("agent_trace", []))
    tenant_id = state.get("tenant_id")
    area_name = state.get("area_name", "Technical Support")
    area_id = state.get("area_id")
    user_message = state.get("user_message", "")
    summary = state.get("summary", "Technical inquiry")
    sentiment = state.get("sentiment", "neutral")
    priority = state.get("priority", "medium")

    trace.append({
        "node": "EscalationNode",
        "action": f"Escalating ticket to specialized L2 team: {area_name}",
        "details": {"sentiment": sentiment, "priority": priority}
    })

    assigned_agent_id: Optional[str] = None
    assigned_agent_name: str = "Equipo L2 Especializado"

    # Query L2 human agents assigned to this area in PostgreSQL
    if tenant_id:
        async with AsyncSessionLocal() as session:
            try:
                await session.execute(
                    text("SET LOCAL app.current_tenant_id = :tenant_id"),
                    {"tenant_id": str(tenant_id)}
                )

                # Look for an agent in agent_areas or users with role 'agent_l2'
                query = text("""
                    SELECT u.id, u.full_name, u.email
                    FROM users u
                    LEFT JOIN agent_areas aa ON aa.agent_id = u.id
                    WHERE u.tenant_id = :tenant_id
                      AND u.role = 'agent_l2'
                      AND u.is_active = TRUE
                      AND (:area_id::uuid IS NULL OR aa.area_id = :area_id::uuid)
                    LIMIT 1;
                """)
                res = await session.execute(
                    query,
                    {
                        "tenant_id": str(tenant_id),
                        "area_id": str(area_id) if area_id else None
                    }
                )
                row = res.mappings().first()
                if row:
                    assigned_agent_id = str(row["id"])
                    assigned_agent_name = row["full_name"]
            except Exception as e:
                logger.warning(f"Error querying L2 agent: {str(e)}")

    handoff_message = (
        f"Comprendo la situación y la importancia de resolver este caso. He derivado tu solicitud a nuestro "
        f"equipo de nivel 2 especializado en **{area_name}**"
        + (f" (Especialista asignado: **{assigned_agent_name}**)" if assigned_agent_id else "")
        + ".\n\n"
        f"**Resumen para el agente:** {summary}\n\n"
        f"Un especialista humano revisará el historial técnico y te contactará a la brevedad."
    )

    trace.append({
        "node": "EscalationNode",
        "action": "Ticket successfully assigned and escalated",
        "details": {
            "assigned_agent": assigned_agent_name,
            "assigned_agent_id": assigned_agent_id,
            "target_area": area_name
        }
    })

    return {
        "assigned_agent_id": assigned_agent_id,
        "assigned_agent_name": assigned_agent_name,
        "final_response": handoff_message,
        "resolution_type": "resolved_by_human",
        "is_resolved": False,
        "agent_trace": trace
    }
