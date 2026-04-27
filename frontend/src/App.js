import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/Layout/AppLayout";

// Auth pages (public)
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Protected pages
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import PipelinePage from "./pages/PipelinePage";
import InterviewsPage from "./pages/InterviewsPage";
import VendorsPage from "./pages/VendorsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — wrapped in AppLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <AppLayout><JobsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute>
              <AppLayout><CandidatesPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/pipeline" element={
            <ProtectedRoute roles={["Admin","HR","HiringManager"]}>
              <AppLayout><PipelinePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/interviews" element={
            <ProtectedRoute roles={["Admin","HR","HiringManager"]}>
              <AppLayout><InterviewsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendors" element={
            <ProtectedRoute roles={["Admin","HR"]}>
              <AppLayout><VendorsPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
