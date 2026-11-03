from functools import lru_cache
from supabase import create_client, Client

from app.config import get_settings


@lru_cache
def get_service_client() -> Client:
    """
    Supabase client authenticated with the SERVICE ROLE key.
    This bypasses RLS — only use it in trusted server code paths.
    """
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)


def get_user_client(access_token: str) -> Client:
    """
    Supabase client that acts AS the end user, so RLS policies apply.
    Use this when echoing user actions back to Supabase.
    """
    s = get_settings()
    client = create_client(s.supabase_url, s.supabase_anon_key)
    client.postgrest.auth(access_token)
    return client
