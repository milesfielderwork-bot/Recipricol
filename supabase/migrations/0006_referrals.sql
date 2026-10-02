-- A Host/Nomad's "Introduce New Member" submission. Unlike admin's direct
-- invite, this doesn't create an account - it queues a referral for an
-- admin to review and turn into a real invite (or dismiss) from /admin.
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referred_by uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('host', 'nomad')),
  email text not null,
  display_name text not null,
  phone text,
  home_club text,
  handicap text,
  status text not null default 'pending' check (status in ('pending', 'invited', 'dismissed')),
  created_at timestamptz not null default now()
);

create index referrals_status_idx on public.referrals (status);

alter table public.referrals enable row level security;

-- Only Hosts/Nomads submit referrals; admin reads/writes via the
-- service-role client on /admin (bypasses RLS), so no select/update
-- policy is needed here.
create policy "referrals_insert_own" on public.referrals
  for insert with check (
    referred_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('host', 'nomad')
    )
  );
