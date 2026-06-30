import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink mb-2">Reset password</h1>
          <p className="font-body text-sm text-ink/55">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="surface-card px-6 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-moss text-xl">✓</span>
            </div>
            <p className="font-body text-sm text-ink font-semibold mb-1.5">Password reset</p>
            <p className="font-body text-xs text-ink/55 mb-5">
              You can now sign in with your new password.
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary">
              Sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface-card p-8 space-y-5">
            <div>
              <label className="field-label">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="field-input"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="field-label">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="field-input"
                placeholder="Repeat your password"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-clay bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm || !token}
              className="btn-primary w-full"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
