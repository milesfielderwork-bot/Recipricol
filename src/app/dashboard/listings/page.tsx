import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReferralSection from "../_components/ReferralSection";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black";

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

  return (
    <main className="w-full px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
            Your Rounds
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/listings/new" className={pillButton}>
              Post a Round
            </Link>
            <Link href="/dashboard/listings/join" className={pillButton}>
              Join a Round
            </Link>
          </div>
        </div>

        <ReferralSection />
      </div>
    </main>
  );
}
