import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink mb-2">Forgot password</h1>
          <p className="font-body text-sm text-ink/55">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="surface-card px-6 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-moss text-xl">✓</span>
            </div>
            <p className="font-body text-sm text-ink font-semibold mb-1.5">Check your email</p>
            <p className="font-body text-xs text-ink/55 leading-relaxed">
              If that email exists, a reset link has been sent. Check your spam folder too.
            </p>
            <button onClick={() => navigate("/login")} className="mt-5 font-body text-sm text-moss hover:underline">
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface-card p-8 space-y-5">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field-input"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-clay bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || !email.trim()} className="btn-primary w-full">
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center font-body text-sm text-ink/50">
              Remember it?{" "}
              <button type="button" onClick={() => navigate("/login")} className="text-moss hover:underline">
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
