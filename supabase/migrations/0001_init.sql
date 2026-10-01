-- Reciprocal Phase 2 schema: profiles, listings, booking requests.
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- One row per member (Host, Nomad, or admin), keyed to the Supabase auth user.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('host', 'nomad', 'admin')),
  display_name text not null,
  phone text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create table public.host_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  home_club text,
  notes text
);

create table public.nomad_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  handicap text, -- nullable text, not numeric: allows "no official handicap"
  notes text
);

-- A round a Host is offering. Only club_name is required - date/start_time/
-- max_guests left blank means "open to hosting here, no specifics yet".
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  club_name text not null,
  date date,
  start_time time,
  max_guests int,
  guest_fee numeric(10, 2),
  notes text,
  status text not null default 'open' check (status in ('open', 'booked', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

-- A Nomad's request/enquiry against a listing (firm booking or loose enquiry
-- - same table either way, the UI is what differs).
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  nomad_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'declined', 'cancelled', 'completed')),
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index listings_host_id_idx on public.listings (host_id);
create index listings_status_idx on public.listings (status);
create index booking_requests_listing_id_idx on public.booking_requests (listing_id);
create index booking_requests_nomad_id_idx on public.booking_requests (nomad_id);

-- Row Level Security. Admin pages read via the service-role client
-- server-side (after an explicit role check in app code), so these policies
-- only need to cover what regular Hosts/Nomads can see of each other's data -
-- no "is admin" bypass clause needed here.

alter table public.profiles enable row level security;
alter table public.host_profiles enable row level security;
alter table public.nomad_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.booking_requests enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "host_profiles_select_own" on public.host_profiles
  for select using (profile_id = auth.uid());

create policy "host_profiles_update_own" on public.host_profiles
  for update using (profile_id = auth.uid());

create policy "nomad_profiles_select_own" on public.nomad_profiles
  for select using (profile_id = auth.uid());

create policy "nomad_profiles_update_own" on public.nomad_profiles
  for update using (profile_id = auth.uid());

-- Hosts manage their own listings; anyone logged in can browse open ones.
create policy "listings_select_own_or_open" on public.listings
  for select using (host_id = auth.uid() or status = 'open');

create policy "listings_insert_own" on public.listings
  for insert with check (
    host_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'host'
    )
  );

create policy "listings_update_own" on public.listings
  for update using (host_id = auth.uid());

-- Nomads see their own requests; Hosts see requests against their listings.
create policy "booking_requests_select_own_or_hosted" on public.booking_requests
  for select using (
    nomad_id = auth.uid()
    or exists (
      select 1 from public.listings
      where listings.id = booking_requests.listing_id and listings.host_id = auth.uid()
    )
  );

create policy "booking_requests_insert_own" on public.booking_requests
  for insert with check (
    nomad_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'nomad'
    )
  );

-- Nomads can update their own request (e.g. cancel); Hosts can update the
-- status of requests against their own listings (accept/decline).
create policy "booking_requests_update_own_or_hosted" on public.booking_requests
  for update using (
    nomad_id = auth.uid()
    or exists (
      select 1 from public.listings
      where listings.id = booking_requests.listing_id and listings.host_id = auth.uid()
    )
  );
