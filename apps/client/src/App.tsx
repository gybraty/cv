import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/login/page";
import SignupPage from "@/signup/page";
import DashboardPage from "@/dashboard/page";
import ProfilePage from "@/profile/page";
import ResumeEditorPage from "@/editor/page"; // Added import
import { checkSession } from "@/_actions/authActions";
import type { AppDispatch } from "@/store";
import { PrivateRoute, PublicRoute } from "@/components/private-route";
import { Layout } from "@/components/layout";

export function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
      <Route path="/signup" element={<PublicRoute element={<SignupPage />} />} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<PrivateRoute path="/dashboard" element={<DashboardPage />} />} />
        <Route path="/dashboard" element={<PrivateRoute path="/dashboard" element={<DashboardPage />} />} />
        <Route path="/profile" element={<PrivateRoute path="/profile" element={<ProfilePage />} />} />
        <Route path="/resumes/:id/edit" element={<PrivateRoute path="/resumes/:id/edit" element={<ResumeEditorPage />} />} />
      </Route>
    </Routes>
  );
}

export default App;