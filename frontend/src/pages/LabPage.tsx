import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { getLab, startLabSession, type LabDetail } from "../api.js";
import { Terminal } from "../components/Terminal.js";
import { DifficultyBadge } from "../components/DifficultyBadge.js";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  CheckIcon,
  PlayIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ZapIcon,
  ArrowRightIcon,
  GripVerticalIcon,
  CodeIcon,
} from "../components/Icons.js";

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Layout & Split-Pane Resizing State
  const [splitPercent, setSplitPercent] = useState<number>(50); // percentage for left terminal
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live Session Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Draggable Split Pane Handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percent = Math.min(Math.max((relativeX / rect.width) * 100, 25), 75);
      setSplitPercent(percent);
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Lab Session Initiation & WebSocket Lifecycle
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    let ws: WebSocket | undefined;

    (async () => {
      try {
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

        ws.addEventListener("open", () => {
          if (!cancelled) setConnected(true);
        });

        ws.addEventListener("close", () => {
          if (!cancelled) setConnected(false);
        });

        ws.addEventListener("message", (event) => {
          if (typeof event.data !== "string") return;
          try {
            const message = JSON.parse(event.data);
            if (message.type === "step_result") {
              setLastResult(message as StepResult);
              setChecking(false);
              if (message.passed) {
                setCompleted((prev) => new Set(prev).add(message.stepId));
                setCurrentStep((idx) => idx + 1);
              }
            }
          } catch {}
        });
      } catch (err) {
        console.error("Failed to start lab session:", err);
      }
    })();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [slug]);

  function checkStep() {
    if (!socket || socket.readyState !== WebSocket.OPEN || !step) return;
    setChecking(true);
    setLastResult(null);
    socket.send(JSON.stringify({ type: "check_step", stepId: step.id }));
  }

  // Sends command directly to shell
  function runCommandInTerminal(command: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const cleanCmd = command.trim() + "\n";
    socket.send(new TextEncoder().encode(cleanCmd));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text.trim());
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (!lab) {
    return (
      <div className="h-[calc(100vh-57px)] flex flex-col items-center justify-center bg-base-950 text-slate-400">
        <div className="relative mb-4">
          <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Provisioning Ephemeral Sandbox Container...</p>
        <p className="text-xs text-slate-500 mt-1 font-mono">Allocating CPU, memory, and PTY socket</p>
      </div>
    );
  }

  const step = lab.steps[currentStep];
  const isAllComplete = currentStep >= lab.steps.length;

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col bg-base-950 select-none">
      {/* Top Breadcrumb & Control Bar */}
      <div className="h-12 border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between bg-[#0a0d16] shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/tracks/${lab.track.slug}`}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>{lab.track.name}</span>
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-semibold text-slate-200 truncate">{lab.title}</span>
          <DifficultyBadge difficulty={lab.difficulty} />
        </div>

        {/* Right Session Stats & Status */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Live Stopwatch Timer */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-white/[0.06] text-slate-400">
            <ClockIcon size={13} className="text-blue-400" />
            <span className="text-slate-200 font-semibold">{formatTime(secondsElapsed)}</span>
            <span className="text-slate-600">/ {lab.durationMinutes}m</span>
          </div>

          {/* Stepper Summary */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-white/[0.06] text-slate-400">
            <ShieldCheckIcon size={13} className="text-emerald-400" />
            <span className="text-slate-200 font-semibold">
              Step {Math.min(currentStep + 1, lab.steps.length)} of {lab.steps.length}
            </span>
          </div>

          {/* WebSocket Connection Pill */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/[0.06]">
            <span
              className={`h-2 w-2 rounded-full ${
                connected
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-[11px] text-slate-300 font-medium">
              {connected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace (Split-Pane with Resizer) */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex relative overflow-hidden bg-base-950"
        style={{ cursor: isDragging ? "col-resize" : "default" }}
      >
        {/* Left: Terminal Shell */}
        <div
          className="h-full p-2.5 flex flex-col min-w-[280px]"
          style={{ width: isMaximized ? "100%" : `${splitPercent}%` }}
        >
          <Terminal
            socket={socket}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
            containerInfo={lab.slug}
          />
        </div>

        {/* Draggable Divider (Hidden if Maximized) */}
        {!isMaximized && (
          <div
            onMouseDown={handleMouseDown}
            className="w-1.5 hover:w-2 bg-[#0c101a] hover:bg-blue-500/50 active:bg-blue-500 transition-all cursor-col-resize flex items-center justify-center border-x border-white/[0.05] relative group select-none shrink-0"
            title="Drag to resize console"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVerticalIcon size={12} className="text-slate-300" />
            </div>
          </div>
        )}

        {/* Right: Step Instructions & Verification Console (Hidden if Maximized) */}
        {!isMaximized && (
          <div
            className="h-full flex-1 flex flex-col min-w-[320px] bg-base-900 border-l border-white/[0.06] overflow-hidden"
            style={{ width: `${100 - splitPercent}%` }}
          >
            {/* Step Selection Header Stepper */}
            <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0c101a] shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Task Progression
                </span>
                <span className="text-xs text-blue-400 font-mono font-medium">
                  {completed.size} / {lab.steps.length} Completed
                </span>
              </div>

              {/* Step Navigation Pills */}
              <div className="flex gap-1.5">
                {lab.steps.map((s, index) => {
                  const isDone = completed.has(s.id);
                  const isCurrent = index === currentStep;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-mono font-medium transition-all ${
                        isDone
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : isCurrent
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-glow"
                            : "bg-slate-800/40 text-slate-500 border border-white/[0.04] hover:bg-slate-800/80 hover:text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckIcon size={12} className="text-emerald-400" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {isAllComplete ? (
                /* Lab Completion Banner */
                <div className="animate-fade-up rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-8 text-center max-w-lg mx-auto my-8">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                    <CheckCircleIcon size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">Lab Completed Successfully</h2>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    All tasks have been verified by the runtime engine. Progress and performance points
                    have been persisted to your student profile.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                    <div className="bg-slate-900/80 border border-white/[0.06] rounded-xl p-3">
                      <div className="text-xs text-slate-500 font-mono">Points Awarded</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">+50 XP</div>
                    </div>
                    <div className="bg-slate-900/80 border border-white/[0.06] rounded-xl p-3">
                      <div className="text-xs text-slate-500 font-mono">Time Elapsed</div>
                      <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
                        {formatTime(secondsElapsed)}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/tracks/${lab.track.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 text-sm transition-all shadow-glow"
                  >
                    <span>Return to {lab.track.name} Track</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              ) : (
                /* Step Instruction Card */
                <div key={step.id} className="animate-fade-up max-w-2xl">
                  {/* Step Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Task {step.stepNumber}
                    </span>
                    <h2 className="text-lg font-bold text-slate-100">{step.title}</h2>
                  </div>

                  {/* Rendered Markdown Instructions with Code Runner */}
                  <div className="lesson-markdown">
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        pre({ children }) {
                          return <div className="relative group my-3">{children}</div>;
                        },
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeText = String(children).replace(/\n$/, "");
                          const isInline = !match && !String(children).includes("\n");

                          if (isInline) {
                            return <code className={className} {...props}>{children}</code>;
                          }

                          return (
                            <div className="relative bg-[#080b12] rounded-xl border border-white/[0.08] overflow-hidden my-3 shadow-card">
                              {/* Code Block Header */}
                              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e121d] border-b border-white/[0.06] text-xs font-mono text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <CodeIcon size={12} className="text-blue-400" />
                                  {match ? match[1] : "bash"}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {/* Insert/Run in Terminal Button */}
                                  <button
                                    type="button"
                                    onClick={() => runCommandInTerminal(codeText)}
                                    title="Run command in terminal"
                                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 hover:bg-blue-500/30 transition-colors"
                                  >
                                    <PlayIcon size={10} />
                                    <span>Run in Terminal</span>
                                  </button>
                                  {/* Copy Button */}
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(codeText)}
                                    title="Copy to clipboard"
                                    className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                                  >
                                    {copiedCode === codeText ? (
                                      <CheckIcon size={13} className="text-emerald-400" />
                                    ) : (
                                      <CopyIcon size={13} />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3.5 text-xs font-mono overflow-x-auto text-slate-200">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {step.contentMarkdown}
                    </ReactMarkdown>
                  </div>

                  {/* Collapsible Hint Drawer */}
                  <div className="mt-5 border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c101a]">
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircleIcon size={14} className="text-amber-400" />
                        <span>Need a hint or troubleshooting guide?</span>
                      </span>
                      {showHint ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
                    </button>
                    {showHint && (
                      <div className="px-4 py-3 border-t border-white/[0.06] text-xs text-slate-300 bg-slate-900/60 leading-relaxed font-mono">
                        Verify your syntax with <code className="text-blue-300">docker ps</code> or inspect container logs with{" "}
                        <code className="text-blue-300">docker logs &lt;name&gt;</code> before running the test script.
                      </div>
                    )}
                  </div>

                  {/* Verification Action Bar */}
                  <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={checkStep}
                      disabled={checking || !connected}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 text-sm transition-all shadow-glow hover:scale-[1.01]"
                    >
                      {checking ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          <span>Executing runtime check...</span>
                        </>
                      ) : (
                        <>
                          <ZapIcon size={15} />
                          <span>Check my work</span>
                        </>
                      )}
                    </button>

                    {completed.has(step.id) && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
                        <CheckIcon size={14} /> Task Passed (+10 pts)
                      </span>
                    )}
                  </div>

                  {/* Verification Feedback Alert */}
                  {lastResult && !checking && (
                    <div
                      className={`mt-4 rounded-xl border p-4 text-xs font-mono leading-relaxed animate-fade-up ${
                        lastResult.passed
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        {lastResult.passed ? (
                          <>
                            <CheckCircleIcon size={15} className="text-emerald-400" />
                            <span>Verification Passed! Proceed to next step.</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-rose-400" />
                            <span>Verification Incomplete: Requirements not satisfied.</span>
                          </>
                        )}
                      </div>
                      {lastResult.message && (
                        <pre className="mt-2 p-2.5 rounded bg-black/30 border border-white/[0.05] whitespace-pre-wrap text-[11px] text-slate-300">
                          {lastResult.message}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
