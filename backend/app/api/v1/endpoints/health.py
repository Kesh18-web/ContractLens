"""
Health check endpoints
"""
import logging
from typing import Dict, Any

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.services.firestore_client import FirestoreClient
from app.dependencies.services import get_firestore_client

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=Dict[str, Any])
async def health_check(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """
    Liveness probe — confirms the process is running and the config is loaded.

    Returns:
        Service name, version, and environment.
    """
    return {
        "status": "healthy",
        "service": "contractlens-api",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
    }


@router.get("/ready", response_model=Dict[str, Any])
async def readiness_check(
    settings: Settings = Depends(get_settings),
    firestore_client: FirestoreClient = Depends(get_firestore_client),
) -> Dict[str, Any]:
    """
    Readiness probe for Cloud Run / Kubernetes.

    Performs a live Firestore connectivity check and validates that required
    GCP service configuration is present.  Document AI and Vertex AI are not
    pinged on every readiness check to avoid unnecessary cost — their config
    is validated instead.

    Returns:
        Overall readiness status and per-service check results.
    """
    checks: Dict[str, str] = {}
    overall_ready = True

    # --- Firestore (live connectivity check) ---
    try:
        firestore_ok = await firestore_client.health_check()
        checks["firestore"] = "ok" if firestore_ok else "degraded"
        if not firestore_ok:
            overall_ready = False
    except Exception as exc:
        checks["firestore"] = f"error: {str(exc)[:80]}"
        overall_ready = False
        logger.warning(f"Firestore health check failed: {exc}")

    # --- Document AI (configuration check) ---
    try:
        if settings.DOC_AI_PROCESSOR_ID and (settings.PROJECT_NUMBER or settings.PROJECT_ID):
            checks["document_ai"] = "configured"
        else:
            checks["document_ai"] = "misconfigured — DOC_AI_PROCESSOR_ID or PROJECT_ID missing"
            overall_ready = False
    except Exception as exc:
        checks["document_ai"] = f"error: {str(exc)[:80]}"
        overall_ready = False

    # --- Vertex AI / Gemini (configuration check) ---
    try:
        if settings.PROJECT_ID and settings.VERTEX_AI_LOCATION and settings.GEMINI_MODEL_NAME:
            checks["vertex_ai"] = "configured"
        else:
            checks["vertex_ai"] = "misconfigured — PROJECT_ID, VERTEX_AI_LOCATION, or GEMINI_MODEL_NAME missing"
            overall_ready = False
    except Exception as exc:
        checks["vertex_ai"] = f"error: {str(exc)[:80]}"
        overall_ready = False

    return {
        "status": "ready" if overall_ready else "degraded",
        "service": "contractlens-api",
        "checks": checks,
    }
