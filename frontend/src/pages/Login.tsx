import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
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
      const data = await loginUser(email, password);
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Couldn't sign in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl text-ink">Resume Builder</span>
          <p className="font-body text-sm text-ink/60 mt-1">
            Sign in to keep working on your story.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-ink/10 rounded-sm p-8 shadow-sm"
        >
          <label className="block font-body text-xs uppercase tracking-wide text-ink/50 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            placeholder="you@example.com"
          />

          <label className="block font-body text-xs uppercase tracking-wide text-ink/50 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            placeholder="••••••••"
          />

          {error && (
            <p className="font-body text-sm text-clay mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-moss text-paper font-body text-sm font-medium py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center font-body text-sm text-ink/60 mt-6">
          New here?{" "}
          <Link to="/register" className="text-moss font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
