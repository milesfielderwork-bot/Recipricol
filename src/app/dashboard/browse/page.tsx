import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RequestButton from "./RequestButton";
import TilePhoto from "../_components/TilePhoto";
import Badge from "../_components/Badge";

type Listing = {
  id: string;
  club_name: string;
  date: string | null;
  start_time: string | null;
  max_guests: number | null;
  guest_fee: number | null;
  notes: string | null;
  profiles: { display_name: string } | null;
};

export default async function BrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "nomad") redirect("/dashboard");

  const [{ data: listings }, { data: myRequests }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, club_name, date, start_time, max_guests, guest_fee, notes, profiles(display_name)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .returns<Listing[]>(),
    supabase.from("booking_requests").select("listing_id, status").eq("nomad_id", user.id),
  ]);

  const requestStatusByListing = new Map(
    myRequests?.map((r) => [r.listing_id, r.status]) ?? []
  );

  return (
    <main className="w-full px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Available Rounds
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings?.map((listing) => {
            const isFlexible = !listing.date;
            return (
              <div key={listing.id} className="border border-[#f2ede4]/15">
                <TilePhoto seed={listing.id}>
                  <div className="absolute right-2 top-2">
                    <Badge>{isFlexible ? "Enquire" : "Open"}</Badge>
                  </div>
                </TilePhoto>

                <div className="p-4">
                  <p className="text-sm uppercase tracking-[0.15em] text-[#f2ede4]">
                    {listing.club_name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f2ede4]/40">
                    Hosted by {listing.profiles?.display_name ?? "a member"}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f2ede4]/50">
                    {listing.date ?? "Flexible"} · {listing.start_time ?? "Flexible"} ·{" "}
                    {listing.max_guests ? `${listing.max_guests} slot(s)` : "Open"}
                    {listing.guest_fee ? ` · £${listing.guest_fee}` : ""}
                  </p>
                  {listing.notes && (
                    <p className="mt-2 text-xs italic text-[#f2ede4]/50">{listing.notes}</p>
                  )}

                  <div className="mt-4 border-t border-[#f2ede4]/10 pt-4">
                    <RequestButton
                      listingId={listing.id}
                      isFlexible={isFlexible}
                      existingStatus={requestStatusByListing.get(listing.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {!listings?.length && (
            <p className="text-sm text-[#f2ede4]/50">No rounds available right now.</p>
          )}
        </div>
      </div>
    </main>
  );
}
