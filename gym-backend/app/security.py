"""
Supabase JWT verification.

Supabase signs access tokens with ES256 using a project-specific EC key pair
and publishes the public key at {SUPABASE_URL}/auth/v1/.well-known/jwks.json.
We fetch and cache the JWKS, pick the key by `kid`, and verify.

Legacy projects used HS256 with the shared JWT secret; we fall back to that
when the token header says HS256, so this works for both setups.
"""
import time
from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, status
from jose import jwt, JWTError

from app.config import get_settings


_JWKS_CACHE: Dict[str, Any] = {"keys": None, "fetched_at": 0.0}
_JWKS_TTL_SECONDS = 60 * 60  # 1 hour


def _fetch_jwks() -> list[dict]:
    now = time.time()
    if _JWKS_CACHE["keys"] and (now - _JWKS_CACHE["fetched_at"]) < _JWKS_TTL_SECONDS:
        return _JWKS_CACHE["keys"]
    url = f"{get_settings().supabase_url}/auth/v1/.well-known/jwks.json"
    r = httpx.get(url, timeout=5.0)
    r.raise_for_status()
    keys = r.json().get("keys") or []
    _JWKS_CACHE["keys"] = keys
    _JWKS_CACHE["fetched_at"] = now
    return keys


def _find_jwk(kid: str) -> Optional[dict]:
    for k in _fetch_jwks():
        if k.get("kid") == kid:
            return k
    # Not found — cache may be stale (key rotation). Force refresh once.
    _JWKS_CACHE["fetched_at"] = 0.0
    for k in _fetch_jwks():
        if k.get("kid") == kid:
            return k
    return None


def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    settings = get_settings()
    try:
        unverified = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(401, "Malformed token", headers={"WWW-Authenticate": "Bearer"}) from exc

    alg = unverified.get("alg", "")
    kid = unverified.get("kid")

    try:
        if alg == "HS256":
            # Legacy symmetric key
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                options={"require": ["exp", "sub"]},
            )
        elif alg in ("ES256", "RS256"):
            if not kid:
                raise HTTPException(401, "Token missing kid", headers={"WWW-Authenticate": "Bearer"})
            jwk = _find_jwk(kid)
            if not jwk:
                raise HTTPException(401, "Signing key not found in JWKS",
                                    headers={"WWW-Authenticate": "Bearer"})
            payload = jwt.decode(
                token,
                jwk,
                algorithms=[alg],
                audience="authenticated",
                options={"require": ["exp", "sub"]},
            )
        else:
            raise HTTPException(401, f"Unsupported JWT alg: {alg}",
                                headers={"WWW-Authenticate": "Bearer"})
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if not payload.get("sub"):
        raise HTTPException(401, "Token missing sub")
    return payload
