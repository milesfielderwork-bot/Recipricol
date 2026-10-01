import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RequestButton from "./RequestButton";

const card = "border border-[#f2ede4]/15 p-5";

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
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Available Rounds
        </h1>

        <div className="flex flex-col gap-4">
          {listings?.map((listing) => {
            const isFlexible = !listing.date;
            return (
              <div key={listing.id} className={card}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm uppercase tracking-[0.15em] text-[#f2ede4]">
                    {listing.club_name}
                  </p>
                  {isFlexible && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                      Open to enquiries
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-[#f2ede4]/60">
                  Hosted by {listing.profiles?.display_name ?? "a member"}
                </p>
                <p className="mt-1 text-xs text-[#f2ede4]/60">
                  {listing.date ?? "Flexible date"} · {listing.start_time ?? "Flexible time"} ·{" "}
                  {listing.max_guests ? `${listing.max_guests} slot(s)` : "Slots open"}
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
