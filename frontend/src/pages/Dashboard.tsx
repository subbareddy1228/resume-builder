import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listResumes, createResume, deleteResume } from "../api/resumes";
import { Resume } from "../types/auth";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listResumes()
      .then(setResumes)
      .catch(() => setError("Couldn't load resumes."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const resume = await createResume("Untitled Resume");
      navigate(`/editor/${resume.id}`);
    } catch {
      setError("Couldn't create resume.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Couldn't delete resume.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 px-8 py-4 flex items-center justify-between">
        <span className="font-display text-xl text-ink">Resume Builder</span>
        <div className="flex items-center gap-6">
          <span className="font-body text-sm text-ink/50">
            {user?.full_name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="font-body text-sm text-ink/60 hover:text-clay transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-ink">My Resumes</h1>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-moss text-paper font-body text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60"
          >
            {creating ? "Creating..." : "+ New Resume"}
          </button>
        </div>

        {error && (
          <p className="font-body text-sm text-clay mb-6">{error}</p>
        )}

        {loading ? (
          <p className="font-body text-sm text-ink/50">Loading...</p>
        ) : resumes.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-sm p-16 text-center">
            <p className="font-display text-xl text-ink/40 mb-2">
              No resumes yet
            </p>
            <p className="font-body text-sm text-ink/40">
              Click "+ New Resume" to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white border border-ink/10 rounded-sm p-6 flex items-center justify-between hover:border-moss/40 transition"
              >
                <div>
                  <p className="font-body font-medium text-ink">
                    {resume.title}
                  </p>
                  <p className="font-body text-xs text-ink/40 mt-1">
                    Updated{" "}
                    {new Date(resume.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/editor/${resume.id}`)}
                    className="font-body text-sm text-moss font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="font-body text-sm text-ink/40 hover:text-clay transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}