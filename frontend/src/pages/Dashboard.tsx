import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listResumes, createResume, deleteResume, downloadPDF } from "../api/resumes";
import { getBillingStatus, createCheckout, createPortal, BillingStatus } from "../api/billing";
import { Resume } from "../types/auth";
import UsageBar from "../components/UsageBar";
import UpgradeBanner from "../components/UpgradeBanner";

type SortKey = "updated" | "created" | "name";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [resumes, setResumes]             = useState<Resume[]>([]);
  const [billing, setBilling]             = useState<BillingStatus | null>(null);
  const [loading, setLoading]             = useState(true);
  const [creating, setCreating]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade]     = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [search, setSearch]               = useState("");
  const [sort, setSort]                   = useState<SortKey>("updated");
  const [exportingId, setExportingId]     = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const upgradeSuccess   = searchParams.get("upgrade") === "success";
  const upgradeCancelled = searchParams.get("upgrade") === "cancelled";

  useEffect(() => {
    Promise.all([
      listResumes(),
      getBillingStatus().catch(() => null),
    ])
      .then(([r, b]) => { setResumes(r); setBilling(b); })
      .catch(() => setError("Couldn't load resumes."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const resume = await createResume("Untitled Resume");
      navigate(`/editor/${resume.id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Couldn't create resume.";
      if (msg.toLowerCase().includes("upgrade")) {
        setShowUpgrade(true);
      }
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError("Couldn't delete resume.");
    }
  }

  async function handleExport(resume: Resume) {
    setExportingId(resume.id);
    try {
      await downloadPDF(resume.id, resume.title);
    } catch {
      setError("PDF export failed.");
    } finally {
      setExportingId(null);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const url = await createPortal();
      window.location.href = url;
    } catch {
      setError("Couldn't open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleUpgrade() {
    try {
      const url = await createCheckout();
      window.location.href = url;
    } catch {
      setError("Couldn't start checkout.");
    }
  }

  const isPro       = billing?.plan === "pro";
  const resumeLimit = billing?.limits.resumes ?? 3;
  const resumeUsed  = billing?.usage.resumes ?? resumes.length;
  const atLimit     = !isPro && resumeUsed >= resumeLimit;

  const TEMPLATE_LABELS: Record<string, string> = {
    classic: "Classic",
    modern: "Modern",
    minimal: "Minimal",
    bold: "Bold",
  };

  const filtered = resumes
    .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "created") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const lastUpdated = resumes.length > 0
    ? new Date(Math.max(...resumes.map((r) => new Date(r.updated_at).getTime())))
    : null;

  return (
    <div className="min-h-screen bg-paper">

      {/* Header */}
      <header className="border-b border-ink/10 px-8 py-4 flex items-center justify-between bg-white">
        <span className="font-display text-xl text-ink">Resume Builder</span>
        <div className="flex items-center gap-6">
          <span className={`font-body text-xs font-medium px-2.5 py-1 rounded-full ${
            isPro ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink/50"
          }`}>
            {isPro ? "✦ Pro" : "Free Plan"}
          </span>
          <span className="font-body text-sm text-ink/50">
            {user?.full_name || user?.email}
          </span>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="font-body text-sm text-ink/60 hover:text-clay transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">

        {/* Banners */}
        {upgradeSuccess && (
          <div className="bg-moss/10 border border-moss/30 rounded-sm px-4 py-3 mb-6">
            <p className="font-body text-sm text-moss font-medium">✓ Welcome to Pro! All limits removed.</p>
          </div>
        )}
        {upgradeCancelled && (
          <div className="bg-ink/5 border border-ink/20 rounded-sm px-4 py-3 mb-6">
            <p className="font-body text-sm text-ink/60">Upgrade cancelled. You remain on the Free plan.</p>
          </div>
        )}
        {showUpgrade && (
          <UpgradeBanner
            message={`You've reached the ${resumeLimit}-resume limit on the Free plan.`}
            onClose={() => setShowUpgrade(false)}
          />
        )}

        <div className="flex gap-8">

          {/* Left — resumes */}
          <div className="flex-1 min-w-0">

            {/* Stats row */}
            {!loading && resumes.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-ink/10 rounded-sm px-4 py-3">
                  <p className="font-body text-xs text-ink/40 uppercase tracking-wide mb-1">Total Resumes</p>
                  <p className="font-display text-2xl text-ink">{resumes.length}</p>
                </div>
                <div className="bg-white border border-ink/10 rounded-sm px-4 py-3">
                  <p className="font-body text-xs text-ink/40 uppercase tracking-wide mb-1">Last Updated</p>
                  <p className="font-body text-sm text-ink font-medium">
                    {lastUpdated ? lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </p>
                </div>
                <div className="bg-white border border-ink/10 rounded-sm px-4 py-3">
                  <p className="font-body text-xs text-ink/40 uppercase tracking-wide mb-1">Plan</p>
                  <p className="font-body text-sm text-ink font-medium">{isPro ? "Pro — Unlimited" : `Free — ${resumeUsed}/${resumeLimit}`}</p>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <h1 className="font-display text-3xl text-ink shrink-0">My Resumes</h1>
              <div className="flex items-center gap-3 flex-1 justify-end">
                {resumes.length > 1 && (
                  <>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search resumes..."
                      className="border border-ink/20 rounded-sm px-3 py-1.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss w-44"
                    />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="border border-ink/20 rounded-sm px-3 py-1.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss bg-white"
                    >
                      <option value="updated">Last Updated</option>
                      <option value="created">Date Created</option>
                      <option value="name">Name A–Z</option>
                    </select>
                  </>
                )}
                <button
                  onClick={handleCreate}
                  disabled={creating || atLimit}
                  title={atLimit ? `Upgrade to create more than ${resumeLimit} resumes` : ""}
                  className="bg-moss text-paper font-body text-sm font-medium px-5 py-2 rounded-sm hover:bg-moss/90 transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {creating ? "Creating..." : atLimit ? `Limit (${resumeLimit})` : "+ New Resume"}
                </button>
              </div>
            </div>

            {error && <p className="font-body text-sm text-clay mb-6">{error}</p>}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-ink/10 rounded-sm p-6 animate-pulse">
                    <div className="h-4 bg-ink/10 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-ink/5 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <div className="border border-dashed border-ink/20 rounded-sm p-16 text-center">
                <p className="font-display text-2xl text-ink/30 mb-3">No resumes yet</p>
                <p className="font-body text-sm text-ink/40 mb-6">
                  Create your first resume and start applying with confidence.
                </p>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="bg-moss text-paper font-body text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60"
                >
                  {creating ? "Creating..." : "+ Create First Resume"}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-ink/20 rounded-sm p-10 text-center">
                <p className="font-body text-sm text-ink/40">No resumes match "{search}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-white border border-ink/10 rounded-sm p-5 hover:border-moss/30 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-body font-medium text-ink truncate">
                            {resume.title}
                          </p>
                          <span className="font-body text-xs text-ink/30 bg-ink/5 px-2 py-0.5 rounded-full shrink-0">
                            {TEMPLATE_LABELS[resume.template] || "Classic"}
                          </span>
                        </div>
                        <p className="font-body text-xs text-ink/40">
                          Updated {new Date(resume.updated_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                          {" · "}
                          Created {new Date(resume.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/editor/${resume.id}`)}
                          className="font-body text-sm text-moss font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-ink/20">·</span>
                        <button
                          onClick={() => navigate(`/ats/${resume.id}`)}
                          className="font-body text-sm text-ink/50 hover:text-ink transition"
                        >
                          ATS
                        </button>
                        <span className="text-ink/20">·</span>
                        <button
                          onClick={() => navigate(`/cover-letter/${resume.id}`)}
                          className="font-body text-sm text-ink/50 hover:text-ink transition"
                        >
                          Cover Letter
                        </button>
                        <span className="text-ink/20">·</span>
                        <button
                          onClick={() => handleExport(resume)}
                          disabled={exportingId === resume.id}
                          className="font-body text-sm text-ink/50 hover:text-ink transition disabled:opacity-50"
                        >
                          {exportingId === resume.id ? "..." : "↓ PDF"}
                        </button>
                        <span className="text-ink/20">·</span>
                        {deleteConfirm === resume.id ? (
                          <span className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(resume.id)}
                              className="font-body text-xs text-clay font-medium hover:underline"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="font-body text-xs text-ink/40 hover:text-ink"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(resume.id)}
                            className="font-body text-sm text-ink/30 hover:text-clay transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — plan sidebar */}
          <div className="w-56 shrink-0">
            <div className="bg-white border border-ink/10 rounded-sm p-5 sticky top-6 space-y-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-body text-sm font-medium text-ink">Your Plan</h2>
                <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPro ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink/50"
                }`}>
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>

              {billing ? (
                <>
                  <UsageBar label="Resumes"        used={resumeUsed}                    limit={billing.limits.resumes} />
                  <UsageBar label="ATS Scans"      used={billing.usage.ats_scans}       limit={billing.limits.ats_scans} />
                  <UsageBar label="AI Suggestions" used={billing.usage.ai_suggestions}  limit={billing.limits.ai_suggestions} />
                </>
              ) : (
                <p className="font-body text-xs text-ink/40">Usage data unavailable</p>
              )}

              <div className="mt-4 pt-4 border-t border-ink/10">
                {isPro ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full font-body text-xs text-ink/50 hover:text-ink transition text-center"
                  >
                    {portalLoading ? "Loading..." : "Manage subscription"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpgrade}
                      className="w-full bg-moss text-paper font-body text-sm font-medium py-2 rounded-sm hover:bg-moss/90 transition mb-2"
                    >
                      Upgrade to Pro
                    </button>
                    <p className="font-body text-xs text-ink/40 text-center">
                      Unlimited resumes, scans & AI
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}