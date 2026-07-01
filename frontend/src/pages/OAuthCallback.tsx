import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCurrentUser } from "../api/auth";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }
    if (!token) {
      setError("Something went wrong during sign-in. Please try again.");
      return;
    }

    // Stash the token first so the authenticated apiClient picks it up
    // for the /api/auth/me request that follows.
    localStorage.setItem("access_token", token);

    fetchCurrentUser()
      .then((profile) => {
        login(token, {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
        });
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setError("Signed in, but couldn't load your profile. Please try again.");
      });
  }, [searchParams]);

  return (
    <div className="auth-shell">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <div className="surface-card p-8">
            <p className="font-body text-sm text-clay mb-4">{error}</p>
            <button onClick={() => navigate("/login")} className="btn-primary">
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-moss/20 border-t-moss rounded-full animate-spin" />
            <p className="font-body text-sm text-ink/50">Signing you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
