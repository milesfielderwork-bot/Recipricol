export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center bg-black/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#f2ede4] backdrop-blur-sm">
      [&nbsp;{children}&nbsp;]
    </span>
  );
}
