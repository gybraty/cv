import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/login/page";
import SignupPage from "@/signup/page";
import DashboardPage from "@/dashboard/page";
import ProfilePage from "@/profile/page";
import { checkSession } from "@/_actions/authActions";
import type { AppDispatch } from "@/store";
import { PrivateRoute, PublicRoute } from "@/components/private-route";

export function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
      <Route path="/signup" element={<PublicRoute element={<SignupPage />} />} />
      <Route path="/" element={<PrivateRoute path="/dashboard" element={<DashboardPage />} />} />
      <Route path="/profile" element={<PrivateRoute path="/profile" element={<ProfilePage />} />} />
    </Routes>
  );
}

export default App;