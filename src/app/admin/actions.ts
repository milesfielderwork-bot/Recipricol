"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

type InviteDetails = {
  email: string;
  role: "host" | "nomad";
  displayName: string;
  phone: string | null;
  homeClub: string | null;
  handicap: string | null;
};

async function performInvite(details: InviteDetails): Promise<InviteResult> {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const adminClient = createAdminClient();

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    details.email,
    { redirectTo: `${origin}/auth/callback` }
  );

  if (inviteError || !inviteData.user) {
    return { ok: false, error: inviteError?.message ?? "Invite failed" };
  }

  const userId = inviteData.user.id;

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: userId,
    role: details.role,
    display_name: details.displayName,
    phone: details.phone,
  });

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: roleProfileError } =
    details.role === "host"
      ? await adminClient.from("host_profiles").insert({ profile_id: userId, home_club: details.homeClub })
      : await adminClient.from("nomad_profiles").insert({ profile_id: userId, handicap: details.handicap });

  if (roleProfileError) {
    return { ok: false, error: roleProfileError.message };
  }

  return { ok: true };
}

export async function inviteMember(formData: FormData): Promise<InviteResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized" };

  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const homeClub = String(formData.get("homeClub") || "").trim() || null;
  const handicap = String(formData.get("handicap") || "").trim() || null;

  if (!email || !displayName || (role !== "host" && role !== "nomad")) {
    return { ok: false, error: "Missing required fields" };
  }

  const result = await performInvite({ email, role, displayName, phone, homeClub, handicap });
  if (!result.ok) return result;

  revalidatePath("/admin");
  return { ok: true };
}

export async function respondToReferral(
  referralId: string,
  action: "invited" | "dismissed"
): Promise<InviteResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized" };

  const adminClient = createAdminClient();

  if (action === "dismissed") {
    const { error } = await adminClient
      .from("referrals")
      .update({ status: "dismissed" })
      .eq("id", referralId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
    return { ok: true };
  }

  const { data: referral, error: referralError } = await adminClient
    .from("referrals")
    .select("email, role, display_name, phone, home_club, handicap, status")
    .eq("id", referralId)
    .single();

  if (referralError || !referral) {
    return { ok: false, error: referralError?.message ?? "Referral not found" };
  }
  if (referral.status !== "pending") {
    return { ok: false, error: "Referral already handled" };
  }

  const result = await performInvite({
    email: referral.email,
    role: referral.role,
    displayName: referral.display_name,
    phone: referral.phone,
    homeClub: referral.home_club,
    handicap: referral.handicap,
  });
  if (!result.ok) return result;

  const { error: statusError } = await adminClient
    .from("referrals")
    .update({ status: "invited" })
    .eq("id", referralId);
  if (statusError) return { ok: false, error: statusError.message };

  revalidatePath("/admin");
  return { ok: true };
}
