import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import OAuthButtons from "../components/OAuthButtons";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await registerUser(email, password, fullName);
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Couldn't create your account. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="w-full max-w-sm relative">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-moss flex items-center justify-center">
              <span className="font-display text-paper text-sm">R</span>
            </div>
            <span className="font-display text-2xl text-ink">Resume Builder</span>
          </div>
          <p className="font-body text-sm text-ink/55">
            Start building a resume that gets read.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-8">
          <OAuthButtons />
          <label className="field-label">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="field-input mb-4"
            placeholder="Jordan Lee"
          />

          <label className="field-label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input mb-4"
            placeholder="you@example.com"
          />

          <label className="field-label">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input mb-6"
            placeholder="At least 8 characters"
          />

          {error && (
            <p className="font-body text-sm text-clay mb-4 bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center font-body text-sm text-ink/60 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-moss font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
