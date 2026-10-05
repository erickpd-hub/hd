from typing import List, Dict
from pydantic import BaseModel


class MetricCard(BaseModel):
    label: str
    value: float
    unit: str = ""
    trend_percentage: float = 0.0
    status: str = "neutral"  # positive, negative, neutral


class AreaDistribution(BaseModel):
    area_name: str
    ticket_count: int
    ai_resolved_count: int
    escalated_count: int


class SentimentBreakdown(BaseModel):
    sentiment: str
    count: int
    percentage: float


class SlaCompliance(BaseModel):
    within_sla: int
    breached: int
    compliance_rate: float


class AnalyticsDashboardData(BaseModel):
    total_tickets: int
    ai_resolution_rate: float
    human_escalation_rate: float
    avg_confidence_score: float
    active_escalated_tickets: int
    sentiment_distribution: List[SentimentBreakdown]
    area_metrics: List[AreaDistribution]
    sla_compliance: SlaCompliance
    recent_resolution_timeline: List[Dict[str, int]]
