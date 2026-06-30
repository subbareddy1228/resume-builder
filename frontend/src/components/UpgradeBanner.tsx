import React, { useState } from "react";
import { createCheckout } from "../api/billing";

interface Props {
  message: string;
  onClose?: () => void;
}

export default function UpgradeBanner({ message, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const url = await createCheckout();
      window.location.href = url;
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-clay/10 to-amber-50 border border-clay/25 rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-clay text-lg">✦</span>
        <p className="font-body text-sm text-ink/80">{message}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={handleUpgrade} disabled={loading} className="btn-primary whitespace-nowrap !py-2">
          {loading ? "Loading..." : "Upgrade to Pro"}
        </button>
        {onClose && (
          <button onClick={onClose} className="text-clay/60 hover:text-clay text-lg leading-none transition-colors">×</button>
        )}
      </div>
    </div>
  );
}
