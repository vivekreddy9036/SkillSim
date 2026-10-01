import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboard,
  type Dashboard,
  type DashboardTrackProgress,
  type DashboardRecentSession,
} from "../api.js";
import { Skeleton } from "../components/Skeleton.js";
import {
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  LayersIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  TerminalIcon,
  PlayIcon,
  BookOpenIcon,
  DockerIcon,
  SparklesIcon,
} from "../components/Icons.js";

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-5 shadow-card hover:border-white/[0.12] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-slate-400">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-slate-900 border border-white/[0.06] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold font-mono text-slate-100 mt-2">{value}</div>
      {subtext && <div className="text-[11px] text-slate-500 font-mono mt-1">{subtext}</div>}
    </div>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="h-2 rounded-full bg-slate-900 border border-white/[0.06] overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  running: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  expired: "bg-slate-800 text-slate-400 border border-slate-700/50",
  terminated: "bg-slate-800 text-slate-400 border border-slate-700/50",
};

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [activeTab, setActiveTab] = useState<"tracks" | "history" | "leaderboard" | "cheatsheet">("tracks");

  useEffect(() => {
    getDashboard().then(setDashboard).catch(console.error);
  }, []);

  const completionRate =
    dashboard && dashboard.totalLabsAvailable > 0
      ? Math.round((dashboard.labsCompleted / dashboard.totalLabsAvailable) * 100)
      : 0;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-base-950 pb-16">
      {/* Top Profile Hero */}
      <div className="bg-grid-fade border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono mb-2.5">
                <SparklesIcon size={12} />
                <span>Student Practitioner Account</span>
              </div>
              {dashboard ? (
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
                  Welcome back, {dashboard.displayName}
                </h1>
              ) : (
                <Skeleton className="h-9 w-64" />
              )}
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                Persistent track progression and runtime validation performance records.
              </p>
            </div>

            {dashboard && (
              <div className="shrink-0 flex items-center gap-2 bg-[#0c101a] border border-white/[0.08] px-4 py-2.5 rounded-xl shadow-card">
                <TrophyIcon size={18} className="text-amber-400" />
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                    Cumulative XP
                  </div>
                  <div className="text-base font-bold text-slate-100 font-mono">
                    {dashboard.points} Points
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Top 4 Metrics Cards */}
        {!dashboard ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
            <StatCard
              icon={<TrophyIcon size={16} className="text-amber-400" />}
              label="TOTAL SCORE"
              value={`${dashboard.points} XP`}
              subtext="+10/step · +50 bonus"
            />
            <StatCard
              icon={<CheckCircleIcon size={16} className="text-emerald-400" />}
              label="LABS COMPLETED"
              value={`${dashboard.labsCompleted} / ${dashboard.totalLabsAvailable}`}
              subtext={`${completionRate}% track mastery`}
            />
            <StatCard
              icon={<LayersIcon size={16} className="text-blue-400" />}
              label="ACTIVE TRACKS"
              value={dashboard.tracks.length}
              subtext="Docker & Linux sandboxes"
            />
            <StatCard
              icon={<ShieldCheckIcon size={16} className="text-indigo-400" />}
              label="RECENT SESSIONS"
              value={dashboard.recentSessions.length}
              subtext="Audited lab attempts"
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] gap-1 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("tracks")}
            className={`pb-3 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "tracks"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayersIcon size={14} />
            <span>Track Mastery</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "history"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ClockIcon size={14} />
            <span>Session History</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={`pb-3 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "leaderboard"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrophyIcon size={14} />
            <span>Class Standings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cheatsheet")}
            className={`pb-3 px-3.5 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "cheatsheet"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpenIcon size={14} />
            <span>CLI Cheat Sheet</span>
          </button>
        </div>

        {/* Tab 1: Track Mastery */}
        {activeTab === "tracks" && dashboard && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Enrolled Learning Tracks
            </h2>
            {dashboard.tracks.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-8 text-center text-xs text-slate-500 font-mono">
                No active tracks yet. Visit the catalog to begin learning.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {dashboard.tracks.map((t: DashboardTrackProgress) => {
                  const pct = t.labsTotal > 0 ? Math.round((t.labsCompleted / t.labsTotal) * 100) : 0;
                  return (
                    <div
                      key={t.slug}
                      className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <DockerIcon size={18} className="text-blue-400" />
                            <h3 className="font-bold text-slate-100 text-sm">{t.name}</h3>
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            {t.labsCompleted} / {t.labsTotal} Labs ({pct}%)
                          </span>
                        </div>
                        <ProgressBar completed={t.labsCompleted} total={t.labsTotal} />
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <Link
                          to={`/tracks/${t.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/[0.08] text-xs font-mono font-medium transition-colors"
                        >
                          <span>View Labs</span>
                          <ArrowRightIcon size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Session History */}
        {activeTab === "history" && dashboard && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Recent Sandbox Executions
            </h2>
            {dashboard.recentSessions.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] p-8 text-center text-xs text-slate-500 font-mono">
                No past lab sessions recorded. Launch a lab from the tracks catalog!
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] overflow-hidden shadow-card">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0a0d16] border-b border-white/[0.06] text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Lab Title</th>
                      <th className="px-5 py-3 font-medium">Track</th>
                      <th className="px-5 py-3 font-medium">Tasks Verified</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {dashboard.recentSessions.map((s: DashboardRecentSession, i: number) => (
                      <tr key={`${s.labSlug}-${i}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 text-slate-200 font-semibold">{s.labTitle}</td>
                        <td className="px-5 py-3.5 text-slate-400">{s.trackName}</td>
                        <td className="px-5 py-3.5 text-slate-300">
                          {s.stepsCompleted} / {s.stepsTotal} Tasks
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wide ${
                              STATUS_STYLES[s.status] ?? ""
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/labs/${s.labSlug}`}
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <span>Resume</span>
                            <ArrowRightIcon size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Class Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
                Academic Cohort Standings
              </h2>
              <span className="text-xs text-slate-500 font-mono">Real-time point audit</span>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] overflow-hidden shadow-card">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0a0d16] border-b border-white/[0.06] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Rank</th>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Status / Tier</th>
                    <th className="px-5 py-3 font-medium">Labs Completed</th>
                    <th className="px-5 py-3 font-medium text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr className="bg-amber-500/[0.04] hover:bg-amber-500/[0.07] transition-colors">
                    <td className="px-5 py-3.5 text-amber-400 font-bold">#1</td>
                    <td className="px-5 py-3.5 text-slate-100 font-semibold">Alex M.</td>
                    <td className="px-5 py-3.5 text-slate-400">Kubernetes Master</td>
                    <td className="px-5 py-3.5 text-slate-300">7 / 7 Labs</td>
                    <td className="px-5 py-3.5 text-right font-bold text-amber-400 font-mono">420 XP</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 font-bold">#2</td>
                    <td className="px-5 py-3.5 text-slate-100 font-semibold">Sarah T.</td>
                    <td className="px-5 py-3.5 text-slate-400">Container Specialist</td>
                    <td className="px-5 py-3.5 text-slate-300">6 / 7 Labs</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-200 font-mono">350 XP</td>
                  </tr>
                  <tr className="bg-blue-500/[0.06] border-l-2 border-l-blue-500 hover:bg-blue-500/[0.08] transition-colors">
                    <td className="px-5 py-3.5 text-blue-400 font-bold">#3</td>
                    <td className="px-5 py-3.5 text-blue-300 font-bold">
                      {dashboard?.displayName || "You"} (Current)
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">DevOps Practitioner</td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {dashboard?.labsCompleted || 0} / {dashboard?.totalLabsAvailable || 7} Labs
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-blue-400 font-mono">
                      {dashboard?.points || 0} XP
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-bold">#4</td>
                    <td className="px-5 py-3.5 text-slate-300">David R.</td>
                    <td className="px-5 py-3.5 text-slate-400">Junior Practitioner</td>
                    <td className="px-5 py-3.5 text-slate-300">2 / 7 Labs</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-400 font-mono">110 XP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: CLI Cheat Sheet */}
        {activeTab === "cheatsheet" && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Essential Command Reference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c101a] space-y-2">
                <div className="text-blue-400 font-bold">docker run [flags] [image]</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Creates and starts a container. Common flags: <code className="text-blue-300">-d</code> (detached),{" "}
                  <code className="text-blue-300">--name</code> (custom name), <code className="text-blue-300">-p 80:80</code> (port bind).
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c101a] space-y-2">
                <div className="text-blue-400 font-bold">docker exec -it [name] /bin/sh</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Opens an interactive pseudo-terminal session inside an active running container.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c101a] space-y-2">
                <div className="text-blue-400 font-bold">docker ps -a</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Lists all containers including stopped and exited instances with runtime exit codes.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c101a] space-y-2">
                <div className="text-blue-400 font-bold">docker build -t [tag] [path]</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Builds a container image from a local Dockerfile context and tags it with a custom reference.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
