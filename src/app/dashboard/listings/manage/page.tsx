import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RequestActions from "../RequestActions";
import TilePhoto from "../../_components/TilePhoto";
import Badge from "../../_components/Badge";

type BookingRequest = {
  id: string;
  status: string;
  message: string | null;
  profiles: { display_name: string } | null;
};

type Listing = {
  id: string;
  club_name: string;
  date: string | null;
  start_time: string | null;
  max_guests: number | null;
  guest_fee: number | null;
  status: string;
  booking_requests: BookingRequest[];
};

export default async function ManageListingsPage() {
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
  if (profile?.role !== "host") redirect("/dashboard");

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, club_name, date, start_time, max_guests, guest_fee, status, booking_requests(id, status, message, profiles(display_name))"
    )
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Listing[]>();

  return (
    <main className="w-full px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Manage Live Tee Times
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings?.map((listing) => (
            <div key={listing.id} className="border border-[#f2ede4]/15">
              <TilePhoto seed={listing.id}>
                <div className="absolute right-2 top-2">
                  <Badge>{listing.status}</Badge>
                </div>
              </TilePhoto>

              <div className="p-4">
                <p className="text-sm uppercase tracking-[0.15em] text-[#f2ede4]">
                  {listing.club_name}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f2ede4]/50">
                  {listing.date ?? "Flexible"} · {listing.start_time ?? "Flexible"} ·{" "}
                  {listing.max_guests ? `${listing.max_guests} slot(s)` : "Open"}
                  {listing.guest_fee ? ` · £${listing.guest_fee}` : ""}
                </p>

                {listing.booking_requests.length > 0 && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-[#f2ede4]/10 pt-4">
                    {listing.booking_requests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#f2ede4]/85">
                            {req.profiles?.display_name ?? "A Nomad"}
                            {req.message ? ` — "${req.message}"` : ""}
                          </p>
                          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#f2ede4]/40">
                            {req.status}
                          </p>
                        </div>
                        {req.status === "requested" && <RequestActions requestId={req.id} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {!listings?.length && (
            <p className="text-sm text-[#f2ede4]/50">You haven&apos;t posted any rounds yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
