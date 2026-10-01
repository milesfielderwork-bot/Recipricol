"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "./actions";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#f2ede4]";

const fieldClass =
  "w-full border-0 border-b border-[#f2ede4]/25 bg-transparent py-2 text-sm tracking-wide text-[#f2ede4] placeholder:text-[#f2ede4]/40 focus:border-[#f2ede4] focus:outline-none";

const labelClass = "mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-[#f2ede4]/60";

export default function ListingForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const result = await createListing(new FormData(event.currentTarget));

    if (result.ok) {
      formRef.current?.reset();
      setStatus("idle");
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className={labelClass} htmlFor="clubName">Course</label>
        <input className={fieldClass} id="clubName" name="clubName" required />
      </div>

      <p className="text-xs leading-relaxed text-[#f2ede4]/50">
        Leave date, time and slots blank to simply flag you&apos;re open to
        hosting at this course, without committing to specifics yet.
      </p>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="date">Date</label>
          <input className={fieldClass} id="date" name="date" type="date" />
        </div>
        <div>
          <label className={labelClass} htmlFor="startTime">Time</label>
          <input className={fieldClass} id="startTime" name="startTime" type="time" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="maxGuests">Free slots</label>
          <input className={fieldClass} id="maxGuests" name="maxGuests" type="number" min="1" />
        </div>
        <div>
          <label className={labelClass} htmlFor="guestFee">Guest fee (£)</label>
          <input className={fieldClass} id="guestFee" name="guestFee" type="number" min="0" step="0.01" />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">Notes</label>
        <input className={fieldClass} id="notes" name="notes" />
      </div>

      {status === "error" && <p className="text-xs text-red-400">{error}</p>}

      <button type="submit" className={`${pillButton} mt-2`} disabled={status === "submitting"}>
        {status === "submitting" ? "Posting…" : "Post round"}
      </button>
    </form>
  );
}
