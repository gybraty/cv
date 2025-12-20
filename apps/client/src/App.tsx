import { Routes, Route } from "react-router-dom";
import { ComponentExample } from "@/components/component-example";
import LoginPage from "@/login/page";
import SignupPage from "@/signup/page";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ComponentExample />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;