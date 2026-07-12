import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/components/landing/landing-page";
import { DashboardPage } from "@/pages/DashboardPage";

export default function App() {
  return (
    <div className="page-wrapper">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}
