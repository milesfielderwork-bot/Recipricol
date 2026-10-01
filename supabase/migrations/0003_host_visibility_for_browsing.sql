-- Lets any authenticated member see the display name of a Host who
-- currently has an open listing, so Nomads can see who they'd be dealing
-- with while browsing - before any booking_request exists between them
-- (profiles_select_counterparty only covers after a request is made).

create policy "profiles_select_open_listing_host" on public.profiles
  for select using (
    exists (
      select 1 from public.listings
      where listings.host_id = profiles.id and listings.status = 'open'
    )
  );
