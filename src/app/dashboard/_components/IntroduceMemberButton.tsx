"use client";

import { useState } from "react";

const pillButton =
  "inline-flex items-center justify-center rounded-full border border-[#f2ede4]/60 px-8 py-3 text-xs uppercase tracking-[0.3em] text-[#f2ede4] transition-colors duration-300 hover:bg-[#f2ede4] hover:text-black";

export default function IntroduceMemberButton({
  children,
}: {
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className={pillButton} onClick={() => setOpen(true)}>
        Introduce New Member
      </button>
    );
  }

  return (
    <div className="flex max-w-sm flex-col gap-5">
      {children(() => setOpen(false))}
      <button
        type="button"
        className="self-start text-[10px] uppercase tracking-[0.2em] text-[#f2ede4]/40 hover:text-[#f2ede4]/70"
        onClick={() => setOpen(false)}
      >
        Cancel
      </button>
    </div>
  );
}
