# Gym Backend — FastAPI + Supabase

Backend for the Gym mobile app. Supabase handles auth, Postgres, storage. FastAPI handles business logic, role-based authorization, cross-tenant guards, and server-side validation. Row-Level Security on every table enforces tenancy at the DB layer even if the API is bypassed.

## Stack & cost

| Layer | Choice | Free tier |
|---|---|---|
| Database + Auth + Storage | Supabase | 500 MB DB, 50k MAU, 1 GB storage |
| API | FastAPI on Fly.io / Render / Railway | ~free hobby plans |
| Secrets | Platform env vars | — |

## Quickstart (local)

```bash
cd gym-backend
python -m venv .venv
.venv\Scripts\activate                # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env                 # fill in Supabase keys
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs — Swagger UI.

## Supabase setup (one-time)

1. Create a free Supabase project at https://supabase.com.
2. **Project Settings → API** — copy `URL`, `anon`, `service_role`, `JWT secret` into `.env`.
3. **SQL editor** → run `supabase/migrations/0001_init.sql`, then `0002_rls.sql`.
4. **Authentication → Providers** — enable Email, add SMTP later (free tier allows a few mails/hour).
5. Create your first user via the app's register screen or Supabase dashboard, then in SQL set them as super admin:
   ```sql
   update profiles set role = 'super_admin' where email = 'you@example.com';
   ```

## Security posture

- **Auth**: Supabase issues JWTs; backend verifies signature + expiry (HS256 with project JWT secret).
- **RBAC**: Role is **read from `profiles.role` on every request**, not the JWT. Changes/revocations are instant.
- **Multi-tenancy**: Every tenant row has `gym_id`; API-layer guard + DB-layer RLS both enforce.
- **Service role key** is server-only. Never ship it to the mobile client.
- **Rate limiting**: slowapi, default 100/min per IP.
- **Headers**: HSTS (prod), X-Frame-Options, Permissions-Policy, no-sniff, referrer-policy.
- **Error responses**: no stack traces leak in prod.
- **Audit log** is service-role-only writable; admins can read their own gym's log.
- **Input validation**: Pydantic v2 with length / range caps on every field.
- **Mobile side TODO**: pin certificates or rely on platform HTTPS trust; store Supabase session in SecureStore, not AsyncStorage.

## Project layout

```
gym-backend/
├── app/
│   ├── main.py            FastAPI app + middleware + routes
│   ├── config.py          env settings (pydantic-settings)
│   ├── security.py        JWT verification
│   ├── deps.py            auth dependency, require_roles(), require_same_gym()
│   ├── supabase_client.py service-role + per-user clients
│   ├── errors.py          error handlers (no stack leaks)
│   ├── logging_setup.py
│   ├── routers/           health, me, gyms, members, plans, attendance
│   └── schemas/           pydantic request/response models
├── supabase/migrations/   0001_init.sql, 0002_rls.sql
├── docker/Dockerfile
├── requirements.txt
└── .env.example
```

## Deployment (free)

**Fly.io** (recommended; always-on free tier for small apps):
```bash
fly launch --dockerfile docker/Dockerfile
fly secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_JWT_SECRET=... APP_ENV=production
fly deploy
```

**Render**: new Web Service → Docker → point to `docker/Dockerfile` → add env vars.

Point the mobile app at the deployed URL via an `EXPO_PUBLIC_API_BASE_URL` env.

## Wiring the mobile app

In `gym-mobile/.env` (or `app.config.ts`):
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000      # or deployed URL
```

Flow: mobile app signs in with Supabase → gets access_token → sends `Authorization: Bearer <token>` on every call to this backend.

## Next steps

- [ ] `classes.py` router + bookings
- [ ] `invoices.py` router + payment webhook (Razorpay/Stripe)
- [ ] Pagination helpers
- [ ] Pytest + httpx test suite
- [ ] GitHub Actions CI (lint + test)
- [ ] Sentry (free tier) for error tracking in prod
