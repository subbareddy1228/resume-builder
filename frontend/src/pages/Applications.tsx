import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  listApplications, createApplication, updateApplication, deleteApplication,
  JobApplication, AppStatus,
} from "../api/applications";
import { listResumes } from "../api/resumes";
import { Resume } from "../types/auth";

const COLUMNS: { id: AppStatus; label: string; color: string }[] = [
  { id: "applied",   label: "Applied",    color: "#6b7280" },
  { id: "interview", label: "Interview",  color: "#C8744A" },
  { id: "offer",     label: "Offer",      color: "#3E5C46" },
  { id: "rejected",  label: "Rejected",   color: "#b91c1c" },
];

export default function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([listApplications(), listResumes()])
      .then(([a, r]) => { setApps(a); setResumes(r); })
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setCompany(""); setRole(""); setJobUrl(""); setNotes(""); setResumeId("");
    setEditingId(null);
    setShowForm(false);
  }

  function openEdit(app: JobApplication) {
    setCompany(app.company);
    setRole(app.role);
    setJobUrl(app.job_url || "");
    setNotes(app.notes || "");
    setResumeId(app.resume_id || "");
    setEditingId(app.id);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateApplication(editingId, {
          company, role, job_url: jobUrl || undefined, notes: notes || undefined,
          resume_id: resumeId || undefined,
        });
        setApps((prev) => prev.map((a) => a.id === editingId ? updated : a));
      } else {
        const created = await createApplication({
          company, role, job_url: jobUrl || undefined, notes: notes || undefined,
          resume_id: resumeId || undefined,
        });
        setApps((prev) => [created, ...prev]);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(app: JobApplication, status: AppStatus) {
    const updated = await updateApplication(app.id, { status });
    setApps((prev) => prev.map((a) => a.id === app.id ? updated : a));
  }

  async function handleDelete(id: string) {
    await deleteApplication(id);
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  const inputCls = "w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss bg-white";
  const labelCls = "block font-body text-xs uppercase tracking-wide text-ink/50 mb-1";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 px-8 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="font-body text-sm text-ink/50 hover:text-ink transition">
            ← Dashboard
          </button>
          <span className="font-display text-xl text-ink">Job Applications</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-moss text-paper font-body text-sm font-medium px-5 py-2 rounded-sm hover:bg-moss/90 transition"
        >
          + Add Application
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">

        {/* Add/Edit form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-sm p-6 mb-8">
            <h2 className="font-display text-lg text-ink mb-4">
              {editingId ? "Edit Application" : "New Application"}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Company</label>
                <input required className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <input required className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Frontend Engineer" />
              </div>
              <div>
                <label className={labelCls}>Job URL</label>
                <input className={inputCls} value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>Linked Resume</label>
                <select className={inputCls} value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  <option value="">None</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Notes</label>
                <textarea rows={3} className={`${inputCls} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Recruiter contact, interview notes..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-moss text-paper font-body text-sm px-5 py-2 rounded-sm hover:bg-moss/90 transition disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Application"}
              </button>
              <button type="button" onClick={resetForm} className="font-body text-sm text-ink/50 hover:text-ink px-5 py-2">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="font-body text-sm text-ink/40">Loading...</p>
        ) : apps.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-sm p-16 text-center">
            <p className="font-display text-2xl text-ink/30 mb-3">No applications yet</p>
            <p className="font-body text-sm text-ink/40 mb-6">Track every job you apply to in one place.</p>
            <button onClick={() => setShowForm(true)} className="bg-moss text-paper font-body text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-moss/90 transition">
              + Add Your First Application
            </button>
          </div>
        ) : (
          /* Kanban board */
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colApps = apps.filter((a) => a.status === col.id);
              return (
                <div key={col.id} className="min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="font-body text-sm font-medium text-ink">{col.label}</h3>
                    <span className="font-body text-xs text-ink/30">({colApps.length})</span>
                  </div>

                  <div className="space-y-3">
                    {colApps.map((app) => (
                      <div key={app.id} className="bg-white border border-ink/10 rounded-sm p-4 hover:border-moss/30 transition">
                        <p className="font-body text-sm font-medium text-ink truncate">{app.company}</p>
                        <p className="font-body text-xs text-ink/50 truncate mb-2">{app.role}</p>

                        <p className="font-body text-xs text-ink/30 mb-3">
                          {new Date(app.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>

                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app, e.target.value as AppStatus)}
                          className="w-full text-xs border border-ink/15 rounded-sm px-2 py-1 font-body mb-2 bg-paper"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          {app.job_url && (
                            <a href={app.job_url} target="_blank" rel="noreferrer" className="font-body text-xs text-moss hover:underline">
                              Job ↗
                            </a>
                          )}
                          <button onClick={() => openEdit(app)} className="font-body text-xs text-ink/50 hover:text-ink ml-auto">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(app.id)} className="font-body text-xs text-ink/30 hover:text-clay">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}