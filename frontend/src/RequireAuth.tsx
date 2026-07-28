import { Navigate, Outlet } from "react-router-dom";
import { isAuthed } from "./api.js";

export function RequireAuth() {
  return isAuthed() ? <Outlet /> : <Navigate to="/login" replace />;
}
