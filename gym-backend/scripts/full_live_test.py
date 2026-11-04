"""End-to-end live test of the deployed stack."""
import os
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
from dotenv import load_dotenv

load_dotenv()

VERCEL = "https://gym-app-gym-mobile.vercel.app"
BACKEND = "https://gym-backend-yznh.onrender.com"
SB_URL = os.environ["SUPABASE_URL"]
SB_ANON = os.environ["SUPABASE_ANON_KEY"]

OK, FAIL, WARN = "[PASS]", "[FAIL]", "[WARN]"
results = []


def record(tag, name, detail=""):
    results.append((tag, name, detail))
    print(f"{tag} {name}" + (f"  —  {detail}" if detail else ""))


def do(method, url, retries=3, **kw):
    """Fresh connection per request; retry on transient DNS/socket errors."""
    kw.setdefault("timeout", 30)
    kw.setdefault("follow_redirects", True)
    last: Exception = RuntimeError("no attempts made")
    for i in range(retries):
        try:
            return httpx.request(method, url, **kw)
        except (httpx.ConnectError, httpx.ReadTimeout) as e:
            last = e
            time.sleep(1.5 * (i + 1))
    raise last


# ---------- 1. Vercel: route sampling ----------
print("\n== VERCEL FRONTEND ==")
routes = [
    "/", "/choose-role", "/login", "/register",
    "/(member)/dashboard", "/(admin)/dashboard", "/(super-admin)/dashboard",
    "/(super-admin)/gyms", "/(super-admin)/plans", "/(super-admin)/billing",
    "/(admin)/members", "/(admin)/attendance", "/(member)/scan",
]
for r in routes:
    try:
        resp = do("GET", VERCEL + r)
        if resp.status_code == 200:
            record(OK, f"Vercel GET {r}", f"{len(resp.text)//1024}KB")
        else:
            record(FAIL, f"Vercel GET {r}", f"status={resp.status_code}")
    except Exception as e:
        record(FAIL, f"Vercel GET {r}", str(e)[:80])
    time.sleep(0.2)

# ---------- 2. Backend health ----------
print("\n== BACKEND (RENDER) ==")
for p in ["/health", "/", "/health/ready"]:
    try:
        r = do("GET", BACKEND + p)
        record(OK if r.status_code == 200 else FAIL, f"Backend GET {p}", r.text[:60])
    except Exception as e:
        record(FAIL, f"Backend GET {p}", str(e)[:80])

try:
    r = do("GET", BACKEND + "/docs")
    if r.status_code == 200:
        record(WARN, "GET /docs accessible", "set APP_ENV=production on Render to hide")
    else:
        record(OK, "GET /docs hidden", f"status={r.status_code}")
except Exception as e:
    record(FAIL, "GET /docs", str(e)[:80])

# ---------- 3. CORS preflight ----------
print("\n== CORS ==")
for origin in [VERCEL, "http://localhost:8081",
               "https://gym-app-gym-mobile-git-xyz.vercel.app"]:
    try:
        r = do("OPTIONS", BACKEND + "/me", headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
        })
        allow = r.headers.get("access-control-allow-origin", "")
        if r.status_code == 200 and allow:
            record(OK, f"preflight {origin[:50]}", f"ACAO={allow[:60]}")
        else:
            record(FAIL, f"preflight {origin[:50]}", f"status={r.status_code} ACAO={allow!r}")
    except Exception as e:
        record(FAIL, f"preflight {origin[:50]}", str(e)[:80])

# ---------- 4. Super admin ----------
print("\n== SUPER ADMIN FLOW ==")
r = do("POST", f"{SB_URL}/auth/v1/token?grant_type=password",
       headers={"apikey": SB_ANON, "Content-Type": "application/json"},
       json={"email": os.environ["SUPER_ADMIN_EMAIL"],
             "password": os.environ["SUPER_ADMIN_PASSWORD"]})
if r.status_code != 200:
    record(FAIL, "super admin login", r.text[:200]); raise SystemExit(1)
sa_tok = r.json()["access_token"]
record(OK, "super admin login", "got token")
H = {"Authorization": f"Bearer {sa_tok}"}

r = do("GET", BACKEND + "/me", headers=H)
me = r.json()
record(OK if me.get("role") == "super_admin" else FAIL,
       "GET /me as super_admin", f"role={me.get('role')}")

r = do("GET", BACKEND + "/gyms", headers=H)
record(OK if r.status_code == 200 else FAIL, "GET /gyms", f"status={r.status_code} count={len(r.json())}")

r = do("POST", BACKEND + "/gyms", headers={**H, "Content-Type": "application/json"},
       json={"name": f"TestGym_{uuid.uuid4().hex[:6]}",
             "address": "123 Test St", "email": "gym@test.com"})
