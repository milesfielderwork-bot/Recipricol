"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestListing } from "./actions";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-6 py-2 text-[10px] uppercase tracking-[0.25em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#f2ede4]";

const fieldClass =
  "w-full border-0 border-b border-[#f2ede4]/25 bg-transparent py-2 text-sm tracking-wide text-[#f2ede4] placeholder:text-[#f2ede4]/40 focus:border-[#f2ede4] focus:outline-none";

export default function RequestButton({
  listingId,
  isFlexible,
  existingStatus,
}: {
  listingId: string;
  isFlexible: boolean;
  existingStatus?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  if (existingStatus) {
    return (
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#f2ede4]/50">
        {existingStatus}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={pillButton} onClick={() => setOpen(true)}>
        {isFlexible ? "Send Enquiry" : "Request to Book"}
      </button>
    );
  }

  async function submit() {
    setStatus("submitting");
    const result = await requestListing(listingId, message);
    if (result.ok) {
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        className={fieldClass}
        placeholder="Optional message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {status === "error" && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="button" className={pillButton} onClick={submit} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Confirm"}
        </button>
        <button
          type="button"
          className="text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/40 hover:text-[#f2ede4]/70"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
