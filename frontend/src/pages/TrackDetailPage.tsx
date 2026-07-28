import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTrack, type TrackDetail } from "../api.js";
import { DifficultyBadge } from "../components/DifficultyBadge.js";
import { Skeleton } from "../components/Skeleton.js";

export function TrackDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [track, setTrack] = useState<TrackDetail | null>(null);

  useEffect(() => {
    setTrack(null);
    if (slug) getTrack(slug).then(setTrack).catch(console.error);
  }, [slug]);

  return (
    <div>
      <div className="bg-grid-fade border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Tracks
          </Link>
          {track ? (
            <>
              <div className="flex items-center gap-3 mt-3">
                <span className="h-10 w-10 rounded-xl bg-brand-gradient flex items-center justify-center text-lg">
                  {track.icon ?? "📦"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                  {track.name}
                </h1>
              </div>
              <p className="text-slate-400 mt-3 max-w-xl leading-relaxed">{track.description}</p>
            </>
          ) : (
            <Skeleton className="h-9 w-64 mt-3" />
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-3">
          {track === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            : track.labs.map((lab, i) => (
                <Link
                  key={lab.slug}
                  to={`/labs/${lab.slug}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group animate-fade-up rounded-2xl border border-white/5 bg-base-850 p-5 shadow-card flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-glow"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <DifficultyBadge difficulty={lab.difficulty} />
                      <span className="text-xs text-slate-500">
                        {lab.durationMinutes} min · Interactive
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                      {lab.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{lab.description}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {lab.tags.map((tag) => (
                        <span key={tag} className="text-xs text-slate-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform group-hover:scale-105">
                    Start Lab →
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
