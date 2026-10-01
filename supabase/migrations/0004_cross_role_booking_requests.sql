-- Lets Hosts request to join other Hosts' listings, not just Nomads
-- requesting Hosts. booking_requests.nomad_id keeps its name (avoids
-- touching two FKs, two indexes, and three existing RLS policies for a
-- cosmetic rename) but now holds the id of *any* requesting member - host
-- or nomad - never the listing's own host.

drop policy "booking_requests_insert_own" on public.booking_requests;

create policy "booking_requests_insert_own" on public.booking_requests
  for insert with check (
    nomad_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('host', 'nomad')
    )
    and exists (
      select 1 from public.listings
      where listings.id = booking_requests.listing_id
        and listings.host_id <> auth.uid()
    )
  );
