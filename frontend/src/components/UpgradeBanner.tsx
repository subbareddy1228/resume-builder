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
    <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-3 flex items-center justify-between gap-4 mb-6">
      <p className="font-body text-sm text-amber-800">{message}</p>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-moss text-paper font-body text-sm px-4 py-1.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Loading..." : "Upgrade to Pro"}
        </button>
        {onClose && (
          <button onClick={onClose} className="text-amber-500 hover:text-amber-700 text-lg leading-none">×</button>
        )}
      </div>
    </div>
  );
}
