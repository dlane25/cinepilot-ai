from app.core.logging import logger
from app.models.optimization import (
    AgentConflict,
    AgentRecommendation,
    OptimizationImpact,
)


def resolve_and_calculate_impact(
    baseline_spend: float,
    baseline_days: int,
    baseline_risks: int,
    recommendations: list[AgentRecommendation],
    conflicts: list[AgentConflict]
) -> OptimizationImpact:
    """
    Pure deterministic arithmetic engine:
    1. Filters and excludes conflicting recommendations where the Optimizer proposed a compromise.
    2. Prevents double-counting of savings if multiple agents propose overlapping opportunities.
    3. Calculates cumulative optimized spend, days, and risk reduction.
    """
    logger.info("[OPTIMIZATION ENGINE] Triggering deterministic impact calculations...")

    # Set of recommendation IDs that are excluded due to losing conflicts
    excluded_recs = set()
    for conflict in conflicts:
        # If the Optimizer's recommended option is explicitly stated,
        # we exclude the losing recommendation IDs in the conflict from the metrics summation.
        for rec in recommendations:
            # Simple keyword matching or title checking to identify losing option
            if rec.title.lower() in conflict.tradeoff_explanation.lower() and rec.recommendation_id != conflict.recommended_option:
                logger.info(f"[OPTIMIZATION ENGINE] Excluding conflicting recommendation: {rec.recommendation_id} ({rec.title})")
                excluded_recs.add(rec.recommendation_id)

    compatible_recs = [r for r in recommendations if r.recommendation_id not in excluded_recs]

    total_savings = 0.0
    days_saved = 0
    risks_reduced = 0

    # Track unique savings segments to prevent double-counting
    seen_savings_signatures = set()

    for rec in compatible_recs:
        # Create a unique signature based on rounded savings and part of title to deduplicate identical opportunities
        savings_sig = f"{round(rec.projected_savings, 2)}-{rec.title.lower()[:15]}"

        if rec.projected_savings > 0:
            if savings_sig in seen_savings_signatures:
                logger.warning(f"[OPTIMIZATION ENGINE] Deduplicated double-counted savings on: {rec.title} (${rec.projected_savings})")
                continue
            seen_savings_signatures.add(savings_sig)
            total_savings += rec.projected_savings

        days_saved += rec.shooting_days_saved
        risks_reduced += rec.risks_reduced

    optimized_spend = max(0.0, baseline_spend - total_savings)
    optimized_days = max(1, baseline_days - days_saved)
    optimized_risks = max(0, baseline_risks - risks_reduced)

    return OptimizationImpact(
        baseline_projected_spend=baseline_spend,
        optimized_projected_spend=optimized_spend,
        total_potential_savings=total_savings,
        baseline_shooting_days=baseline_days,
        optimized_shooting_days=optimized_days,
        shooting_days_saved=days_saved,
        baseline_high_risk_events=baseline_risks,
        optimized_high_risk_events=optimized_risks,
        high_risk_events_reduced=risks_reduced
    )
