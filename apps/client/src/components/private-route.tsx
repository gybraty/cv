import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface PrivateRouteProps {
  element: ReactNode;
  path?: string; // Included to satisfy requirements, though often handled by Route
}

export const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  return user ? <>{element}</> : <Navigate to="/login" replace />;
};

export const PublicRoute = ({ element }: PrivateRouteProps) => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? <>{element}</> : <Navigate to="/" replace />;
};
