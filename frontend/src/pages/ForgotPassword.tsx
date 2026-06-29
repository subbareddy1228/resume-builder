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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink mb-2">Forgot Password</h1>
          <p className="font-body text-sm text-ink/60">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="bg-moss/10 border border-moss/30 rounded-sm px-6 py-5 text-center">
            <p className="font-body text-sm text-moss font-medium mb-1">Check your email</p>
            <p className="font-body text-xs text-ink/60">
              If that email exists, a reset link has been sent. Check your spam folder too.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 font-body text-sm text-moss hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-sm p-8 space-y-5">
            <div>
              <label className="block font-body text-xs uppercase tracking-wide text-ink/50 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                placeholder="you@example.com"
              />
            </div>

            {error && <p className="font-body text-sm text-clay">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-moss text-paper font-body text-sm font-medium py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center font-body text-sm text-ink/50">
              Remember it?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-moss hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}