"use client";

import { useState, type FormEvent } from "react";

type Role = "host" | "nomad";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#f2ede4]";

const fieldClass =
  "w-full border-0 border-b border-[#f2ede4]/25 bg-transparent py-2 text-sm tracking-wide text-[#f2ede4] placeholder:text-[#f2ede4]/40 focus:border-[#f2ede4] focus:outline-none";

const labelClass =
  "mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#f2ede4]/60";

export default function RegisterForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [hasHandicap, setHasHandicap] = useState(true);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  function close() {
    setIsOpen(false);
    setRole(null);
    setHasHandicap(true);
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      role,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      homeClub: formData.get("homeClub") ?? null,
      handicap: role === "nomad" ? (hasHandicap ? formData.get("handicap") : "No official handicap") : null,
      heardAbout: formData.get("heardAbout"),
    };

    setStatus("submitting");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button type="button" className={pillButton} onClick={() => setIsOpen(true)}>
        Register Now
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-md border border-[#f2ede4]/15 bg-[#0a0a0a] p-8 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 text-[#f2ede4]/50 transition-colors hover:text-[#f2ede4]"
            >
              ✕
            </button>

            {status === "done" ? (
              <div className="py-8 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-[#f2ede4]">Thank you</p>
                <p className="mt-4 text-sm leading-relaxed text-[#f2ede4]/70">
                  Your intent has been registered. We&apos;ll be in touch once vetting begins.
                </p>
              </div>
            ) : !role ? (
              <div className="py-4">
                <p className="mb-8 text-center text-xs uppercase tracking-[0.3em] text-[#f2ede4]/60">
                  Register your intent as
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button type="button" className={`${pillButton} flex-1`} onClick={() => setRole("host")}>
                    Host
                  </button>
                  <button type="button" className={`${pillButton} flex-1`} onClick={() => setRole("nomad")}>
                    Nomad
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <p className="mb-2 text-center text-xs uppercase tracking-[0.3em] text-[#f2ede4]/60">
                  Register as {role === "host" ? "a Host" : "a Nomad"}
                </p>

                <div>
                  <label className={labelClass} htmlFor="name">Name</label>
                  <input className={fieldClass} id="name" name="name" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="email">Email</label>
                  <input className={fieldClass} id="email" name="email" type="email" required />
                </div>

                <div>
                  <label className={labelClass} htmlFor="phone">Phone</label>
                  <input className={fieldClass} id="phone" name="phone" type="tel" required />
                </div>

                {role === "host" && (
                  <div>
                    <label className={labelClass} htmlFor="homeClub">Home club</label>
                    <input className={fieldClass} id="homeClub" name="homeClub" required />
                  </div>
                )}

                {role === "nomad" && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className={labelClass} htmlFor="handicap">Current handicap</label>
                      <button
                        type="button"
                        onClick={() => setHasHandicap((v) => !v)}
                        className="text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/50 underline underline-offset-4 hover:text-[#f2ede4]"
                      >
                        {hasHandicap ? "No official handicap" : "I have a handicap"}
                      </button>
                    </div>
                    {hasHandicap && (
                      <input className={fieldClass} id="handicap" name="handicap" required />
                    )}
                  </div>
                )}

                <div>
                  <label className={labelClass} htmlFor="heardAbout">How did you hear about us</label>
                  <input className={fieldClass} id="heardAbout" name="heardAbout" required />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-400">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button type="submit" className={`${pillButton} mt-3`} disabled={status === "submitting"}>
                  {status === "submitting" ? "Submitting…" : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
