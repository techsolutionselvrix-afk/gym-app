import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import get_settings
from app.errors import register_error_handlers
from app.logging_setup import configure_logging
from app.routers import attendance, gyms, health, me, members, plans

log = logging.getLogger(__name__)


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()

    app = FastAPI(
        title="Gym Backend",
        version="0.1.0",
        docs_url=None if settings.is_prod else "/docs",
        redoc_url=None if settings.is_prod else "/redoc",
        openapi_url=None if settings.is_prod else "/openapi.json",
    )

    # ---- Rate limiting ----
    limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit_default])
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ---- CORS ----
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list or ["*"],
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---- Trusted hosts (prod only) ----
    if settings.is_prod:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])  # tighten per deploy

    # ---- Security headers ----
    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        if settings.is_prod:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    register_error_handlers(app)

    # ---- Routes ----
    app.include_router(health.router)
    app.include_router(me.router)
    app.include_router(gyms.router)
    app.include_router(members.router)
    app.include_router(plans.router)
    app.include_router(attendance.router)

    @app.get("/")
    def root():
        return {"name": settings.app_name, "env": settings.app_env, "docs": "/docs"}

    log.info("App ready: env=%s cors=%s", settings.app_env, settings.cors_origin_list)
    return app


app = create_app()
