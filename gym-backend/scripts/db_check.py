"""Full DB connectivity + schema sanity check."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.supabase_client import get_service_client

TABLES = [
    "gyms", "profiles", "plans", "memberships",
    "attendance", "classes", "class_bookings", "invoices", "audit_log",
]


def main() -> int:
    s = get_settings()
    print("=" * 60)
    print("SUPABASE CONNECTION REPORT")
    print("=" * 60)
    print(f"URL      : {s.supabase_url}")
    print(f"Env      : {s.app_env}")
    print()

    sb = get_service_client()

    print("TABLES")
    print("-" * 60)
    ok = 0
    for t in TABLES:
        try:
            # head=True + count=exact returns the row count without pulling data
            res = sb.table(t).select("*", count="exact", head=True).execute()
            count = res.count if res.count is not None else 0
            print(f"  [ok]  {t:<16} rows: {count}")
            ok += 1
        except Exception as exc:
            print(f"  [FAIL] {t:<16} {exc}")
    print()

    print("SUPER ADMIN")
    print("-" * 60)
    supers = (
        sb.table("profiles")
        .select("id, email, role, gym_id, created_at")
        .eq("role", "super_admin")
        .execute()
        .data
        or []
    )
    if not supers:
        print("  [FAIL] no super_admin profile found — run bootstrap_super_admin.py")
    else:
        for row in supers:
            print(f"  [ok] {row['email']}  id={row['id']}  gym_id={row['gym_id']}")
    print()

    print("AUTH USERS")
    print("-" * 60)
    try:
        res = sb.auth.admin.list_users(page=1, per_page=20)
        users = res if isinstance(res, list) else getattr(res, "users", [])
        print(f"  total (first page): {len(users)}")
        for u in users[:10]:
            email = getattr(u, "email", None)
            confirmed = getattr(u, "email_confirmed_at", None) or getattr(u, "confirmed_at", None)
            print(f"  - {email}  confirmed: {'yes' if confirmed else 'no'}")
    except Exception as exc:
        print(f"  [FAIL] {exc}")
    print()

    print("=" * 60)
    print(f"Tables OK: {ok}/{len(TABLES)}")
    print("=" * 60)
    return 0 if ok == len(TABLES) and supers else 1


if __name__ == "__main__":
    raise SystemExit(main())
