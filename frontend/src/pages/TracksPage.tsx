import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTracks, type TrackSummary } from "../api.js";
import { Skeleton } from "../components/Skeleton.js";

export function TracksPage() {
  const [tracks, setTracks] = useState<TrackSummary[] | null>(null);

  useEffect(() => {
    listTracks().then(setTracks).catch(console.error);
  }, []);

  return (
    <div>
      <div className="bg-grid-fade border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-14">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Learning Tracks
          </h1>
          <p className="text-slate-400 mt-3 max-w-lg">
            Hands-on labs with a real terminal, organized by technology. Learn by doing,
            not by watching.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)
            : tracks.map((t, i) => (
                <Link
                  key={t.slug}
                  to={`/tracks/${t.slug}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group relative animate-fade-up rounded-2xl border border-white/5 bg-base-850 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-glow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-brand-gradient/90 flex items-center justify-center text-xl">
                      {t.icon ?? "📦"}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{t.labCount} labs</span>
                  </div>
                  <h2 className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                    {t.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {t.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore track
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </Link>
              ))}
        </div>

        {tracks?.length === 0 && (
          <p className="text-slate-500 text-sm mt-4">
            No tracks yet — run <code className="text-indigo-400">npm run sync-labs</code> to load lab
            content.
          </p>
        )}
      </div>
    </div>
  );
}
