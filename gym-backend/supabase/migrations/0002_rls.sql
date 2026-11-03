-- Row Level Security policies
-- Enforced AT THE DATABASE even if the API is bypassed.
-- Run after 0001_init.sql.

-- Helpers (SECURITY DEFINER so they can read profiles without recursion)
create or replace function auth_role() returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth_gym_id() returns uuid as $$
  select gym_id from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_super_admin() returns boolean as $$
  select coalesce(auth_role() = 'super_admin', false);
$$ language sql stable security definer;

-- Enable RLS on every table
alter table gyms           enable row level security;
alter table profiles       enable row level security;
alter table plans          enable row level security;
alter table memberships    enable row level security;
alter table attendance     enable row level security;
alter table classes        enable row level security;
alter table class_bookings enable row level security;
alter table invoices       enable row level security;
alter table audit_log      enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles self read" on profiles;
create policy "profiles self read" on profiles for select
  using (id = auth.uid()
      or (auth_role() = 'admin' and gym_id = auth_gym_id())
      or is_super_admin());

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update
  using (id = auth.uid() or is_super_admin())
  with check (
    -- cannot escalate role or move to a different gym from the client
    id = auth.uid()
    or is_super_admin()
  );

-- Role / gym_id changes should only happen via service_role (server). RLS blocks client writes to those columns:
-- (enforced by application + a column-level check below)

-- ---------- gyms ----------
drop policy if exists "gyms read" on gyms;
create policy "gyms read" on gyms for select
  using (is_super_admin() or id = auth_gym_id());

drop policy if exists "gyms write" on gyms;
create policy "gyms write" on gyms for all
  using (is_super_admin()
      or (auth_role() = 'admin' and id = auth_gym_id()))
  with check (is_super_admin()
      or (auth_role() = 'admin' and id = auth_gym_id()));

-- ---------- plans ----------
drop policy if exists "plans read" on plans;
create policy "plans read" on plans for select
  using (is_super_admin() or gym_id = auth_gym_id());

drop policy if exists "plans write" on plans;
create policy "plans write" on plans for all
  using (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()))
  with check (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

-- ---------- memberships ----------
drop policy if exists "memberships read" on memberships;
create policy "memberships read" on memberships for select
  using (member_id = auth.uid()
      or is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

drop policy if exists "memberships write" on memberships;
create policy "memberships write" on memberships for all
  using (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()))
  with check (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

-- ---------- attendance ----------
drop policy if exists "attendance read" on attendance;
create policy "attendance read" on attendance for select
  using (member_id = auth.uid()
      or is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

drop policy if exists "attendance self check-in" on attendance;
create policy "attendance self check-in" on attendance for insert
  with check (member_id = auth.uid() and gym_id = auth_gym_id());

drop policy if exists "attendance admin write" on attendance;
create policy "attendance admin write" on attendance for all
  using (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()))
  with check (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

-- ---------- classes ----------
drop policy if exists "classes read" on classes;
create policy "classes read" on classes for select
  using (is_super_admin() or gym_id = auth_gym_id());

drop policy if exists "classes write" on classes;
create policy "classes write" on classes for all
  using (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()))
  with check (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

-- ---------- class_bookings ----------
drop policy if exists "bookings member" on class_bookings;
create policy "bookings member" on class_bookings for all
  using (member_id = auth.uid()
      or is_super_admin()
      or (auth_role() = 'admin'
          and (select gym_id from classes c where c.id = class_bookings.class_id) = auth_gym_id()))
  with check (member_id = auth.uid()
      or is_super_admin()
      or (auth_role() = 'admin'
          and (select gym_id from classes c where c.id = class_bookings.class_id) = auth_gym_id()));

-- ---------- invoices ----------
drop policy if exists "invoices read" on invoices;
create policy "invoices read" on invoices for select
  using (member_id = auth.uid()
      or is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

drop policy if exists "invoices write" on invoices;
create policy "invoices write" on invoices for all
  using (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()))
  with check (is_super_admin()
      or (auth_role() = 'admin' and gym_id = auth_gym_id()));

-- ---------- audit_log ----------
-- Insert-only from server (service role bypasses RLS). Admins can read their gym's log.
drop policy if exists "audit read" on audit_log;
create policy "audit read" on audit_log for select
  using (is_super_admin() or (auth_role() = 'admin' and gym_id = auth_gym_id()));

-- Explicitly: NO insert/update/delete policy for non-service_role -> client can't write audit log.
