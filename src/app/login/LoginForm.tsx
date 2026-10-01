"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#f2ede4]";

const fieldClass =
  "w-full border-0 border-b border-[#f2ede4]/25 bg-transparent py-2 text-sm tracking-wide text-[#f2ede4] placeholder:text-[#f2ede4]/40 focus:border-[#f2ede4] focus:outline-none";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[#f2ede4]">Check your email</p>
        <p className="mt-4 text-sm leading-relaxed text-[#f2ede4]/70">
          We&apos;ve sent a sign-in link to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
      <input
        className={fieldClass}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {status === "error" && (
        <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
      )}

      <button type="submit" className={pillButton} disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
