"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { respondToReferral } from "./actions";

const smallButton =
  "text-[10px] uppercase tracking-[0.2em] underline underline-offset-4 disabled:opacity-40";

export default function ReferralActions({ referralId }: { referralId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function respond(action: "invited" | "dismissed") {
    setPending(true);
    setError("");
    const result = await respondToReferral(referralId, action);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => respond("invited")}
          disabled={pending}
          className={`${smallButton} text-[#f2ede4] hover:text-white`}
        >
          Invite
        </button>
        <button
          type="button"
          onClick={() => respond("dismissed")}
          disabled={pending}
          className={`${smallButton} text-[#f2ede4]/50 hover:text-[#f2ede4]`}
        >
          Dismiss
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
