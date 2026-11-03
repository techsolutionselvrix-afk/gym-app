"""
Create / reset the single super admin.

Idempotent: safe to run multiple times. Updates the password and ensures the
profile row is marked super_admin with no gym_id.

Usage:
  python scripts/bootstrap_super_admin.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.supabase_client import get_service_client

import os
from dotenv import load_dotenv

load_dotenv()

SUPER_ADMIN_EMAIL = os.environ.get("SUPER_ADMIN_EMAIL")
SUPER_ADMIN_PASSWORD = os.environ.get("SUPER_ADMIN_PASSWORD")
SUPER_ADMIN_NAME = os.environ.get("SUPER_ADMIN_NAME", "Platform Super Admin")

if not SUPER_ADMIN_EMAIL or not SUPER_ADMIN_PASSWORD:
    raise SystemExit(
        "Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your .env "
        "before running this script."
    )


def find_user_by_email(sb, email: str):
    page = 1
    while True:
        res = sb.auth.admin.list_users(page=page, per_page=100)
        users = res if isinstance(res, list) else getattr(res, "users", [])
        if not users:
            return None
        for u in users:
            u_email = getattr(u, "email", None) or (u.get("email") if isinstance(u, dict) else None)
            if u_email and u_email.lower() == email.lower():
                return u
        if len(users) < 100:
            return None
        page += 1


def main() -> int:
    sb = get_service_client()
    print(f"[.] looking for existing user {SUPER_ADMIN_EMAIL} ...")
    user = find_user_by_email(sb, SUPER_ADMIN_EMAIL)

    if user is None:
        print("[.] not found — creating via admin API")
        created = sb.auth.admin.create_user({
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"full_name": SUPER_ADMIN_NAME},
        })
        user_obj = getattr(created, "user", None) or created
        user_id = getattr(user_obj, "id", None) or user_obj["id"]
        print(f"[ok] created auth user id={user_id}")
    else:
        user_id = getattr(user, "id", None) or user["id"]
        print(f"[.] found existing user id={user_id} — resetting password")
        sb.auth.admin.update_user_by_id(user_id, {
            "password": SUPER_ADMIN_PASSWORD,
            "email_confirm": True,
        })
        print("[ok] password reset + email confirmed")

    # Upsert the profile row and lock it to super_admin with no gym binding.
    print("[.] upserting profile row as super_admin")
    sb.table("profiles").upsert({
        "id": user_id,
        "email": SUPER_ADMIN_EMAIL,
        "full_name": SUPER_ADMIN_NAME,
        "role": "super_admin",
        "gym_id": None,
    }, on_conflict="id").execute()

    # Double-check
    row = sb.table("profiles").select("id, email, role, gym_id").eq("id", user_id).single().execute().data
    print(f"[ok] profile: {row}")

    # Make sure no other super_admin exists.
    others = (
        sb.table("profiles")
        .select("id, email")
        .eq("role", "super_admin")
        .neq("id", user_id)
        .execute()
        .data
        or []
    )
    if others:
        print(f"[warn] demoting {len(others)} other super_admin account(s): {[o['email'] for o in others]}")
        for o in others:
            sb.table("profiles").update({"role": "member"}).eq("id", o["id"]).execute()

    print("\nSuper admin ready:")
    print(f"  email:    {SUPER_ADMIN_EMAIL}")
    print(f"  password: {SUPER_ADMIN_PASSWORD}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
