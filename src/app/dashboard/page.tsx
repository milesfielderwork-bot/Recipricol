import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  if (profile?.role === "host") {
    redirect("/dashboard/listings");
  }

  if (profile?.role === "nomad") {
    redirect("/dashboard/browse");
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-6 py-24">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-sm uppercase tracking-[0.2em] text-[#f2ede4]/70">
          {profile?.role ?? "member"} dashboard
        </p>
        <p className="mt-6 text-xs tracking-wide text-[#f2ede4]/40">
          {user.email}
        </p>
      </div>
    </main>
  );
}
