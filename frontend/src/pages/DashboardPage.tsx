import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard, type Dashboard } from "../api.js";
import { Skeleton } from "../components/Skeleton.js";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-base-850 p-5 shadow-card">
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
      <div
        className="h-full bg-brand-gradient rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  running: "bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20",
  expired: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
  terminated: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
};

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    getDashboard().then(setDashboard).catch(console.error);
  }, []);

  return (
    <div className="bg-grid-fade min-h-[calc(100vh-57px)]">
      <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
        {dashboard ? (
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Welcome back, {dashboard.displayName}
          </h1>
        ) : (
          <Skeleton className="h-9 w-72" />
        )}
        <p className="text-slate-400 mt-2">Your progress across every track, at a glance.</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-10">
        {!dashboard ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
              <StatCard label="Total points" value={dashboard.points} />
              <StatCard
                label="Labs completed"
                value={`${dashboard.labsCompleted} / ${dashboard.totalLabsAvailable}`}
              />
              <StatCard label="Tracks in progress" value={dashboard.tracks.length} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Progress by track</h2>
              {dashboard.tracks.length === 0 ? (
                <p className="text-slate-500 text-sm">No tracks yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dashboard.tracks.map((t, i) => (
                    <Link
                      key={t.slug}
                      to={`/tracks/${t.slug}`}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="group animate-fade-up rounded-2xl border border-white/5 bg-base-850 p-5 shadow-card flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-glow"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-gradient flex items-center justify-center text-lg">
                        {t.icon ?? "📦"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                            {t.name}
                          </h3>
                          <span className="text-xs text-slate-500 shrink-0 ml-3">
                            {t.labsCompleted} / {t.labsTotal} labs
                          </span>
                        </div>
                        <ProgressBar completed={t.labsCompleted} total={t.labsTotal} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Recent sessions</h2>
              {dashboard.recentSessions.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-base-850 p-8 text-center shadow-card">
                  <div className="text-3xl mb-2">🚀</div>
                  <p className="text-slate-400 text-sm">
                    Nothing here yet — start a lab to see your progress.
                  </p>
                  <Link
                    to="/"
                    className="inline-block mt-4 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow"
                  >
                    Browse tracks →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {dashboard.recentSessions.map((s, i) => (
                    <Link
                      key={`${s.labSlug}-${s.startedAt}`}
                      to={`/labs/${s.labSlug}`}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="group animate-fade-up rounded-xl border border-white/5 bg-base-850 px-4 py-3 shadow-card flex items-center justify-between gap-4 transition-all hover:border-indigo-500/30"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors truncate">
                          {s.labTitle}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {s.trackName} · {s.stepsCompleted}/{s.stepsTotal} steps
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[s.status] ?? ""}`}
                      >
                        {s.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
