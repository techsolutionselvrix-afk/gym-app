-- Gym backend schema
-- Run in Supabase SQL editor (project -> SQL -> New query).

create extension if not exists "uuid-ossp";

-- ---------- enums ----------
do $$ begin
  create type user_role as enum ('member', 'admin', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gym_status as enum ('active', 'suspended', 'trial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_status as enum ('active', 'expired', 'paused', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type checkin_method as enum ('qr', 'manual', 'biometric');
exception when duplicate_object then null; end $$;

-- ---------- tables ----------
create table if not exists gyms (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text,
  phone       text,
  email       text,
  logo_url    text,
  status      gym_status not null default 'trial',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'member',
  gym_id      uuid references gyms(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_profiles_gym on profiles(gym_id);
create index if not exists idx_profiles_role on profiles(role);

create table if not exists plans (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  name          text not null,
  price_cents   integer not null check (price_cents >= 0),
  currency      char(3) not null default 'INR',
  duration_days integer not null check (duration_days > 0),
  features      jsonb,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_plans_gym on plans(gym_id);

create table if not exists memberships (
  id          uuid primary key default uuid_generate_v4(),
  member_id   uuid not null references profiles(id) on delete cascade,
  plan_id     uuid not null references plans(id),
  gym_id      uuid not null references gyms(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  status      membership_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_memberships_member on memberships(member_id);
create index if not exists idx_memberships_gym on memberships(gym_id);

create table if not exists attendance (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references profiles(id) on delete cascade,
  gym_id          uuid not null references gyms(id) on delete cascade,
  checked_in_at   timestamptz not null default now(),
  checked_out_at  timestamptz,
  method          checkin_method not null default 'qr',
  created_at      timestamptz not null default now()
);
create index if not exists idx_attendance_member on attendance(member_id);
create index if not exists idx_attendance_gym_time on attendance(gym_id, checked_in_at desc);

create table if not exists classes (
  id          uuid primary key default uuid_generate_v4(),
  gym_id      uuid not null references gyms(id) on delete cascade,
  name        text not null,
  trainer_id  uuid references profiles(id) on delete set null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  capacity    integer not null default 20 check (capacity > 0),
  created_at  timestamptz not null default now()
);
create index if not exists idx_classes_gym_time on classes(gym_id, start_time desc);

create table if not exists class_bookings (
  id         uuid primary key default uuid_generate_v4(),
  class_id   uuid not null references classes(id) on delete cascade,
  member_id  uuid not null references profiles(id) on delete cascade,
  status     text not null default 'booked',
  created_at timestamptz not null default now(),
  unique (class_id, member_id)
);

create table if not exists invoices (
  id                  uuid primary key default uuid_generate_v4(),
  gym_id              uuid not null references gyms(id) on delete cascade,
  member_id           uuid not null references profiles(id) on delete cascade,
  membership_id       uuid references memberships(id) on delete set null,
  amount_cents        integer not null check (amount_cents >= 0),
  currency            char(3) not null default 'INR',
  status              invoice_status not null default 'pending',
  external_payment_id text,
  due_date            date,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);
create index if not exists idx_invoices_gym on invoices(gym_id);
create index if not exists idx_invoices_member on invoices(member_id);

create table if not exists audit_log (
  id          bigserial primary key,
  actor_id    uuid references profiles(id) on delete set null,
  gym_id      uuid references gyms(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  data        jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_gym_time on audit_log(gym_id, created_at desc);

-- ---------- updated_at triggers ----------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

do $$ begin
  create trigger tg_profiles_updated   before update on profiles   for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger tg_gyms_updated       before update on gyms       for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger tg_plans_updated      before update on plans      for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger tg_memberships_updated before update on memberships for each row execute function set_updated_at();
exception when duplicate_object then null; end $$;

-- ---------- auto-create profile on signup ----------
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$ language plpgsql security definer;

do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();
exception when duplicate_object then null; end $$;
