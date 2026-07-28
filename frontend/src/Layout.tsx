import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "./api.js";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        active ? "text-slate-100" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
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
    <div className="min-h-screen bg-base-950">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-base-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-7 w-7 rounded-lg bg-brand-gradient shadow-glow flex items-center justify-center text-xs font-bold text-white">
              S
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-slate-100">SkillSim</span>
          </Link>
          <nav className="flex gap-6 flex-1">
            <NavLink to="/">Tracks</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </nav>
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
