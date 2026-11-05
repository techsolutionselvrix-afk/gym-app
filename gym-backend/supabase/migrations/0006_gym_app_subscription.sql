-- Owner's own GymSync app subscription (separate from gym-members-subscribe-to-gym).
-- Adds an expiry timestamp on each gym; owners see days remaining and can renew in-app.

alter table gyms
  add column if not exists subscription_ends_at timestamptz;

-- Give existing gyms a 30-day trial window so no one gets locked out immediately.
update gyms
   set subscription_ends_at = now() + interval '30 days'
 where subscription_ends_at is null;

-- Also default new gyms to a 30-day trial.
alter table gyms
  alter column subscription_ends_at set default (now() + interval '30 days');

create index if not exists idx_gyms_subscription_ends on gyms(subscription_ends_at);
