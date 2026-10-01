import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "./ListingForm";
import RequestActions from "./RequestActions";

const sectionTitle = "mb-4 text-xs uppercase tracking-[0.25em] text-[#f2ede4]/60";
const card = "border border-[#f2ede4]/15 p-5";

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

export default async function HostListingsPage() {
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
    <main className="min-h-screen w-full bg-black px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-16">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Your Rounds
        </h1>

        <section>
          <p className={sectionTitle}>Post a round</p>
          <ListingForm />
        </section>

        <section>
          <p className={sectionTitle}>Your listings ({listings?.length ?? 0})</p>
          <div className="flex flex-col gap-4">
            {listings?.map((listing) => (
              <div key={listing.id} className={card}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm uppercase tracking-[0.15em] text-[#f2ede4]">
                    {listing.club_name}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/50">
                    {listing.status}
                  </p>
                </div>
                <p className="mt-2 text-xs text-[#f2ede4]/60">
                  {listing.date ?? "Flexible date"} · {listing.start_time ?? "Flexible time"} ·{" "}
                  {listing.max_guests ? `${listing.max_guests} slot(s)` : "Slots open"}
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
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/40">
                            {req.status}
                          </p>
                        </div>
                        {req.status === "requested" && <RequestActions requestId={req.id} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!listings?.length && (
              <p className="text-sm text-[#f2ede4]/50">You haven&apos;t posted any rounds yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
