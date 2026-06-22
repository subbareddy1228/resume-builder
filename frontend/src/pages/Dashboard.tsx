import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listResumes, createResume, deleteResume } from "../api/resumes";
import { getBillingStatus, createCheckout, createPortal, BillingStatus } from "../api/billing";
import { Resume } from "../types/auth";
import UsageBar from "../components/UsageBar";
import UpgradeBanner from "../components/UpgradeBanner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resumes, setResumes]         = useState<Resume[]>([]);
  const [billing, setBilling]         = useState<BillingStatus | null>(null);
  const [loading, setLoading]         = useState(true);
  const [creating, setCreating]       = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const upgradeSuccess   = searchParams.get("upgrade") === "success";
  const upgradeCancelled = searchParams.get("upgrade") === "cancelled";

  useEffect(() => {
    Promise.all([listResumes(), getBillingStatus()])
      .then(([r, b]) => { setResumes(r); setBilling(b); })
      .catch(() => setError("Couldn't load data."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (billing && !billing.usage) return;
    setCreating(true);
    setError(null);
    try {
      const resume = await createResume("Untitled Resume");
      navigate(`/editor/${resume.id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Couldn't create resume.";
      if (msg.includes("Upgrade")) {
        setShowUpgrade(true);
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setBilling((prev) => prev ? {
        ...prev, usage: { ...prev.usage, resumes: prev.usage.resumes - 1 }
      } : prev);
    } catch {
      setError("Couldn't delete resume.");
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

  return (
    <div className="min-h-screen bg-paper">

      {/* Header */}
      <header className="border-b border-ink/10 px-8 py-4 flex items-center justify-between bg-white">
        <span className="font-display text-xl text-ink">Resume Builder</span>
        <div className="flex items-center gap-6">
          <span className="font-body text-xs text-moss font-medium uppercase tracking-wide">
            {isPro ? "✦ Pro" : "Free"}
          </span>
          <span className="font-body text-sm text-ink/50">{user?.full_name || user?.email}</span>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="font-body text-sm text-ink/60 hover:text-clay transition">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">

        {/* Success / cancelled banners */}
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

        {/* Upgrade banner when limit hit */}
        {showUpgrade && (
          <UpgradeBanner
            message={`You've reached the ${resumeLimit}-resume limit on the Free plan.`}
            onClose={() => setShowUpgrade(false)}
          />
        )}

        <div className="flex gap-8">

          {/* Left — resumes */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-3xl text-ink">My Resumes</h1>
              <button
                onClick={handleCreate}
                disabled={creating || atLimit}
                title={atLimit ? `Upgrade to create more than ${resumeLimit} resumes` : ""}
                className="bg-moss text-paper font-body text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : atLimit ? `Limit reached (${resumeLimit})` : "+ New Resume"}
              </button>
            </div>

            {error && <p className="font-body text-sm text-clay mb-6">{error}</p>}

            {loading ? (
              <p className="font-body text-sm text-ink/50">Loading...</p>
            ) : resumes.length === 0 ? (
              <div className="border border-dashed border-ink/20 rounded-sm p-16 text-center">
                <p className="font-display text-xl text-ink/40 mb-2">No resumes yet</p>
                <p className="font-body text-sm text-ink/40">Click "+ New Resume" to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {resumes.map((resume) => (
                  <div key={resume.id}
                    className="bg-white border border-ink/10 rounded-sm p-6 flex items-center justify-between hover:border-moss/40 transition">
                    <div>
                      <p className="font-body font-medium text-ink">{resume.title}</p>
                      <p className="font-body text-xs text-ink/40 mt-1">
                        Updated {new Date(resume.updated_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => navigate(`/editor/${resume.id}`)}
                        className="font-body text-sm text-moss font-medium hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(resume.id)}
                        className="font-body text-sm text-ink/40 hover:text-clay transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — plan sidebar */}
          {billing && (
            <div className="w-56 shrink-0">
              <div className="bg-white border border-ink/10 rounded-sm p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-body text-sm font-medium text-ink">Your Plan</h2>
                  <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full ${
                    isPro ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink/50"
                  }`}>
                    {isPro ? "Pro" : "Free"}
                  </span>
                </div>

                <UsageBar label="Resumes"        used={resumeUsed}                limit={billing.limits.resumes} />
                <UsageBar label="ATS Scans"      used={billing.usage.ats_scans}   limit={billing.limits.ats_scans} />
                <UsageBar label="AI Suggestions" used={billing.usage.ai_suggestions} limit={billing.limits.ai_suggestions} />

                <div className="mt-4 pt-4 border-t border-ink/10">
                  {isPro ? (
                    <button onClick={handleManageSubscription} disabled={portalLoading}
                      className="w-full font-body text-xs text-ink/50 hover:text-ink transition text-center">
                      {portalLoading ? "Loading..." : "Manage subscription"}
                    </button>
                  ) : (
                    <>
                      <button onClick={handleUpgrade}
                        className="w-full bg-moss text-paper font-body text-sm font-medium py-2 rounded-sm hover:bg-moss/90 transition mb-2">
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
          )}
        </div>
      </main>
    </div>
  );
}
