import React from "react";

interface Props {
  label: string;
  used: number;
  limit: number;
}

export default function UsageBar({ label, used, limit }: Props) {
  const isPro = limit >= 999;
  const pct   = isPro ? 0 : Math.min((used / limit) * 100, 100);
  const near  = pct >= 80 && !isPro;
  const full  = pct >= 100 && !isPro;

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="font-body text-xs text-ink/60">{label}</span>
        <span className={`font-body text-xs font-medium ${full ? "text-clay" : near ? "text-amber-600" : "text-ink/50"}`}>
          {isPro ? "Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      {!isPro && (
        <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${full ? "bg-clay" : near ? "bg-amber-500" : "bg-moss"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
