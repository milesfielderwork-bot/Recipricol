import Image from "next/image";
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
    "font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/60 transition-colors hover:text-[#f2ede4]";

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="fixed inset-0">
        <Image src="/hero-bg.jpg" alt="" fill priority quality={90} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10">
        <header className="flex items-center justify-between border-b border-[#f2ede4]/15 px-6 py-5 sm:px-12">
          <nav className="flex gap-6">
            {role === "host" && (
              <>
                <Link href="/dashboard/listings" className={navLinkClass}>
                  Browse Other Hosts
                </Link>
                <Link href="/dashboard/listings/new" className={navLinkClass}>
                  Post a Tee Time
                </Link>
                <Link href="/dashboard/listings/manage" className={navLinkClass}>
                  Manage Live Tee Times
                </Link>
              </>
            )}
            {role === "nomad" && (
              <>
                <Link href="/dashboard/browse" className={navLinkClass}>
                  Browse
                </Link>
                <Link href="/dashboard/requests/requested" className={navLinkClass}>
                  Requested
                </Link>
                <Link href="/dashboard/requests/accepted" className={navLinkClass}>
                  Accepted
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
    </div>
  );
}
