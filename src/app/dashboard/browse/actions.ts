"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function requestListing(listingId: string, message: string): Promise<ActionResult> {
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
  if (profile?.role !== "nomad") return { ok: false, error: "Not authorized" };

  const { error } = await supabase.from("booking_requests").insert({
    listing_id: listingId,
    nomad_id: user.id,
    message: message.trim() || null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/browse");
  return { ok: true };
}
