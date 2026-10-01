import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTrack, type TrackDetail, type LabCard } from "../api.js";
import { DifficultyBadge } from "../components/DifficultyBadge.js";
import { Skeleton } from "../components/Skeleton.js";
import {
  DockerIcon,
  LinuxIcon,
  LayersIcon,
  ClockIcon,
  PlayIcon,
  SearchIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
} from "../components/Icons.js";

export function TrackDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [labSearch, setLabSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    setTrack(null);
    if (slug) {
      getTrack(slug).then(setTrack).catch(console.error);
    }
  }, [slug]);

  function getTrackIcon(trackSlug: string) {
    if (trackSlug.includes("docker")) return <DockerIcon size={26} className="text-blue-400" />;
    if (trackSlug.includes("linux")) return <LinuxIcon size={26} className="text-amber-400" />;
    return <LayersIcon size={26} className="text-blue-400" />;
  }

  const totalMinutes = track?.labs.reduce((acc, l) => acc + l.durationMinutes, 0) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const filteredLabs = track?.labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(labSearch.toLowerCase()) ||
      lab.description.toLowerCase().includes(labSearch.toLowerCase()) ||
      lab.tags.some((t) => t.toLowerCase().includes(labSearch.toLowerCase()));

    const matchesDifficulty =
      difficultyFilter === "all" || lab.difficulty.toLowerCase() === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-[calc(100vh-57px)] bg-surface-0 pb-16">
      {/* Top Track Header Banner */}
      <div className="bg-grid-fade border-b border-line/8">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-ink-dim hover:text-ink-2 transition-colors mb-5"
          >
            <ChevronLeftIcon size={14} />
            <span>Back to Tracks</span>
          </Link>

          {track ? (
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="h-12 w-12 rounded-xl bg-surface-2 border border-line/8 flex items-center justify-center">
                  {getTrackIcon(track.slug)}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                    {track.name} Track
                  </h1>
                  <span className="text-xs font-mono text-ink-faint">
                    Hands-On Interactive Laboratory Series
                  </span>
                </div>
              </div>

              <p className="text-ink-2 text-sm max-w-2xl leading-relaxed mt-2">
                {track.description}
              </p>

              {/* Track Metadata Stats */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-5 border-t border-line/6 text-xs font-mono text-ink-dim">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-ink-2 font-semibold">{track.labs.length} Labs</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon size={14} className="text-ink-dim" />
                  <span>
                    Est. Duration: {hours > 0 ? `${hours}h ` : ""}
                    {remainingMins > 0 ? `${remainingMins}m` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={14} className="text-emerald-400" />
                  <span>Automated Container Verification</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          )}
        </div>
      </div>

      {/* Lab List & Search Section */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Filter labs by title or tag..."
              value={labSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabSearch(e.target.value)}
              className="w-full bg-surface-1 border border-line/8 rounded-lg pl-9 pr-3 py-2 text-xs text-ink-2 placeholder:text-ink-faint outline-none focus:border-blue-500/50 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-1 border border-line/6 rounded-lg p-1 text-xs font-mono">
            {["all", "beginner", "intermediate", "advanced"].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  difficultyFilter === diff
                    ? "bg-surface-3 text-ink font-medium"
                    : "text-ink-faint hover:text-ink-2"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Labs List */}
        <div className="flex flex-col gap-3.5">
          {track === null ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : filteredLabs && filteredLabs.length > 0 ? (
            filteredLabs.map((lab: LabCard, i: number) => (
              <div
                key={lab.slug}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group animate-fade-up rounded-2xl border border-line/8 bg-surface-1 p-5 shadow-card hover:border-blue-500/40 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="text-[11px] font-mono font-medium text-ink-faint bg-surface-2 px-2 py-0.5 rounded border border-line/4">
                      Lab {String(i + 1).padStart(2, "0")}
                    </span>
                    <DifficultyBadge difficulty={lab.difficulty} />
                    <span className="text-xs text-ink-faint font-mono flex items-center gap-1">
                      <ClockIcon size={12} />
                      {lab.durationMinutes} min
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-ink group-hover:text-blue-300 transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-ink-dim mt-1 leading-relaxed max-w-2xl">
                    {lab.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {lab.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-2/90 text-ink-dim border border-line/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center sm:self-center">
                  <Link
                    to={`/labs/${lab.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 shadow-glow transition-all hover:scale-[1.02]"
                  >
                    <PlayIcon size={12} />
                    <span>Launch Sandbox</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center rounded-2xl border border-dashed border-line/8 bg-surface-2 text-xs text-ink-faint font-mono">
              No labs match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
