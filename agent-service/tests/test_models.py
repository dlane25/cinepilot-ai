import pytest
from pydantic import ValidationError

from app.models.production import (
    ProductionContext,
    SceneInput,
)
from app.models.responses import (
    DirectorAnalysisResult,
    ProducerAnalysisResult,
    ProductionOpportunity,
    ProductionRiskObservation,
)


def test_scene_input_validation():
    """Verify validation constraints on SceneInput."""
    # Valid input
    scene = SceneInput(
        scene_number="12A",
        scene_heading="INT. STUDIO - DAY",
        int_ext="INT",
        day_night="DAY",
        characters=["Maya"],
        production_requirements=["None"]
    )
    assert scene.scene_number == "12A"
    assert scene.int_ext == "INT"

    # Invalid int_ext literal value
    with pytest.raises(ValidationError):
        SceneInput(
            scene_number="12",
            scene_heading="INT. STUDIO - DAY",
            int_ext="OUTSIDE",  # type: ignore
            day_night="DAY"
        )

def test_production_context_validation():
    """Verify constraints on ProductionContext."""
    ctx = ProductionContext(
        approved_budget=2400000.0,
        projected_spend=2617300.0,
        planned_shooting_days=31,
        current_shooting_day=14
    )
    assert ctx.approved_budget == 2400000.0

def test_director_analysis_result_validation():
    """Verify schema verification on DirectorAnalysisResult."""
    # Valid schema output
    risk = ProductionRiskObservation(
        title="Weather Exposure",
        description="Rain in forecast",
        severity="High",
        probability=0.8,
        financial_exposure=24800.0,
        affected_production_area="Schedule",
        recommended_mitigation="Use cover set"
    )
    
    result = DirectorAnalysisResult(
        scene_complexity="Medium",
        location_requirements=["Outdoor cabin"],
        production_requirements=["Snow machine"],
        cast_background_requirements=["2 extras"],
        physical_production_considerations="Safe setups",
        risk_observations=[risk],
        production_notes="Wrap early"
    )
    assert result.scene_complexity == "Medium"
    assert len(result.risk_observations) == 1

def test_producer_analysis_result_and_advisory_approval():
    """Verify schema for ProducerAnalysisResult and ensure human-approval actions remain advisory."""
    opp = ProductionOpportunity(
        title="Crane Shift",
        description="Switch weekly to daily",
        recommended_action="Contact grip house",
        estimated_savings=5800.0,
        confidence=0.95
    )
    
    result = ProducerAnalysisResult(
        cost_concerns=["Over budget on extras"],
        expensive_requirements=["Extras"],
        financial_exposure=24800.0,
        optimization_opportunities=[opp],
        potential_savings=5800.0,
        schedule_implications="No change",
        human_approval_required=True
    )
    
    # Assert human_approval_required is set to true, making it advisory rather than executing autonomously
    assert result.human_approval_required is True
    assert result.potential_savings == 5800.0
