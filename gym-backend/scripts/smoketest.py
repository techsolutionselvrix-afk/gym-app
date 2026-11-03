"""Smoke test: verify .env parses and Supabase accepts the service_role key."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.supabase_client import get_service_client


def main() -> int:
    s = get_settings()
    print(f"[ok] env loaded: url={s.supabase_url} env={s.app_env}")
    sb = get_service_client()
    try:
        res = sb.table("profiles").select("id").limit(1).execute()
        print(f"[ok] profiles table reachable, rows={len(res.data or [])}")
    except Exception as exc:
        msg = str(exc)
        if "relation" in msg and "does not exist" in msg:
            print("[warn] connected to Supabase but 'profiles' table missing — run migrations.")
            return 2
        print(f"[fail] Supabase call errored: {msg}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
