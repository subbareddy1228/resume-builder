import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Couldn't sign in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToGoogle() {
    window.location.href = `${API_URL}/api/auth/google/login`;
  }

  return (
    <div className="min-h-screen flex font-body">

      {/* ── Left panel — branding ─────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] bg-[#1e293b] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-moss/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-clay/10 blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative">
          <div className="w-9 h-9 rounded-xl bg-moss flex items-center justify-center shadow-lg">
            <span className="font-display text-white text-base font-bold">R</span>
          </div>
          <span className="font-display text-xl text-white">Resume Builder</span>
        </div>

        {/* Center content */}
        <div className="relative">
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Your story,<br />told right.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-xs">
            AI-powered resume builder with ATS scoring, job matching, and Claude-generated suggestions.
          </p>

          {/* Mini resume preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-moss/40 flex items-center justify-center">
                <span className="text-white text-sm font-display">A</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Arjun Sharma</p>
                <p className="text-slate-500 text-xs">Senior Software Engineer</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-moss/20 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                <span className="text-moss text-xs font-medium">87% ATS</span>
              </div>
            </div>
            <div className="space-y-2">
              {["Reduced API latency by 40%", "Led team of 6 engineers", "Shipped 3 Claude integrations"].map(b => (
                <div key={b} className="flex items-start gap-2">
                  <span className="text-moss text-xs mt-0.5">✦</span>
                  <p className="text-slate-400 text-xs">{b}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
              <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[87%] bg-moss rounded-full" />
              </div>
              <span className="text-slate-500 text-[10px]">Job match: 92%</span>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-slate-600 text-xs relative">
          Free to start · No credit card · No watermarks
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-moss flex items-center justify-center">
              <span className="font-display text-paper text-sm font-bold">R</span>
            </div>
            <span className="font-display text-xl text-ink">Resume Builder</span>
          </div>

          <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
          <p className="text-ink/45 text-sm mb-8">Sign in to continue building your resume.</p>

          {/* OAuth */}
          <button
            type="button"
            onClick={goToGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-ink/15 rounded-xl px-4 py-3 text-sm font-medium text-ink hover:border-ink/30 hover:shadow-sm transition-all mb-3"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"/>
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-paper text-xs text-ink/35">or sign in with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">Password</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-ink/40 hover:text-moss transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-clay/5 border border-clay/15 rounded-lg px-3.5 py-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-clay flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-clay">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-ink/50 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-moss font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}