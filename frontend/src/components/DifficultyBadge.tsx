const STYLES: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20",
};

const DOT: Record<string, string> = {
  beginner: "bg-emerald-400",
  intermediate: "bg-amber-400",
  advanced: "bg-rose-400",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STYLES[difficulty] ?? ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[difficulty] ?? "bg-slate-400"}`} />
      {difficulty}
    </span>
  );
}
