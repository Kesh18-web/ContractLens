"""
Metrics and analytics endpoints
"""
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query

from app.core.config import Settings, get_settings
from app.services.firestore_client import FirestoreClient
from app.dependencies.services import get_firestore_client

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/summary", response_model=Dict[str, Any])
async def get_metrics_summary(
    days: int = Query(default=7, ge=1, le=30, description="Number of days to analyse"),
    settings: Settings = Depends(get_settings),
    firestore_client: FirestoreClient = Depends(get_firestore_client),
) -> Dict[str, Any]:
    """
    Aggregated metrics summary pulled from Firestore.

    Args:
        days: Look-back window in days (1–30).

    Returns:
        Aggregated document, clause, risk and readability KPIs.
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    try:
        # Pull completed documents created within the requested window.
        # We project only the fields we need to keep reads lean.
        docs_stream = (
            firestore_client.db
            .collection("documents")
            .where("status", "==", "completed")
            .stream()
        )

        total_documents = 0
        total_clauses = 0
        risk_distribution: Dict[str, int] = {"low": 0, "moderate": 0, "attention": 0}
        readability_deltas: List[float] = []
        pii_detected_total = 0
        masked_doc_count = 0
        processing_times: List[float] = []

        for doc_snap in docs_stream:
            data = doc_snap.to_dict() or {}

            # Apply date filter (Firestore SERVER_TIMESTAMP resolves to a python datetime)
            created_at = data.get("created_at")
            if created_at is not None:
                # Firestore returns timezone-aware datetimes
                if hasattr(created_at, "tzinfo") and created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                if created_at < start_date:
                    continue

            total_documents += 1
            total_clauses += data.get("clause_count", 0)

            # Risk distribution from document_risk_profile stored on the document
            risk_profile = data.get("document_risk_profile", {})
            dist = risk_profile.get("risk_distribution", {})
            risk_distribution["low"] += dist.get("low", 0)
            risk_distribution["moderate"] += dist.get("moderate", 0)
            risk_distribution["attention"] += dist.get("attention", 0)

            # Readability improvement
            stats = data.get("processing_statistics", {})
            ri = stats.get("avg_readability_improvement")
            if ri is not None:
                readability_deltas.append(float(ri))

            # PII metrics
            pii_detected_total += stats.get("pii_detected", 0)
            if data.get("masked", False):
                masked_doc_count += 1

        avg_readability = (
            sum(readability_deltas) / len(readability_deltas)
            if readability_deltas else 0.0
        )

        return {
            "time_range": {
                "start_date": start_date.isoformat(),
                "end_date": datetime.now(timezone.utc).isoformat(),
                "days": days,
            },
            "document_processing": {
                "total_documents": total_documents,
                "total_clauses": total_clauses,
            },
            "readability_improvement": {
                "avg_grade_reduction": round(avg_readability, 2),
                "documents_improved": len([d for d in readability_deltas if d > 0]),
            },
            "risk_analysis": {
                "risk_distribution": risk_distribution,
            },
            "privacy_metrics": {
                "pii_instances_detected": pii_detected_total,
                "documents_masked": masked_doc_count,
            },
        }

    except Exception as e:
        logger.error(f"Failed to build metrics summary: {e}", exc_info=True)
        return {
            "error": "Could not aggregate metrics at this time.",
            "time_range": {
                "start_date": start_date.isoformat(),
                "end_date": datetime.now(timezone.utc).isoformat(),
                "days": days,
            },
        }


@router.get("/processing-stats")
async def get_processing_stats(
    settings: Settings = Depends(get_settings),
) -> Dict[str, Any]:
    """
    Model and service configuration / performance indicators.

    Latency figures are representative estimates based on typical Gemini 2.5
    Flash throughput.  Fine-grained per-request tracking would require routing
    token-usage events to a time-series store such as BigQuery.

    Returns:
        Processing performance metrics.
    """
    return {
        "model_performance": {
            "gemini_model": settings.GEMINI_MODEL_NAME,
            "note": "Latency figures are representative estimates.",
            "avg_tokens_prompt": 2840,
            "avg_tokens_output": 1650,
            "avg_latency_ms": 2100,
        },
        "service_configuration": {
            "document_ai_location": settings.DOC_AI_LOCATION,
            "vertex_ai_location": settings.VERTEX_AI_LOCATION,
            "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
            "max_pages": settings.MAX_PAGES,
        },
    }


@router.get("/risk-patterns")
async def get_risk_patterns(
    category: str = Query(None, description="Filter by risk category"),
    settings: Settings = Depends(get_settings),
) -> Dict[str, Any]:
    """
    Illustrative risk pattern reference data.

    These patterns reflect common high-risk clause patterns in commercial
    contracts and are provided as reference data.  Aggregating live patterns
    from your own Firestore corpus is a planned enhancement.

    Args:
        category: Optional category filter (currently informational).

    Returns:
        Risk pattern reference with recommendations.
    """
    patterns = [
        {
            "pattern": "unlimited liability",
            "avg_risk_score": 0.89,
            "common_contexts": ["indemnification", "damages", "breach"],
        },
        {
            "pattern": "automatic renewal",
            "avg_risk_score": 0.74,
            "common_contexts": ["term", "notice", "cancellation"],
        },
        {
            "pattern": "exclusive jurisdiction",
            "avg_risk_score": 0.68,
            "common_contexts": ["disputes", "courts", "venue"],
        },
        {
            "pattern": "perpetual license grant",
            "avg_risk_score": 0.65,
            "common_contexts": ["ip", "license", "ownership"],
        },
    ]

    if category:
        patterns = [
            p for p in patterns
            if category.lower() in " ".join(p["common_contexts"])
        ]

    return {
        "category_filter": category,
        "data_source": "reference",
        "risk_patterns": patterns,
        "recommendations": [
            "Flag clauses containing 'unlimited' for elevated review priority.",
            "Auto-renewal clauses often omit clear notice requirements.",
            "Jurisdiction clauses may favour the drafter — verify governing law.",
        ],
    }