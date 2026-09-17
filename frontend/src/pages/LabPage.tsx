import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { getLab, startLabSession, type LabDetail } from "../api.js";
import { Terminal } from "../components/Terminal.js";
import { DifficultyBadge } from "../components/DifficultyBadge.js";

const TERM_WS_BASE = import.meta.env.VITE_TERMINAL_WS_BASE ?? "ws://localhost:4100";

type StepResult = { stepId: string; passed: boolean; message: string };

export function LabPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lab, setLab] = useState<LabDetail | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<StepResult | null>(null);

  useEffect(() => {
    if (!slug) return;
    // React 18 StrictMode double-invokes effects in dev: cleanup for the first
    // invocation runs before this IIFE has even created a WebSocket yet (it's
    // still awaiting getLab/startLabSession), so a plain `ws?.close()` cleanup
    // can't cancel it — it would go on to open a second real connection and
    // spawn a second real sandbox container. `cancelled` makes the abandoned
    // invocation a no-op instead: if it later creates a socket, it's closed
    // immediately without ever touching component state.
    let cancelled = false;
    let ws: WebSocket | undefined;

    (async () => {
      const labDetail = await getLab(slug);
      if (cancelled) return;
      setLab(labDetail);

      const { attachToken } = await startLabSession(slug);
      if (cancelled) return;

      ws = new WebSocket(`${TERM_WS_BASE}/term?token=${encodeURIComponent(attachToken)}`);
      if (cancelled) {
        ws.close();
        return;
      }
      setSocket(ws);
      ws.addEventListener("open", () => setConnected(true));
      ws.addEventListener("close", () => setConnected(false));

      ws.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;
        const message = JSON.parse(event.data);
        if (message.type === "step_result") {
          setLastResult(message as StepResult);
          setChecking(false);
          if (message.passed) {
            setCompleted((prev) => new Set(prev).add(message.stepId));
            setCurrentStep((idx) => idx + 1);
          }
        }
      });
    })();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [slug]);

  if (!lab) {
    return (
      <div className="h-[calc(100vh-57px)] flex items-center justify-center text-slate-500 text-sm">
        <span className="h-4 w-4 rounded-full border-2 border-slate-700 border-t-indigo-400 animate-spin mr-3" />
        Starting lab…
      </div>
    );
  }

  const step = lab.steps[currentStep];
  const done = currentStep >= lab.steps.length;

  function checkStep() {
    if (!socket || socket.readyState !== WebSocket.OPEN || !step) return;
    setChecking(true);
    setLastResult(null);
    socket.send(JSON.stringify({ type: "check_step", stepId: step.id }));
  }

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">
      <div className="border-b border-white/5 px-6 py-2.5 flex items-center gap-3 bg-base-900/60 shrink-0">
        <Link
          to={`/tracks/${lab.track.slug}`}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← {lab.track.name}
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-sm font-medium text-slate-200">{lab.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
          />
          <span className="text-xs text-slate-500">{connected ? "Connected" : "Connecting…"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 flex-1 min-h-0">
        <div className="flex flex-col min-h-0 border-r border-white/5 bg-base-900">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-xs text-slate-500 font-mono">sandbox — {lab.slug}</span>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <Terminal socket={socket} />
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="max-w-xl mx-auto px-8 py-8">
            <div className="flex items-center gap-2 mb-3">
              <DifficultyBadge difficulty={lab.difficulty} />
              <span className="text-xs text-slate-500">
                Step {Math.min(currentStep + 1, lab.steps.length)} / {lab.steps.length}
              </span>
            </div>

            <div className="flex gap-1.5 mb-8">
              {lab.steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    completed.has(s.id)
                      ? "bg-emerald-500"
                      : i === currentStep
                        ? "bg-indigo-500"
                        : "bg-base-800"
                  }`}
                />
              ))}
            </div>

            {done ? (
              <div className="animate-fade-up rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="font-semibold text-emerald-400 text-lg">Lab complete</h2>
                <p className="text-sm text-slate-400 mt-1">Nice work — progress and points are saved.</p>
                <Link
                  to={`/tracks/${lab.track.slug}`}
                  className="inline-block mt-4 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow"
                >
                  Back to {lab.track.name}
                </Link>
              </div>
            ) : (
              <div key={step.id} className="animate-fade-up">
                <h2 className="font-semibold text-slate-100 text-lg mb-3">{step.title}</h2>
                <div className="lesson-markdown">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{step.contentMarkdown}</ReactMarkdown>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={checkStep}
                    disabled={checking || !connected}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:enabled:scale-[1.02]"
                  >
                    {checking && (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    )}
                    {checking ? "Checking…" : "Check my work"}
                  </button>
                  {lastResult && !lastResult.passed && !checking && (
                    <span className="text-sm text-rose-400">Not quite yet — try again.</span>
                  )}
                </div>

                {lastResult && !lastResult.passed && lastResult.message && (
                  <pre className="mt-3 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-300 text-xs p-3 whitespace-pre-wrap font-mono">
                    {lastResult.message}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
