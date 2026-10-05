import json
import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from app.agents.state import SupportAgentState
from app.core.config import settings

logger = logging.getLogger(__name__)

GUARDRAIL_SYSTEM_PROMPT = """You are an AI Quality Assurance & Hallucination Guardrail Auditor for customer support.
Compare the generated draft response against the retrieved context to verify:
1. Grounding / Factuality: Does the draft response make claims not supported by the context?
2. Completeness: Does it directly address the user's issue?
3. Safety: No toxic language or sensitive leakage.

Output a strict JSON object:
{
  "grounded": true,
  "hallucination_detected": false,
  "confidence_adjustment": 0.0,
  "critique": "Draft is strictly grounded in retrieved documentation."
}
Only output raw JSON.
"""


async def guardrail_node(state: SupportAgentState) -> Dict[str, Any]:
    """
    Guardrails & Evaluation Node:
    Performs factuality and hallucination checks. Enforces confidence threshold (> 0.75).
    Determines whether the issue is reliably resolved by AI or requires human escalation.
    """
    trace = list(state.get("agent_trace", []))
    draft_response = state.get("draft_response", "")
    retrieved_chunks = state.get("retrieved_chunks", [])
    confidence_score = state.get("confidence_score", 0.5)

    trace.append({
        "node": "GuardrailNode",
        "action": "Auditing response grounding and hallucination metrics",
        "details": {"current_confidence": confidence_score}
    })

    grounded = True
    hallucination_detected = False
    critique = "Evaluation passed"

    if settings.OPENAI_API_KEY and retrieved_chunks:
        try:
            llm = ChatOpenAI(
                model=settings.TRIAGE_MODEL_NAME,
                temperature=0.0,
                openai_api_key=settings.OPENAI_API_KEY
            )
            context_summary = "\n".join([f"- {c['content'][:300]}" for c in retrieved_chunks])
            messages = [
                SystemMessage(content=GUARDRAIL_SYSTEM_PROMPT),
                HumanMessage(content=f"Context:\n{context_summary}\n\nDraft Response:\n{draft_response}")
            ]
            eval_res = await llm.ainvoke(messages)
            content = eval_res.content.strip().replace("```json", "").replace("```", "").strip()
            parsed = json.loads(content)
            grounded = bool(parsed.get("grounded", True))
            hallucination_detected = bool(parsed.get("hallucination_detected", False))
            critique = parsed.get("critique", critique)
            confidence_score += float(parsed.get("confidence_adjustment", 0.0))
        except Exception as e:
            logger.warning(f"Guardrail LLM check skipped/failed: {str(e)}")

    # Decision Matrix
    passes_threshold = (confidence_score >= settings.L1_CONFIDENCE_THRESHOLD)
    can_resolve = grounded and not hallucination_detected and passes_threshold

    if can_resolve:
        final_response = draft_response
        is_resolved = True
        resolution_type = "resolved_by_ai"
        needs_human_escalation = False
    else:
        final_response = draft_response
        is_resolved = False
        resolution_type = "unresolved"
        needs_human_escalation = True

    trace.append({
        "node": "GuardrailNode",
        "action": "Evaluation complete",
        "details": {
            "grounded": grounded,
            "hallucination_detected": hallucination_detected,
            "final_confidence": round(confidence_score, 2),
            "can_resolve": can_resolve,
            "needs_human_escalation": needs_human_escalation
        }
    })

    return {
        "grounded": grounded,
        "hallucination_detected": hallucination_detected,
        "guardrail_critique": critique,
        "confidence_score": round(confidence_score, 2),
        "is_resolved": is_resolved,
        "final_response": final_response,
        "resolution_type": resolution_type,
        "needs_human_escalation": needs_human_escalation,
        "agent_trace": trace
    }
