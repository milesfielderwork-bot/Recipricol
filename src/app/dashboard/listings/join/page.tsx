import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJoinableListings } from "../../_lib/joinableListings";
import ListingGrid from "../../_components/ListingGrid";

export default async function JoinRoundPage() {
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

  const { listings, requestStatusByListing } = await getJoinableListings(supabase, user.id);

  return (
    <main className="w-full px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Join a Round
        </h1>

        <ListingGrid
          listings={listings}
          requestStatusByListing={requestStatusByListing}
          emptyMessage="No other Hosts have open rounds right now."
        />
      </div>
    </main>
  );
}