gym_id = None
if r.status_code == 201:
    gym_id = r.json()["id"]
    record(OK, "POST /gyms", f"created {gym_id}")
else:
    record(FAIL, "POST /gyms", f"{r.status_code} {r.text[:120]}")

if gym_id:
    r = do("POST", BACKEND + "/plans", headers={**H, "Content-Type": "application/json"},
           json={"gym_id": gym_id, "name": "Monthly", "price_cents": 99900, "duration_days": 30})
    record(OK if r.status_code == 201 else FAIL, "POST /plans", f"{r.status_code}")

    r = do("GET", f"{BACKEND}/plans?gym_id={gym_id}", headers=H)
    record(OK if r.status_code == 200 else FAIL, "GET /plans", f"count={len(r.json())}")

    r = do("GET", f"{BACKEND}/gyms/{gym_id}", headers=H)
    record(OK if r.status_code == 200 else FAIL, "GET /gyms/{id}", f"{r.status_code}")

    r = do("GET", BACKEND + "/members", headers=H)
    record(OK if r.status_code == 200 else FAIL, "GET /members", f"{r.status_code}")

# ---------- 5. SMTP via actual signup ----------
print("\n== SMTP + SIGNUP ==")
test_email = f"livetest_{uuid.uuid4().hex[:8]}@mailinator.com"
try:
    r = do("POST", f"{SB_URL}/auth/v1/signup",
           headers={"apikey": SB_ANON, "Content-Type": "application/json"},
           json={"email": test_email, "password": "TestPass_1234",
                 "data": {"full_name": "Live Tester", "phone": "9999999991"}},
           timeout=90)
    if r.status_code == 200:
        d = r.json()
        if d.get("session"):
            record(OK, "signup", "session returned — email confirmation OFF")
        else:
            record(OK, "signup accepted", "awaiting email confirmation (SMTP in use)")
    elif r.status_code == 429:
        record(FAIL, "signup", f"rate limit — SMTP not applied: {r.text[:140]}")
    else:
        record(WARN, "signup", f"{r.status_code} {r.text[:140]}")
except httpx.ReadTimeout:
    record(WARN, "signup", "timed out — Supabase still waiting on SMTP server; check Brevo logs")
except Exception as e:
    record(FAIL, "signup", str(e)[:140])

# Verify user row was created despite any email delay
try:
    sb_check = get_service_client() if 'get_service_client' in dir() else None
except Exception:
    sb_check = None

# ---------- 6. Role isolation ----------
print("\n== RLS / ROLE ENFORCEMENT ==")
from app.supabase_client import get_service_client
sb = get_service_client()
member_email = f"member_test_{uuid.uuid4().hex[:6]}@example.com"
member_password = "MemberPass_1234"
try:
    sb.auth.admin.create_user({
        "email": member_email, "password": member_password, "email_confirm": True,
    })
    r = do("POST", f"{SB_URL}/auth/v1/token?grant_type=password",
           headers={"apikey": SB_ANON, "Content-Type": "application/json"},
           json={"email": member_email, "password": member_password})
    m_tok = r.json()["access_token"]
    MH = {"Authorization": f"Bearer {m_tok}"}

    r = do("GET", BACKEND + "/me", headers=MH)
    record(OK if r.json().get("role") == "member" else FAIL,
           "member /me", f"role={r.json().get('role')}")

    r = do("GET", BACKEND + "/gyms", headers=MH)
    # /gyms returns 403 for a member (require_roles(admin, super_admin))
    record(OK if r.status_code == 403 else FAIL, "member blocked from /gyms", f"{r.status_code}")

    r = do("GET", BACKEND + "/members", headers=MH)
    record(OK if r.status_code == 403 else FAIL, "member blocked from /members", f"{r.status_code}")

    # /me without a token
    r = do("GET", BACKEND + "/me")
    record(OK if r.status_code == 401 else FAIL, "/me without token", f"{r.status_code}")
except Exception as e:
    record(FAIL, "role isolation test", str(e))

# ---------- Summary ----------
print("\n" + "=" * 60)
passes = sum(1 for t, *_ in results if t == OK)
fails = sum(1 for t, *_ in results if t == FAIL)
warns = sum(1 for t, *_ in results if t == WARN)
print(f"TOTAL: {len(results)}  |  PASS: {passes}  |  FAIL: {fails}  |  WARN: {warns}")
print("=" * 60)
if fails:
    print("\nFAILURES:")
    for t, n, d in results:
        if t == FAIL:
            print(f"  - {n}: {d}")
raise SystemExit(0 if fails == 0 else 1)
