from typing import TypedDict, List, Dict, Any, Optional


class SupportAgentState(TypedDict, total=False):
    # Tenant & Request Context
    tenant_id: str
    requester_id: str
    requester_email: str
    requester_name: str
    ticket_id: Optional[str]
    user_message: str
    messages_history: List[Dict[str, str]]

    # Triage outputs
    sentiment: str  # 'positive', 'neutral', 'frustrated'
    priority: str   # 'low', 'medium', 'high', 'critical'
    intent: str
    summary: str
    area_id: Optional[str]
    area_name: Optional[str]
    category_id: Optional[str]
    category_name: Optional[str]
    needs_human_escalation: bool
    escalation_reason: Optional[str]

    # RAG & Tool Execution
    retrieved_chunks: List[Dict[str, Any]]
    tool_calls_executed: List[Dict[str, Any]]
    draft_response: str
    confidence_score: float

    # Guardrail Evaluation
    grounded: bool
    hallucination_detected: bool
    guardrail_critique: Optional[str]

    # Escalation & Resolution
    assigned_agent_id: Optional[str]
    assigned_agent_name: Optional[str]
    is_resolved: bool
    final_response: str
    resolution_type: str  # 'resolved_by_ai', 'resolved_by_human', 'unresolved'

    # Audit & Observability trace
    agent_trace: List[Dict[str, Any]]
