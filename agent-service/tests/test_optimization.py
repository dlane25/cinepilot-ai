
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.optimization import (
    AgentConflict,
    AgentRecommendation,
)
from app.services.optimization_engine import resolve_and_calculate_impact

client = TestClient(app)

@pytest.fixture
def test_recs():
    return [
        AgentRecommendation(
            recommendation_id="rec-opt-crane-001",
            originating_agent="Producer Agent",
            title="Convert weekly Technocrane rental to daily",
            explanation="Save weekly crane fees.",
            confidence=0.95,
            projected_savings=5800.0,
            shooting_days_saved=0,
            risks_reduced=0,
            affected_scenes=["42"]
        ),
        AgentRecommendation(
            recommendation_id="rec-opt-sched-002",
            originating_agent="Scheduler Agent",
            title="Consolidate adjacent night warehouse shoots",
            explanation="Consolidate days.",
            confidence=0.90,
            projected_savings=120080.0,
            shooting_days_saved=2,
            risks_reduced=1,
            affected_scenes=["42", "43"]
        ),
        # Overlapping recommendations (duplicate savings proposed by a different agent)
        AgentRecommendation(
            recommendation_id="rec-opt-dup-003",
            originating_agent="Director Agent",
            title="Convert weekly Technocrane rental to daily", # Identical title prefix
            explanation="Duplicate savings claim.",
            confidence=0.85,
            projected_savings=5800.0,
            shooting_days_saved=0,
            risks_reduced=0,
            affected_scenes=["42"]
        ),
        # Conflicting recommendation
        AgentRecommendation(
            recommendation_id="rec-opt-conflict-004",
            originating_agent="Continuity Agent",
            title="Group scenes to avoid turnaround",
            explanation="This is a losing conflict.",
            confidence=0.98,
            projected_savings=3000.0,
            shooting_days_saved=0,
            risks_reduced=0,
            affected_scenes=["1", "42"]
        )
    ]

@pytest.fixture
def test_conflicts():
    return [
        AgentConflict(
            conflict_id="conflict-001",
            agents=["Scheduler Agent", "Continuity Agent"],
            title="Scheduler Grouping vs Continuity Wardrobe turnarounds",
            description="Scheduler proposes grouping.",
            tradeoff_explanation="Losing recommendation title matches 'Group scenes to avoid turnaround'",
            recommended_option="rec-opt-sched-002"
        )
    ]

def test_deterministic_impact_engine_and_double_counting(test_recs, test_conflicts):
    """
    Verify that our deterministic arithmetic calculations:
    1. Apply correct savings and days saved.
    2. Exclude losing conflicting recommendations.
    3. Prevent double-counting on identical savings claims.
    """
    impact = resolve_and_calculate_impact(
        baseline_spend=2617300.0,
        baseline_days=31,
        baseline_risks=7,
        recommendations=test_recs,
        conflicts=test_conflicts
    )

    # Assertions:
    # 1. 'rec-opt-conflict-004' (savings 3000.0) is EXCLUDED because it lost the conflict.
    # 2. 'rec-opt-dup-003' (savings 5800.0) is DEDUPLICATED because of the overlapping savings.
    # 3. Compatible recommendations remaining are crane (5800.0) and schedule (120080.0)
    # Total Compatible Savings: 5800 + 120080 = 125,880.00
    assert impact.total_potential_savings == 125880.0
    assert impact.optimized_projected_spend == 2617300.0 - 125880.0
    assert impact.shooting_days_saved == 2
    assert impact.optimized_shooting_days == 29
    assert impact.high_risk_events_reduced == 1

def test_api_optimize_production_endpoint():
    """Verify that the POST /api/v1/agents/optimize-production REST endpoint triggers successfully."""
    payload = {
        "production_id": "prod-echopoint-001",
        "baseline_spend": 2617300.0,
        "baseline_days": 31,
        "baseline_risks": 7
    }
    response = client.post("/api/v1/agents/optimize-production", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["production_id"] == "prod-echopoint-001"
    assert data["impact"]["total_potential_savings"] == 125880.0
    assert len(data["proposal"]["recommendations"]) == 4
    assert len(data["proposal"]["conflicts"]) == 1
    assert len(data["proposal"]["agreements"]) == 1
