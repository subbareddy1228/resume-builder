import React, { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import { useAuth } from "./context/AuthContext";
import ATS from "./pages/ATS";
import AISuggest from "./pages/AISuggest";
import JobMatch from "./pages/JobMatch";
import CoverLetter from "./pages/CoverLetter";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/Profile";
import Applications from "./pages/Applications";
import OAuthCallback from "./pages/OAuthCallback";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <RequireAuth>
            <Editor />
          </RequireAuth>
        }
      />

      <Route
        path="/ats/:id"
        element={
          <RequireAuth>
            <ATS />
          </RequireAuth>
        }
      /><Route
        path="/ai/:id"
        element={
          <RequireAuth>
            <AISuggest />
          </RequireAuth>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <RequireAuth>
            <JobMatch />
          </RequireAuth>
        }
      />

      <Route
        path="/cover-letter/:id"
        element={<RequireAuth><CoverLetter /></RequireAuth>}
      />
      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/oauth/callback"  element={<OAuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
        path="/profile"
        element={<RequireAuth><ProfilePage /></RequireAuth>}
      />
      <Route
        path="/applications"
        element={<RequireAuth><Applications /></RequireAuth>}
      />
    </Routes>
    
  );
}