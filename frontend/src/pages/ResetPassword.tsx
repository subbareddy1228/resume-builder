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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink mb-2">Reset Password</h1>
          <p className="font-body text-sm text-ink/60">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="bg-moss/10 border border-moss/30 rounded-sm px-6 py-5 text-center">
            <p className="font-body text-sm text-moss font-medium mb-1">Password reset!</p>
            <p className="font-body text-xs text-ink/60 mb-4">
              You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-moss text-paper font-body text-sm font-medium px-6 py-2 rounded-sm hover:bg-moss/90 transition"
            >
              Sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-sm p-8 space-y-5">
            <div>
              <label className="block font-body text-xs uppercase tracking-wide text-ink/50 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block font-body text-xs uppercase tracking-wide text-ink/50 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                placeholder="Repeat your password"
              />
            </div>

            {error && <p className="font-body text-sm text-clay">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password || !confirm || !token}
              className="w-full bg-moss text-paper font-body text-sm font-medium py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}