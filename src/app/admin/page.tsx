import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteForm from "./InviteForm";

const sectionTitle = "mb-4 text-xs uppercase tracking-[0.25em] text-[#f2ede4]/60";
const tableWrap = "overflow-x-auto border border-[#f2ede4]/15";
const th = "whitespace-nowrap border-b border-[#f2ede4]/15 px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/50";
const td = "whitespace-nowrap px-4 py-3 text-sm text-[#f2ede4]/85";

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

  const [{ data: members }, { data: listings }, { data: requests }] = await Promise.all([
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
  ]);

  return (
    <main className="min-h-screen w-full bg-black px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Admin
        </h1>

        <section>
          <p className={sectionTitle}>Invite a new member</p>
          <div className="max-w-sm">
            <InviteForm />
          </div>
        </section>

        <section>
          <p className={sectionTitle}>Members ({members?.length ?? 0})</p>
          <div className={tableWrap}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Role</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Club / Handicap</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {members?.map((m) => (
                  <tr key={m.id}>
                    <td className={td}>{m.display_name}</td>
                    <td className={td}>{m.role}</td>
                    <td className={td}>{m.phone ?? "—"}</td>
                    <td className={td}>
                      {m.host_profiles?.home_club ?? m.nomad_profiles?.handicap ?? "—"}
                    </td>
                    <td className={td}>{m.status}</td>
                  </tr>
                ))}
                {!members?.length && (
                  <tr>
                    <td className={td} colSpan={5}>No members yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <p className={sectionTitle}>Listings ({listings?.length ?? 0})</p>
          <div className={tableWrap}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Club</th>
                  <th className={th}>Host</th>
                  <th className={th}>Date</th>
                  <th className={th}>Time</th>
                  <th className={th}>Slots</th>
                  <th className={th}>Fee</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {listings?.map((l) => (
                  <tr key={l.id}>
                    <td className={td}>{l.club_name}</td>
                    <td className={td}>{l.profiles?.display_name ?? "—"}</td>
                    <td className={td}>{l.date ?? "Flexible"}</td>
                    <td className={td}>{l.start_time ?? "—"}</td>
                    <td className={td}>{l.max_guests ?? "—"}</td>
                    <td className={td}>{l.guest_fee ? `£${l.guest_fee}` : "—"}</td>
                    <td className={td}>{l.status}</td>
                  </tr>
                ))}
                {!listings?.length && (
                  <tr>
                    <td className={td} colSpan={7}>No listings yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <p className={sectionTitle}>Booking requests ({requests?.length ?? 0})</p>
          <div className={tableWrap}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Club</th>
                  <th className={th}>Nomad</th>
                  <th className={th}>Message</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests?.map((r) => (
                  <tr key={r.id}>
                    <td className={td}>{r.listings?.club_name ?? "—"}</td>
                    <td className={td}>{r.profiles?.display_name ?? "—"}</td>
                    <td className={td}>{r.message ?? "—"}</td>
                    <td className={td}>{r.status}</td>
                  </tr>
                ))}
                {!requests?.length && (
                  <tr>
                    <td className={td} colSpan={4}>No requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
