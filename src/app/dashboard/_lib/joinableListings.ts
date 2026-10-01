import type { SupabaseClient } from "@supabase/supabase-js";

export type JoinableListing = {
  id: string;
  club_name: string;
  date: string | null;
  start_time: string | null;
  max_guests: number | null;
  guest_fee: number | null;
  notes: string | null;
  profiles: { display_name: string } | null;
};

export async function getJoinableListings(
  supabase: SupabaseClient,
  userId: string
): Promise<{ listings: JoinableListing[]; requestStatusByListing: Map<string, string> }> {
  const [{ data: listings }, { data: myRequests }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, club_name, date, start_time, max_guests, guest_fee, notes, profiles(display_name)")
      .eq("status", "open")
      .neq("host_id", userId)
      .order("created_at", { ascending: false })
      .returns<JoinableListing[]>(),
    supabase.from("booking_requests").select("listing_id, status").eq("nomad_id", userId),
  ]);

  const requestStatusByListing = new Map(
    myRequests?.map((r) => [r.listing_id, r.status]) ?? []
  );

  return { listings: listings ?? [], requestStatusByListing };
}
