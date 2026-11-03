from fastapi import APIRouter
from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    s = get_settings()
    return {"status": "ok", "env": s.app_env, "app": s.app_name}


@router.get("/health/ready")
def ready():
    # Readiness could ping Supabase here; keeping lightweight to avoid rate-limit on free tier.
    return {"status": "ready"}
