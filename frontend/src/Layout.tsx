import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken, isAuthed } from "./api.js";
import {
  TerminalIcon,
  LayersIcon,
  TrophyIcon,
  LogOutIcon,
  ShieldCheckIcon,
} from "./components/Icons.js";
import { ThemeToggle } from "./components/ThemeToggle.js";

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`text-xs font-mono font-medium transition-all px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
        active
          ? "bg-surface-3/80 text-blue-400 border border-line/8"
          : "text-ink-dim hover:text-ink-2 hover:bg-surface-3/40"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export function Layout() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Top Global Header Bar */}
      <header className="sticky top-0 z-40 border-b border-line/8 bg-surface-0/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-glow">
                <TerminalIcon size={16} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-ink">
                  SkillSim
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Labs
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/" icon={<LayersIcon size={14} />}>
                Tracks
              </NavLink>
              <NavLink to="/dashboard" icon={<TrophyIcon size={14} />}>
                Dashboard
              </NavLink>
            </nav>
          </div>

          {/* Right Status & Profile */}
          <div className="flex items-center gap-3">
            {/* Host Engine Status */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-ink-dim bg-surface-2/90 px-2.5 py-1 rounded-md border border-line/6">
              <ShieldCheckIcon size={13} className="text-emerald-400" />
              <span>Docker Daemon: Active</span>
            </div>

            <ThemeToggle />

            {/* Log Out */}
            {isAuthed() && (
              <button
                type="button"
                onClick={logout}
                title="Log out of session"
                className="flex items-center gap-1.5 text-xs font-mono text-ink-dim hover:text-ink-2 transition-colors px-2 py-1 rounded hover:bg-surface-3/40"
              >
                <LogOutIcon size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
