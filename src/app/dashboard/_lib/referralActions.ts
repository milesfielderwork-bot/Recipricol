"use server";

import { createClient } from "@/lib/supabase/server";

export type ReferralResult = { ok: true } | { ok: false; error: string };

export async function submitReferral(formData: FormData): Promise<ReferralResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "host" && profile?.role !== "nomad") {
    return { ok: false, error: "Not authorized" };
  }

  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const homeClub = String(formData.get("homeClub") || "").trim() || null;
  const handicap = String(formData.get("handicap") || "").trim() || null;

  if (!email || !displayName || (role !== "host" && role !== "nomad")) {
    return { ok: false, error: "Missing required fields" };
  }

  const { error } = await supabase.from("referrals").insert({
    referred_by: user.id,
    role,
    email,
    display_name: displayName,
    phone,
    home_club: homeClub,
    handicap,
  });

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
