import React from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function OAuthButtons() {
  function goToGoogle() {
    window.location.href = `${API_URL}/api/auth/google/login`;
  }
  function goToLinkedIn() {
    window.location.href = `${API_URL}/api/auth/linkedin/login`;
  }

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={goToGoogle}
        className="w-full flex items-center justify-center gap-2.5 bg-white border border-ink/15 rounded-lg px-4 py-2.5 font-body text-sm font-medium text-ink hover:border-ink/30 hover:shadow-sm transition-all duration-150"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={goToLinkedIn}
        className="w-full flex items-center justify-center gap-2.5 bg-[#0A66C2] border border-[#0A66C2] rounded-lg px-4 py-2.5 font-body text-sm font-medium text-white hover:bg-[#0958AB] transition-all duration-150"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
        </svg>
        Continue with LinkedIn
      </button>

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-ink/10" />
        <span className="font-body text-xs text-ink/35">or</span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>
    </div>
  );
}
