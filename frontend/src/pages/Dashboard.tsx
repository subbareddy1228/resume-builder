import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl text-ink">Resume Builder</span>
        <button
          onClick={handleLogout}
          className="font-body text-sm text-ink/60 hover:text-clay transition"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="font-display text-3xl text-ink mb-2">
          Welcome{user?.full_name ? `, ${user.full_name}` : ""}.
        </h1>
        <p className="font-body text-ink/60 mb-10">
          This is the dashboard placeholder for Phase 1. Resume CRUD,
          the editor, and ATS scoring land in the next phases.
        </p>

        <div className="border border-dashed border-ink/20 rounded-sm p-10 text-center">
          <p className="font-body text-sm text-ink/50">
            Your resumes will show up here once Phase 2 (Resume CRUD) is built.
          </p>
        </div>
      </main>
    </div>
  );
}
