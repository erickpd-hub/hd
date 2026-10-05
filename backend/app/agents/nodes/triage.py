import json
import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from app.agents.state import SupportAgentState
from app.core.config import settings

logger = logging.getLogger(__name__)

TRIAGE_SYSTEM_PROMPT = """You are an expert L1 Customer Support Triage Specialist for a multi-tenant B2B SaaS platform.
Analyze the customer's query and output a strict JSON object with the following fields:

- sentiment: "positive" | "neutral" | "frustrated"
- priority: "low" | "medium" | "high" | "critical"
- intent: A concise string describing what the customer wants
- summary: A clear 1-2 sentence executive summary of the issue
- area_name: Best matching department: "Technical Support", "Billing & Subscriptions", "Security & Compliance", "Infrastructure", or "General"
- category_name: Specific subcategory (e.g., "API Errors", "Invoice Query", "SSO Authentication", "Performance Degradation")
- needs_immediate_escalation: boolean (true IF the user explicitly demands a human, threatens legal action, reports severe data loss/security breach, or has critical urgency; otherwise false)
- escalation_reason: string or null (explanation if needs_immediate_escalation is true)

Output ONLY raw valid JSON, no markdown codeblocks, no commentary.
"""


async def triage_node(state: SupportAgentState) -> Dict[str, Any]:
    """
    Triage and classification node:
    Extracts sentiment, priority, intent, departmental area, category, and determines
    whether an immediate human escalation is needed.
    """
    trace = list(state.get("agent_trace", []))
    user_message = state.get("user_message", "")

    trace.append({
        "node": "TriageNode",
        "action": "Classifying message sentiment, area, and urgency",
        "details": {"message_preview": user_message[:100]}
    })

    # Default fallback values
    triage_data = {
        "sentiment": "neutral",
        "priority": "medium",
        "intent": "Customer inquiry",
        "summary": user_message[:120],
        "area_name": "Technical Support",
        "category_name": "General Inquiries",
        "needs_immediate_escalation": False,
        "escalation_reason": None
    }

    if settings.OPENAI_API_KEY:
        try:
            llm = ChatOpenAI(
                model=settings.TRIAGE_MODEL_NAME,
                temperature=0.0,
                openai_api_key=settings.OPENAI_API_KEY
            )
            messages = [
                SystemMessage(content=TRIAGE_SYSTEM_PROMPT),
                HumanMessage(content=f"Customer Query: {user_message}")
            ]
            response = await llm.ainvoke(messages)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            elif content.startswith("```"):
                content = content.replace("```", "").strip()

            parsed = json.loads(content)
            triage_data.update(parsed)
        except Exception as e:
            logger.warning(f"Triage LLM call failed, falling back to heuristics: {str(e)}")
            # Heuristic sentiment & escalation fallback
            msg_lower = user_message.lower()
            if any(w in msg_lower for w in ["human", "agente humano", "persona", "escalar", "demandar", "lawyer", "urgente"]):
                triage_data["needs_immediate_escalation"] = True
                triage_data["escalation_reason"] = "Customer explicitly requested human intervention or critical urgency detected."
                triage_data["priority"] = "high"
            if any(w in msg_lower for w in ["terrible", "fatal", "enojado", "bad", "angry", "broken", "malo"]):
                triage_data["sentiment"] = "frustrated"
    else:
        # Heuristic rules when OpenAI API key is not configured
        msg_lower = user_message.lower()
        if any(w in msg_lower for w in ["factura", "cobro", "pago", "invoice", "billing", "tarjeta", "credit card"]):
            triage_data["area_name"] = "Billing & Subscriptions"
            triage_data["category_name"] = "Payment Processing"
        elif any(w in msg_lower for w in ["seguridad", "security", "breach", "hack", "contraseña", "password"]):
            triage_data["area_name"] = "Security & Compliance"
            triage_data["category_name"] = "Authentication & Access"
        else:
            triage_data["area_name"] = "Technical Support"
            triage_data["category_name"] = "Platform Bug"

        if any(w in msg_lower for w in ["humano", "persona", "abogado", "urgent", "crítico", "critical"]):
            triage_data["needs_immediate_escalation"] = True
            triage_data["escalation_reason"] = "Customer requested human or urgent flag detected"
            triage_data["priority"] = "high"

        if any(w in msg_lower for w in ["enojado", "molesto", "frustrated", "bad", "horrible", "error"]):
            triage_data["sentiment"] = "frustrated"

    trace.append({
        "node": "TriageNode",
        "action": "Classification complete",
        "details": {
            "sentiment": triage_data["sentiment"],
            "priority": triage_data["priority"],
            "area_name": triage_data["area_name"],
            "needs_immediate_escalation": triage_data["needs_immediate_escalation"]
        }
    })

    return {
        "sentiment": triage_data["sentiment"],
        "priority": triage_data["priority"],
        "intent": triage_data["intent"],
        "summary": triage_data["summary"],
        "area_name": triage_data["area_name"],
        "category_name": triage_data["category_name"],
        "needs_human_escalation": triage_data["needs_immediate_escalation"],
        "escalation_reason": triage_data["escalation_reason"],
        "agent_trace": trace
    }
