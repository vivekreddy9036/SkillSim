import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTracks, type TrackSummary } from "../api.js";
import { Skeleton } from "../components/Skeleton.js";
import {
  DockerIcon,
  LinuxIcon,
  LayersIcon,
  SearchIcon,
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "../components/Icons.js";

export function TracksPage() {
  const [tracks, setTracks] = useState<TrackSummary[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  useEffect(() => {
    listTracks().then(setTracks).catch(console.error);
  }, []);

  const filteredTracks = tracks?.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  function getTrackIcon(slug: string) {
    if (slug.includes("docker")) {
      return <DockerIcon size={24} className="text-blue-400" />;
    }
    if (slug.includes("linux")) {
      return <LinuxIcon size={24} className="text-amber-400" />;
    }
    return <LayersIcon size={24} className="text-blue-400" />;
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-surface-0">
      {/* Enterprise Hero Section */}
      <div className="bg-grid-fade border-b border-line/8 relative">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 mb-4">
            <ZapIcon size={12} />
            <span>Interactive Sandbox Cloud Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Technology Practice Tracks
          </h1>
          <p className="text-ink-dim mt-2.5 max-w-2xl text-sm sm:text-base leading-relaxed">
            Hands-on technical exercises in isolated, disposable Linux containers. Complete practical
            objectives verified directly against live operating system state.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-line/6 text-xs font-mono text-ink-dim">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon size={15} className="text-emerald-400" />
              <span>Runtime Script Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <DockerIcon size={15} className="text-blue-400" />
              <span>Real Ephemeral Sandboxes</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon size={15} className="text-ink-dim" />
              <span>Zero Local Installation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search tracks, technologies, or keywords..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-1 border border-line/8 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink-2 placeholder:text-ink-faint outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
            />
          </div>

          {/* Track Level Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-1 border border-line/6 rounded-xl text-xs font-mono">
            {["all", "beginner", "intermediate"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFilterDifficulty(level)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filterDifficulty === level
                    ? "bg-blue-600 text-white font-medium shadow-sm"
                    : "text-ink-dim hover:text-ink-2"
                }`}
              >
                {level === "all" ? "All Tracks" : level}
              </button>
            ))}
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks === null ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line/6 bg-surface-1 p-6 space-y-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredTracks && filteredTracks.length > 0 ? (
            filteredTracks.map((t: TrackSummary, i: number) => (
              <Link
                key={t.slug}
                to={`/tracks/${t.slug}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group relative animate-fade-up rounded-2xl border border-line/8 bg-surface-1 p-6 shadow-card hover:shadow-cardHover hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Icon & Lab Counter */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-surface-2 border border-line/8 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getTrackIcon(t.slug)}
                    </div>
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-surface-2 text-ink-dim border border-line/6">
                      {t.labCount} Labs Included
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-bold text-ink group-hover:text-blue-300 transition-colors">
                    {t.name}
                  </h2>
                  <p className="text-xs text-ink-dim mt-2 leading-relaxed line-clamp-3">
                    {t.description}
                  </p>
                </div>

                {/* Bottom Footer Info */}
                <div className="mt-6 pt-4 border-t border-line/6 flex items-center justify-between text-xs">
                  <span className="text-ink-faint font-mono">Curriculum Track</span>
                  <div className="flex items-center gap-1.5 font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Enter Track</span>
                    <ArrowRightIcon size={14} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-line/8 bg-surface-2">
              <p className="text-sm font-medium text-ink-dim">No tracks matched your query "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs text-blue-400 hover:underline font-mono"
              >
                Clear search filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
