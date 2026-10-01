import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveToken, signup } from "../api.js";
import { TerminalIcon, ShieldCheckIcon } from "../components/Icons.js";

function KeyIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } =
        mode === "signup"
          ? await signup(email, password, displayName)
          : await login(email, password);
      saveToken(token);
      navigate("/");
    } catch {
      setError(
        mode === "signup"
          ? "Unable to register — email address may already be in use."
          : "Invalid authentication credentials. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-grid-fade flex flex-col items-center justify-center px-4 py-12 select-none">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 shadow-glow">
            <TerminalIcon size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            SkillSim Platform
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Interactive Hands-On Sandbox Environment
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c101a] shadow-card overflow-hidden">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-[#080b12] border-b border-white/[0.06] text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-2 rounded-lg font-medium transition-colors ${
                mode === "login"
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-2 rounded-lg font-medium transition-colors ${
                mode === "signup"
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Miller"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-900 border border-white/[0.08] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Academic / Student Email
              </label>
              <input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900 border border-white/[0.08] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl bg-slate-900 border border-white/[0.08] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 text-xs transition-all shadow-glow flex items-center justify-center gap-2 font-mono"
            >
              {submitting ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  <KeyIcon size={14} />
                  <span>{mode === "login" ? "Authenticate Session" : "Create Student Account"}</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="px-6 py-3 bg-[#080b12] border-t border-white/[0.06] flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <ShieldCheckIcon size={12} className="text-emerald-400 shrink-0" />
            <span>Encrypted with bcrypt (cost 10) & scoped JWTs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
