-- Update profile auto-creation to capture phone from signup metadata.
-- Role is intentionally forced to 'member' here — admin/super_admin assignment is manual.

create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null),
    'member'
  )
  on conflict (id) do nothing;
  return new;
end $$ language plpgsql security definer;
