import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";


export default function AdminRoute() {
  const auth = useAuth();
  const user = auth?.user || null;
  const loading = auth?.loading || false;
  const isAuthed = typeof auth?.isAuthenticated === "boolean"
    ? auth.isAuthenticated
    : !!user;

  if (loading) return <div className="py-10 text-center">Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
