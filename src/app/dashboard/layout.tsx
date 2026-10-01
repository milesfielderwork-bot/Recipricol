import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  const navLinkClass =
    "text-[10px] uppercase tracking-[0.25em] text-[#f2ede4]/60 transition-colors hover:text-[#f2ede4]";

  return (
    <div className="min-h-screen w-full bg-black">
      <header className="flex items-center justify-between border-b border-[#f2ede4]/10 px-6 py-5 sm:px-12">
        <nav className="flex gap-6">
          {role === "host" && (
            <Link href="/dashboard/listings" className={navLinkClass}>
              Your Rounds
            </Link>
          )}
          {role === "nomad" && (
            <>
              <Link href="/dashboard/browse" className={navLinkClass}>
                Browse
              </Link>
              <Link href="/dashboard/requests" className={navLinkClass}>
                Your Requests
              </Link>
            </>
          )}
        </nav>
        <form action={signOut}>
          <button type="submit" className={navLinkClass}>
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
