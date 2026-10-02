import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteForm from "./InviteForm";
import ReferralActions from "./ReferralActions";
import TilePhoto from "../dashboard/_components/TilePhoto";
import Badge from "../dashboard/_components/Badge";

const sectionTitle = "mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#f2ede4]/60";
const tileGrid = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";
const tile = "border border-[#f2ede4]/15";
const tileBody = "p-4";
const tileTitle = "text-sm uppercase tracking-[0.15em] text-[#f2ede4]";
const tileMeta = "mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f2ede4]/50";
const emptyState = "text-sm text-[#f2ede4]/50";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (callerProfile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  type Member = {
    id: string;
    role: string;
    display_name: string;
    phone: string | null;
    status: string;
    created_at: string;
    host_profiles: { home_club: string | null } | null;
    nomad_profiles: { handicap: string | null } | null;
  };
  type Listing = {
    id: string;
    club_name: string;
    date: string | null;
    start_time: string | null;
    max_guests: number | null;
    guest_fee: number | null;
    status: string;
    created_at: string;
    profiles: { display_name: string } | null;
  };
  type BookingRequest = {
    id: string;
    status: string;
    message: string | null;
    created_at: string;
    listings: { club_name: string } | null;
    profiles: { display_name: string } | null;
  };
  type Referral = {
    id: string;
    role: string;
    email: string;
    display_name: string;
    status: string;
    created_at: string;
    profiles: { display_name: string } | null;
  };

  const [{ data: members }, { data: listings }, { data: requests }, { data: referrals }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, role, display_name, phone, status, created_at, host_profiles(home_club), nomad_profiles(handicap)")
        .order("created_at", { ascending: false })
        .returns<Member[]>(),
      admin
        .from("listings")
        .select("id, club_name, date, start_time, max_guests, guest_fee, status, created_at, profiles(display_name)")
        .order("created_at", { ascending: false })
        .returns<Listing[]>(),
      admin
        .from("booking_requests")
        .select("id, status, message, created_at, listings(club_name), profiles(display_name)")
        .order("created_at", { ascending: false })
        .returns<BookingRequest[]>(),
      admin
        .from("referrals")
        .select("id, role, email, display_name, status, created_at, profiles:referred_by(display_name)")
        .order("created_at", { ascending: false })
        .returns<Referral[]>(),
    ]);

  return (
    <main className="min-h-screen w-full bg-black px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Admin
        </h1>

        <section>
          <InviteForm />
        </section>

        <section>
          <p className={sectionTitle}>Members ({members?.length ?? 0})</p>
          <div className={tileGrid}>
            {members?.map((m) => (
              <div key={m.id} className={tile}>
                <TilePhoto seed={m.id}>
                  <div className="absolute left-2 top-2">
                    <Badge>{m.role}</Badge>
                  </div>
                  <div className="absolute right-2 top-2">
                    <Badge>{m.status}</Badge>
                  </div>
                </TilePhoto>
                <div className={tileBody}>
                  <p className={tileTitle}>{m.display_name}</p>
                  <p className={tileMeta}>{m.phone ?? "No phone on file"}</p>
                  <p className={tileMeta}>
                    {m.host_profiles?.home_club ?? m.nomad_profiles?.handicap ?? "—"}
                  </p>
                </div>
              </div>
            ))}
            {!members?.length && <p className={emptyState}>No members yet.</p>}
          </div>
        </section>

        <section>
          <p className={sectionTitle}>Listings ({listings?.length ?? 0})</p>
          <div className={tileGrid}>
            {listings?.map((l) => (
              <div key={l.id} className={tile}>
                <TilePhoto seed={l.id}>
                  <div className="absolute right-2 top-2">
                    <Badge>{l.status}</Badge>
                  </div>
                </TilePhoto>
                <div className={tileBody}>
                  <p className={tileTitle}>{l.club_name}</p>
                  <p className={tileMeta}>Hosted by {l.profiles?.display_name ?? "—"}</p>
                  <p className={tileMeta}>
                    {l.date ?? "Flexible"} · {l.start_time ?? "Flexible"} ·{" "}
                    {l.max_guests ? `${l.max_guests} slot(s)` : "Open"}
                    {l.guest_fee ? ` · £${l.guest_fee}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {!listings?.length && <p className={emptyState}>No listings yet.</p>}
          </div>
        </section>

        <section>
          <p className={sectionTitle}>Booking requests ({requests?.length ?? 0})</p>
          <div className={tileGrid}>
            {requests?.map((r) => (
              <div key={r.id} className={tile}>
                <TilePhoto seed={r.id}>
                  <div className="absolute right-2 top-2">
                    <Badge>{r.status}</Badge>
                  </div>
                </TilePhoto>
                <div className={tileBody}>
                  <p className={tileTitle}>{r.listings?.club_name ?? "—"}</p>
                  <p className={tileMeta}>Requested by {r.profiles?.display_name ?? "—"}</p>
                  {r.message && (
                    <p className="mt-2 text-xs italic text-[#f2ede4]/50">&quot;{r.message}&quot;</p>
                  )}
                </div>
              </div>
            ))}
            {!requests?.length && <p className={emptyState}>No requests yet.</p>}
          </div>
        </section>

        <section>
          <p className={sectionTitle}>Referrals ({referrals?.length ?? 0})</p>
          <div className={tileGrid}>
            {referrals?.map((r) => (
              <div key={r.id} className={tile}>
                <TilePhoto seed={r.id}>
                  <div className="absolute left-2 top-2">
                    <Badge>{r.role}</Badge>
                  </div>
                  <div className="absolute right-2 top-2">
                    <Badge>{r.status}</Badge>
                  </div>
                </TilePhoto>
                <div className={tileBody}>
                  <p className={tileTitle}>{r.display_name}</p>
                  <p className={tileMeta}>{r.email}</p>
                  <p className={tileMeta}>Introduced by {r.profiles?.display_name ?? "—"}</p>
                  {r.status === "pending" && (
                    <div className="mt-4 border-t border-[#f2ede4]/10 pt-4">
                      <ReferralActions referralId={r.id} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!referrals?.length && <p className={emptyState}>No referrals yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
