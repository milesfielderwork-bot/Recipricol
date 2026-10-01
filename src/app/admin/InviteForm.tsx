"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inviteMember } from "./actions";

type Role = "host" | "nomad";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#f2ede4]";

const fieldClass =
  "w-full border-0 border-b border-[#f2ede4]/25 bg-transparent py-2 text-sm tracking-wide text-[#f2ede4] placeholder:text-[#f2ede4]/40 focus:border-[#f2ede4] focus:outline-none";

const labelClass = "mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#f2ede4]/60";

export default function InviteForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<Role>("host");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await inviteMember(formData);

    if (result.ok) {
      formRef.current?.reset();
      setRole("host");
      setStatus("idle");
      router.refresh();
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setRole("host")}
          className={`${pillButton} flex-1 ${role === "host" ? "bg-[#f2ede4] text-black" : ""}`}
        >
          Host
        </button>
        <button
          type="button"
          onClick={() => setRole("nomad")}
          className={`${pillButton} flex-1 ${role === "nomad" ? "bg-[#f2ede4] text-black" : ""}`}
        >
          Nomad
        </button>
      </div>
      <input type="hidden" name="role" value={role} />

      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input className={fieldClass} id="email" name="email" type="email" required />
      </div>

      <div>
        <label className={labelClass} htmlFor="displayName">Name</label>
        <input className={fieldClass} id="displayName" name="displayName" required />
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input className={fieldClass} id="phone" name="phone" type="tel" />
      </div>

      {role === "host" ? (
        <div>
          <label className={labelClass} htmlFor="homeClub">Home club</label>
          <input className={fieldClass} id="homeClub" name="homeClub" />
        </div>
      ) : (
        <div>
          <label className={labelClass} htmlFor="handicap">Handicap</label>
          <input className={fieldClass} id="handicap" name="handicap" placeholder="or leave blank" />
        </div>
      )}

      {status === "error" && <p className="text-xs text-red-400">{error}</p>}

      <button type="submit" className={`${pillButton} mt-2`} disabled={status === "submitting"}>
        {status === "submitting" ? "Inviting…" : "Invite member"}
      </button>
    </form>
  );
}
