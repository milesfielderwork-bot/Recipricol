"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { respondToRequest } from "./actions";

const smallButton =
  "text-[10px] uppercase tracking-[0.2em] underline underline-offset-4 disabled:opacity-40";

export default function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function respond(action: "accepted" | "declined") {
    setPending(true);
    await respondToRequest(requestId, action);
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => respond("accepted")}
        disabled={pending}
        className={`${smallButton} text-[#f2ede4] hover:text-white`}
      >
        Accept
      </button>
      <button
        type="button"
        onClick={() => respond("declined")}
        disabled={pending}
        className={`${smallButton} text-[#f2ede4]/50 hover:text-[#f2ede4]`}
      >
        Decline
      </button>
    </div>
  );
}
