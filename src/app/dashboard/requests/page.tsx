import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TilePhoto from "../_components/TilePhoto";
import Badge from "../_components/Badge";

type RequestRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  listings: {
    club_name: string;
    date: string | null;
    start_time: string | null;
    profiles: { display_name: string } | null;
  } | null;
};

export default async function RequestsPage() {
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

  const { data: requests } = await supabase
    .from("booking_requests")
    .select("id, status, message, created_at, listings(club_name, date, start_time, profiles(display_name))")
    .eq("nomad_id", user.id)
    .order("created_at", { ascending: false })
    .returns<RequestRow[]>();

  return (
    <main className="w-full px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Your Requests
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {requests?.map((req) => (
            <div key={req.id} className="border border-[#f2ede4]/15">
              <TilePhoto seed={req.id}>
                <div className="absolute right-2 top-2">
                  <Badge>{req.status}</Badge>
                </div>
              </TilePhoto>

              <div className="p-4">
                <p className="text-sm uppercase tracking-[0.15em] text-[#f2ede4]">
                  {req.listings?.club_name ?? "—"}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f2ede4]/40">
                  Hosted by {req.listings?.profiles?.display_name ?? "a member"}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f2ede4]/50">
                  {req.listings?.date ?? "Flexible"} · {req.listings?.start_time ?? "Flexible"}
                </p>
                {req.message && (
                  <p className="mt-2 text-xs italic text-[#f2ede4]/50">&quot;{req.message}&quot;</p>
                )}
              </div>
            </div>
          ))}
          {!requests?.length && (
            <p className="text-sm text-[#f2ede4]/50">You haven&apos;t sent any requests yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
