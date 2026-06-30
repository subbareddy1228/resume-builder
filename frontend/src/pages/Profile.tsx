import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, changePassword, Profile } from "../api/profile";
import { createPortal, createCheckout } from "../api/billing";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);

  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg]   = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [pwError, setPwError]     = useState<string | null>(null);
  const [pwMsg, setPwMsg]         = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => { setProfile(p); setFullName(p.full_name || ""); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg("");
    try {
      await updateProfile(fullName);
      setNameMsg("Saved ✓");
      setProfile((p) => p ? { ...p, full_name: fullName } : p);
    } catch {
      setNameMsg("Failed to save");
    } finally {
      setSavingName(false);
      setTimeout(() => setNameMsg(""), 2000);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwMsg("");
    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg("Password changed ✓");
      setCurrentPw("");
      setNewPw("");
    } catch (err: any) {
      setPwError(err.response?.data?.detail || "Couldn't change password.");
    } finally {
      setChangingPw(false);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const url = await createPortal();
      window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleUpgrade() {
    const url = await createCheckout();
    window.location.href = url;
  }

  const inputCls = "w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss bg-white";
  const labelCls = "block font-body text-xs uppercase tracking-wide text-ink/50 mb-1";
  const cardCls  = "bg-white border border-ink/10 rounded-sm p-6";

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink/40">Loading...</p>
      </div>
    );
  }

  const isPro = profile?.plan === "pro";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 px-8 py-4 flex items-center gap-4 bg-white">
        <button
          onClick={() => navigate("/dashboard")}
          className="font-body text-sm text-ink/50 hover:text-ink transition"
        >
          ← Dashboard
        </button>
        <span className="font-display text-xl text-ink">Profile</span>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-12 space-y-8">

        {/* Account info */}
        <section className={cardCls}>
          <h2 className="font-display text-lg text-ink mb-1">Account</h2>
          <p className="font-body text-sm text-ink/50 mb-6">{profile?.email}</p>

          <form onSubmit={handleSaveName}>
            <label className={labelCls}>Full Name</label>
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
              <button
                type="submit"
                disabled={savingName}
                className="bg-moss text-paper font-body text-sm px-5 py-2 rounded-sm hover:bg-moss/90 transition disabled:opacity-50 whitespace-nowrap"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
            </div>
            {nameMsg && (
              <p className={`font-body text-xs mt-2 ${nameMsg.includes("✓") ? "text-moss" : "text-clay"}`}>
                {nameMsg}
              </p>
            )}
          </form>

          <p className="font-body text-xs text-ink/40 mt-4">
            Member since {profile && new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </section>

        {/* Usage & Plan */}
        <section className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">Plan & Usage</h2>
            <span className={`font-body text-xs font-medium px-2.5 py-1 rounded-full ${
              isPro ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink/50"
            }`}>
              {isPro ? "✦ Pro" : "Free"}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-body text-sm">
              <span className="text-ink/60">Resumes</span>
              <span className="text-ink font-medium">{profile?.resume_count} {isPro ? "" : "/ 3"}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-ink/60">ATS Scans this month</span>
              <span className="text-ink font-medium">
                {profile?.ats_scans_used} {isPro ? "" : `/ ${profile?.ats_scans_limit}`}
              </span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-ink/60">AI Suggestions this month</span>
              <span className="text-ink font-medium">
                {profile?.ai_suggestions_used} {isPro ? "" : `/ ${profile?.ai_suggestions_limit}`}
              </span>
            </div>
          </div>

          {isPro ? (
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full border border-ink/20 text-ink font-body text-sm py-2.5 rounded-sm hover:border-ink/40 transition disabled:opacity-50"
            >
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              className="w-full bg-moss text-paper font-body text-sm font-medium py-2.5 rounded-sm hover:bg-moss/90 transition"
            >
              Upgrade to Pro
            </button>
          )}
        </section>

        {/* Change password */}
        <section className={cardCls}>
          <h2 className="font-display text-lg text-ink mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className={labelCls}>Current Password</label>
              <input
                type="password"
                required
                className={inputCls}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className={inputCls}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            {pwError && <p className="font-body text-sm text-clay">{pwError}</p>}
            {pwMsg && <p className="font-body text-sm text-moss">{pwMsg}</p>}

            <button
              type="submit"
              disabled={changingPw}
              className="bg-moss text-paper font-body text-sm px-5 py-2 rounded-sm hover:bg-moss/90 transition disabled:opacity-50"
            >
              {changingPw ? "Updating..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* Sign out */}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="font-body text-sm text-clay hover:underline"
        >
          Sign out
        </button>
      </main>
    </div>
  );
}