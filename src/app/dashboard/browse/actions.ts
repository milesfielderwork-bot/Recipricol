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
  if (!profile || profile.role === "admin") return { ok: false, error: "Not authorized" };

  const { data: listing } = await supabase
    .from("listings")
    .select("host_id")
    .eq("id", listingId)
    .single();
  if (!listing) return { ok: false, error: "Listing not found" };
  if (listing.host_id === user.id) {
    return { ok: false, error: "You can't request your own listing" };
  }

  const { error } = await supabase.from("booking_requests").insert({
    listing_id: listingId,
    nomad_id: user.id,
    message: message.trim() || null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/browse");
  revalidatePath("/dashboard/listings");
  return { ok: true };
}
