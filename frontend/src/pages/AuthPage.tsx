import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveToken, signup } from "../api.js";

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
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
      const { token } = mode === "signup" ? await signup(email, password, displayName) : await login(email, password);
      saveToken(token);
      navigate("/");
    } catch {
      setError(mode === "signup" ? "Could not sign up — email may already be registered." : "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-grid-fade flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <span className="h-12 w-12 rounded-2xl bg-brand-gradient shadow-glow flex items-center justify-center text-lg font-bold text-white mb-3">
            S
          </span>
          <h1 className="text-xl font-semibold text-slate-100">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "signup" ? "Start learning with hands-on labs" : "Log in to continue"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/5 bg-base-850 shadow-card p-6 flex flex-col gap-3"
        >
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="rounded-lg bg-base-900 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg bg-base-900 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="rounded-lg bg-base-900 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white shadow-glow disabled:opacity-50 mt-1 transition-transform hover:enabled:scale-[1.01]"
          >
            {submitting ? "…" : mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="w-full text-center text-sm text-slate-500 hover:text-slate-300 mt-5 transition-colors"
        >
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
