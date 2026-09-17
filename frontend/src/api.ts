const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
const TOKEN_KEY = "skillsim_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const isAuthed = () => Boolean(getToken());
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...authHeaders(), ...init?.headers },
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  return res.json();
}

export interface TrackSummary {
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  labCount: number;
}

export interface LabCard {
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  tags: string[];
}

export interface TrackDetail extends Omit<TrackSummary, "labCount"> {
  labs: LabCard[];
}

export interface LabStep {
  id: string;
  stepNumber: number;
  title: string;
  contentMarkdown: string;
}

export interface LabDetail extends LabCard {
  track: { slug: string; name: string };
  steps: LabStep[];
}

export interface StartSessionResponse {
  sessionId: string;
  attachToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  token: string;
}

export interface DashboardTrackProgress {
  slug: string;
  name: string;
  icon: string | null;
  labsTotal: number;
  labsCompleted: number;
}

export interface DashboardRecentSession {
  labSlug: string;
  labTitle: string;
  trackSlug: string;
  trackName: string;
  status: "running" | "completed" | "expired" | "terminated";
  startedAt: string;
  stepsCompleted: number;
  stepsTotal: number;
}

export interface Dashboard {
  displayName: string;
  points: number;
  labsCompleted: number;
  totalLabsAvailable: number;
  tracks: DashboardTrackProgress[];
  recentSessions: DashboardRecentSession[];
}

export const signup = (email: string, password: string, displayName: string) =>
  api<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, displayName }) });

export const login = (email: string, password: string) =>
  api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const listTracks = () => api<TrackSummary[]>("/tracks");
export const getTrack = (slug: string) => api<TrackDetail>(`/tracks/${slug}`);
export const getLab = (slug: string) => api<LabDetail>(`/labs/${slug}`);
export const startLabSession = (slug: string) =>
  api<StartSessionResponse>(`/labs/${slug}/start`, { method: "POST" });
export const getDashboard = () => api<Dashboard>("/me/dashboard");
