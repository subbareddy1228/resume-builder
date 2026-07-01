import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Props {
  mode: "login" | "register";
}

export default function OAuthButtons({ mode }: Props) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showEmail, setShowEmail] = useState(false);
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  function goToGoogle() {
    window.location.href = `${API_URL}/api/auth/google/login`;
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const data = await registerUser(email, password, fullName);
        login(data.access_token, data.user);
      } else {
        const data = await loginUser(email, password);
        login(data.access_token, data.user);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        type="button"
        onClick={goToGoogle}
        className="w-full flex items-center justify-center gap-3 bg-white border border-ink/15 rounded-lg px-4 py-3 font-body text-sm font-medium text-ink hover:border-ink/30 hover:shadow-sm transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      {/* Email button or expanded form */}
      {!showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="w-full flex items-center justify-center gap-3 bg-white border border-ink/15 rounded-lg px-4 py-3 font-body text-sm font-medium text-ink hover:border-ink/30 hover:shadow-sm transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 7 10-7"/>
          </svg>
          {mode === "login" ? "Login with Email" : "Sign up with Email"}
        </button>
      ) : (
        <form onSubmit={handleEmailSubmit} className="border border-ink/15 rounded-lg p-4 space-y-3 bg-white">
          {mode === "register" && (
            <div>
              <label className="block font-body text-xs text-ink/50 uppercase tracking-wide mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-ink/20 rounded-md px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                placeholder="Jordan Lee"
              />
            </div>
          )}
          <div>
            <label className="block font-body text-xs text-ink/50 uppercase tracking-wide mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-ink/20 rounded-md px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink/50 uppercase tracking-wide mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-ink/20 rounded-md px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-body text-xs text-clay bg-clay/5 border border-clay/15 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-moss text-paper font-body text-sm font-medium py-2.5 rounded-md hover:bg-moss/90 transition disabled:opacity-60"
          >
            {loading
              ? (mode === "login" ? "Signing in..." : "Creating account...")
              : (mode === "login" ? "Sign in" : "Create account")}
          </button>

          {mode === "login" && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="font-body text-xs text-ink/40 hover:text-moss transition"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowEmail(false)}
            className="w-full font-body text-xs text-ink/40 hover:text-ink transition text-center pt-1"
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}