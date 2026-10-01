function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={`absolute h-3.5 w-3.5 border-[#f2ede4]/50 ${className}`}
      aria-hidden
    />
  );
}

export default function TilePhoto({
  seed,
  children,
}: {
  seed: string;
  children?: React.ReactNode;
}) {
  const h = hashSeed(seed);
  const posX = h % 100;
  const posY = (h >> 8) % 100;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#f2ede4]/15">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "320% 320%",
          backgroundPosition: `${posX}% ${posY}%`,
          filter: "saturate(0.9)",
        }}
      />
      <div className="absolute inset-0 bg-black/15" />

      <Corner className="left-1.5 top-1.5 border-l border-t" />
      <Corner className="right-1.5 top-1.5 border-r border-t" />
      <Corner className="bottom-1.5 left-1.5 border-b border-l" />
      <Corner className="bottom-1.5 right-1.5 border-b border-r" />

      {children}
    </div>
  );
}
