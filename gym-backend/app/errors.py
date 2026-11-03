import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings

log = logging.getLogger(__name__)


def register_error_handlers(app: FastAPI) -> None:
    settings = get_settings()

    @app.exception_handler(StarletteHTTPException)
    async def http_exc(_: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.status_code, "message": exc.detail}},
            headers=exc.headers or None,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exc(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"error": {"code": 422, "message": "Validation failed", "fields": exc.errors()}},
        )

    @app.exception_handler(Exception)
    async def unhandled_exc(_: Request, exc: Exception):
        log.exception("Unhandled error: %s", exc)
        # In prod, never leak stack traces or exception strings to clients.
        detail = "Internal server error" if settings.is_prod else repr(exc)
        return JSONResponse(status_code=500, content={"error": {"code": 500, "message": detail}})
