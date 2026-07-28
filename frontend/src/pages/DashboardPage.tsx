export function DashboardPage() {
  // Stretch for later weeks: pull /me/progress from app-backend (completed labs,
  // points, leaderboard rank) once the auth + progress APIs have real session data.
  return (
    <div className="bg-grid-fade min-h-[calc(100vh-57px)]">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          Progress, points, and the leaderboard will show up here once you've completed a few labs.
        </p>
      </div>
    </div>
  );
}
