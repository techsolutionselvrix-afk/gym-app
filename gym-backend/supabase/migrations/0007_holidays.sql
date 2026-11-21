-- Gym holidays (closures, maintenance days). Owner posts, members see.
create table if not exists gym_holidays (
  id          uuid primary key default uuid_generate_v4(),
  gym_id      uuid not null references gyms(id) on delete cascade,
  date        date not null,
  title       text not null,
  description text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_gym_holidays_gym_date on gym_holidays(gym_id, date);
create unique index if not exists uniq_gym_holiday_per_day on gym_holidays(gym_id, date);

alter table gym_holidays enable row level security;

drop policy if exists "read own gym holidays" on gym_holidays;
create policy "read own gym holidays" on gym_holidays
for select to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and (p.gym_id = gym_holidays.gym_id or p.role = 'super_admin')
  )
);
