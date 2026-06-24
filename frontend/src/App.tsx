import React, { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import { useAuth } from "./context/AuthContext";
import ATS from "./pages/ATS";
import AISuggest from "./pages/AISuggest";
import JobMatch from "./pages/JobMatch";
import CoverLetter from "./pages/CoverLetter";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}