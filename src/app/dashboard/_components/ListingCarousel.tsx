import RequestButton from "../browse/RequestButton";
import TilePhoto from "./TilePhoto";
import Badge from "./Badge";
import type { JoinableListing } from "../_lib/joinableListings";

export default function ListingCarousel({
  listings,
  requestStatusByListing,
  emptyMessage = "No rounds available right now.",
}: {
  listings: JoinableListing[];
  requestStatusByListing: Map<string, string>;
  emptyMessage?: string;
}) {
  if (!listings.length) {
    return <p className="text-sm text-[#f2ede4]/50">{emptyMessage}</p>;
  }

  return (
    <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4">
      {listings.map((listing) => {
        const isFlexible = !listing.date;
        return (
          <div
            key={listing.id}
            className="w-72 shrink-0 snap-start border border-[#f2ede4]/15"
          >
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
    </div>
  );
}
