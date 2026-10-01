"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireHost() {
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

  return profile?.role === "host" ? { supabase, userId: user.id } : null;
}

export async function createListing(formData: FormData): Promise<ActionResult> {
  const ctx = await requireHost();
  if (!ctx) return { ok: false, error: "Not authorized" };

  const clubName = String(formData.get("clubName") || "").trim();
  if (!clubName) return { ok: false, error: "Course is required" };

  const date = String(formData.get("date") || "").trim() || null;
  const startTime = String(formData.get("startTime") || "").trim() || null;
  const maxGuestsRaw = String(formData.get("maxGuests") || "").trim();
  const guestFeeRaw = String(formData.get("guestFee") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;

  const { error } = await ctx.supabase.from("listings").insert({
    host_id: ctx.userId,
    club_name: clubName,
    date,
    start_time: startTime,
    max_guests: maxGuestsRaw ? Number(maxGuestsRaw) : null,
    guest_fee: guestFeeRaw ? Number(guestFeeRaw) : null,
    notes,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/listings/manage");
  return { ok: true };
}

export async function respondToRequest(
  requestId: string,
  action: "accepted" | "declined"
): Promise<ActionResult> {
  const ctx = await requireHost();
  if (!ctx) return { ok: false, error: "Not authorized" };

  const { error } = await ctx.supabase
    .from("booking_requests")
    .update({ status: action, responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/listings/manage");
  return { ok: true };
}

export async function cancelListing(listingId: string): Promise<ActionResult> {
  const ctx = await requireHost();
  if (!ctx) return { ok: false, error: "Not authorized" };

  const { error } = await ctx.supabase
    .from("listings")
    .update({ status: "cancelled" })
    .eq("id", listingId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/listings");
  return { ok: true };
}
