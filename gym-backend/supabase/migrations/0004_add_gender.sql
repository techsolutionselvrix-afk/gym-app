-- Add gender to profiles and capture it on signup.
-- Idempotent: safe to run multiple times.

do $$ begin
  create type gender_kind as enum ('male', 'female', 'other', 'prefer_not_to_say');
exception when duplicate_object then null; end $$;

alter table profiles
  add column if not exists gender gender_kind;

-- Replace trigger so new signups also capture gender from user metadata.
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, gender, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null),
    case
      when new.raw_user_meta_data->>'gender' in ('male','female','other','prefer_not_to_say')
        then (new.raw_user_meta_data->>'gender')::gender_kind
      else null
    end,
    'member'
  )
  on conflict (id) do nothing;
  return new;
end $$ language plpgsql security definer;
