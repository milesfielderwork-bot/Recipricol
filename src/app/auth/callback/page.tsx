"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function run() {
      const code = new URL(window.location.href).searchParams.get("code");

      // PKCE flow: signInWithOtp issues a ?code= param when the link is
      // opened in the same browser that requested it.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace("/dashboard");
          return;
        }
      }

      // Implicit flow: admin-generated links (and links opened in a
      // different browser than the one that requested them) land here with
      // tokens in the URL hash instead. @supabase/ssr's browser client
      // parses the hash and stores the session automatically on creation
      // (detectSessionInUrl defaults to true) - getSession() just reads
      // back what it already found.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
      } else {
        setFailed(true);
      }
    }

    run();
  }, [router]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-6 py-24">
      <p className="text-sm uppercase tracking-[0.2em] text-[#f2ede4]/70">
        {failed ? (
          <>
            That link is invalid or has expired.{" "}
            <a href="/login" className="underline underline-offset-4 hover:text-[#f2ede4]">
              Try again
            </a>
          </>
        ) : (
          "Signing you in…"
        )}
      </p>
    </main>
  );
}
