import { NextResponse } from "next/server";

type RegisterPayload = {
  role: "host" | "nomad";
  name: string;
  email: string;
  phone: string;
  homeClub: string | null;
  handicap: string | null;
  heardAbout: string;
};

function isValid(body: unknown): body is RegisterPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (b.role !== "host" && b.role !== "nomad") return false;
  if (typeof b.name !== "string" || !b.name.trim()) return false;
  if (typeof b.email !== "string" || !b.email.includes("@")) return false;
  if (typeof b.phone !== "string" || !b.phone.trim()) return false;
  if (typeof b.heardAbout !== "string" || !b.heardAbout.trim()) return false;
  if (b.role === "host" && (typeof b.homeClub !== "string" || !b.homeClub.trim())) return false;
  return true;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValid(body)) {
    return NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 });
  }

  console.log("[reciprocal] interest registration", {
    receivedAt: new Date().toISOString(),
    ...body,
  });

  return NextResponse.json({ ok: true });
}
