-- Fixes a pre-existing bug: profiles_select_counterparty (0002) queries
-- booking_requests/listings, while booking_requests' own policies query
-- profiles (for the role check). Postgres detects this as infinite
-- recursion ("infinite recursion detected in policy for relation
-- booking_requests") and rejects the query outright - this currently
-- breaks every real booking_requests insert (Nomad "Request to Book"
-- included), not just the new Host-to-Host case from migration 0004.
--
-- Fix: move the cross-table lookup into a security definer function. Such
-- functions run as their owner (the table owner, which isn't subject to
-- its own RLS by default), so the internal booking_requests/listings
-- lookup no longer re-triggers booking_requests' policies - breaking the
-- cycle.
create or replace function public.is_booking_counterparty(viewer_id uuid, target_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.booking_requests br
    join public.listings l on l.id = br.listing_id
    where (br.nomad_id = viewer_id and l.host_id = target_profile_id)
       or (l.host_id = viewer_id and br.nomad_id = target_profile_id)
  );
$$;

drop policy "profiles_select_counterparty" on public.profiles;

create policy "profiles_select_counterparty" on public.profiles
  for select using (
    public.is_booking_counterparty(auth.uid(), profiles.id)
  );
