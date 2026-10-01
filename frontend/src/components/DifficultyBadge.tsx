const STYLES: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const DOT: Record<string, string> = {
  beginner: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]",
  intermediate: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]",
  advanced: "bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.5)]",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const norm = difficulty?.toLowerCase() || "beginner";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-wide uppercase font-mono border ${
        STYLES[norm] ?? STYLES.beginner
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[norm] ?? DOT.beginner}`} />
      {norm}
    </span>
  );
}
