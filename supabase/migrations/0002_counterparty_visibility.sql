-- Lets a Host see the name of a Nomad who has requested one of their
-- listings, and a Nomad see the name of the Host whose listing they've
-- requested. Without this, profiles_select_own blocks those joins since
-- neither party owns the other's profile row.

create policy "profiles_select_counterparty" on public.profiles
  for select using (
    exists (
      select 1 from public.booking_requests br
      join public.listings l on l.id = br.listing_id
      where (br.nomad_id = auth.uid() and l.host_id = profiles.id)
         or (l.host_id = auth.uid() and br.nomad_id = profiles.id)
    )
  );
