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

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const adminClient = createAdminClient();

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    { redirectTo: `${origin}/auth/callback` }
  );

  if (inviteError || !inviteData.user) {
    return { ok: false, error: inviteError?.message ?? "Invite failed" };
  }

  const userId = inviteData.user.id;

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: userId,
    role,
    display_name: displayName,
    phone,
  });

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: roleProfileError } =
    role === "host"
      ? await adminClient.from("host_profiles").insert({ profile_id: userId, home_club: homeClub })
      : await adminClient.from("nomad_profiles").insert({ profile_id: userId, handicap });

  if (roleProfileError) {
    return { ok: false, error: roleProfileError.message };
  }

  revalidatePath("/admin");
  return { ok: true };
}
