-- Reinstall the handle_new_user trigger, hardened against partial failures.
-- Previous version could hard-fail the entire auth signup transaction if ANY
-- part of the profile insert raised (e.g. a stale column reference, an enum
-- mismatch, or RLS misconfig). We now:
--   1. Explicitly cast enums
--   2. Wrap in exception handler so auth signup still succeeds even if the
--      profile insert fails (the user can still log in; profile will be
--      lazily created by backend /me on first authenticated request if needed)
--   3. Log problems to postgres log for later inspection

create or replace function handle_new_user() returns trigger as $$
declare
  v_gender gender_kind;
begin
  -- Pick gender if provided and valid; otherwise null.
  if new.raw_user_meta_data->>'gender' in ('male','female','other','prefer_not_to_say') then
    v_gender := (new.raw_user_meta_data->>'gender')::gender_kind;
  else
    v_gender := null;
  end if;

  begin
    insert into public.profiles (id, email, full_name, phone, gender, role)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      coalesce(new.raw_user_meta_data->>'phone', null),
      v_gender,
      'member'::user_role
    )
    on conflict (id) do nothing;
  exception when others then
    -- Never fail the auth signup because of a profile issue.
    raise warning 'handle_new_user profile insert failed for %: %', new.id, sqlerrm;
  end;

  return new;
end $$ language plpgsql security definer;

-- Make sure the trigger is wired (idempotent).
do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();
exception when duplicate_object then null; end $$;
