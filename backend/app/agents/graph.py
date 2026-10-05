from langgraph.graph import StateGraph, END
from app.agents.state import SupportAgentState
from app.agents.nodes.triage import triage_node
from app.agents.nodes.rag_resolver import rag_resolver_node
from app.agents.nodes.guardrail import guardrail_node
from app.agents.nodes.escalation import escalation_node


def route_after_triage(state: SupportAgentState) -> str:
    """Conditional routing based on triage assessment."""
    if state.get("needs_human_escalation", False):
        return "escalation"
    return "rag_resolver"


def route_after_guardrail(state: SupportAgentState) -> str:
    """Conditional routing based on guardrail grounding & confidence verification."""
    if state.get("is_resolved", False):
        return END
    return "escalation"


def build_support_agent_graph():
    """
    Constructs the Multi-Agent L1 Support DAG Workflow:
    [START] -> triage
                 ├── (critical/demands human) ──────────────────────> escalation -> [END]
                 └── (can attempt L1) -> rag_resolver -> guardrail
                                                           ├── (high confidence / grounded) -> [END]
                                                           └── (low confidence / ungrounded) -> escalation -> [END]
    """
    workflow = StateGraph(SupportAgentState)

    # 1. Register Nodes
    workflow.add_node("triage", triage_node)
    workflow.add_node("rag_resolver", rag_resolver_node)
    workflow.add_node("guardrail", guardrail_node)
    workflow.add_node("escalation", escalation_node)

    # 2. Set Entry Point
    workflow.set_entry_point("triage")

    # 3. Add Edges & Conditional Routing
    workflow.add_conditional_edges(
        "triage",
        route_after_triage,
        {
            "escalation": "escalation",
            "rag_resolver": "rag_resolver"
        }
    )

    workflow.add_edge("rag_resolver", "guardrail")

    workflow.add_conditional_edges(
        "guardrail",
        route_after_guardrail,
        {
            END: END,
            "escalation": "escalation"
        }
    )

    workflow.add_edge("escalation", END)

    # 4. Compile Graph
    return workflow.compile()


support_graph = build_support_agent_graph()
