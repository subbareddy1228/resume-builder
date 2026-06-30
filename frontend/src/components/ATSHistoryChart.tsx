import React from "react";
import { ATSHistoryItem } from "../api/resumes";

interface Props {
  history: ATSHistoryItem[];
}

export default function ATSHistoryChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-ink/10 rounded-sm p-8 text-center">
        <p className="font-body text-sm text-ink/40">
          No score history yet. Run an ATS scan to start tracking progress.
        </p>
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = history.map((h, i) => {
    const x = history.length === 1
      ? padding.left + chartW / 2
      : padding.left + (i / (history.length - 1)) * chartW;
    const y = padding.top + chartH - (h.score / 100) * chartH;
    return { x, y, score: h.score, date: h.created_at };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const latest = history[history.length - 1].score;
  const first = history[0].score;
  const change = latest - first;

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="bg-white border border-ink/10 rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-body text-xs uppercase tracking-wide text-ink/40 mb-1">
            Score Trend
          </p>
          <p className="font-display text-2xl text-ink">{latest}</p>
        </div>
        {history.length > 1 && (
          <span className={`font-body text-sm font-medium px-2.5 py-1 rounded-full ${
            change > 0 ? "bg-moss/10 text-moss" : change < 0 ? "bg-clay/10 text-clay" : "bg-ink/5 text-ink/50"
          }`}>
            {change > 0 ? "↑" : change < 0 ? "↓" : "→"} {Math.abs(change)} pts since first scan
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {gridLines.map((g) => {
          const y = padding.top + chartH - (g / 100) * chartH;
          return (
            <g key={g}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                stroke="#EFE9DC" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end"
                fontSize="9" fill="#A8A29E" fontFamily="Inter, sans-serif">
                {g}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="#3E5C46" fillOpacity="0.08" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#3E5C46" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#3E5C46" />
            <circle cx={p.x} cy={p.y} r="8" fill="#3E5C46" fillOpacity="0.15" />
          </g>
        ))}
      </svg>

      <div className="flex justify-between mt-2 px-1">
        <span className="font-body text-xs text-ink/30">
          {new Date(history[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        {history.length > 1 && (
          <span className="font-body text-xs text-ink/30">
            {new Date(history[history.length - 1].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {/* Recent scans list */}
      <div className="mt-6 pt-4 border-t border-ink/10 space-y-2 max-h-40 overflow-y-auto">
        {[...history].reverse().map((h) => (
          <div key={h.id} className="flex items-center justify-between font-body text-xs">
            <span className="text-ink/50 truncate flex-1 mr-3">
              {h.jd_snippet || "Job description"}
            </span>
            <span className="text-ink/30 shrink-0 mr-3">
              {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className={`font-medium shrink-0 ${
              h.score >= 70 ? "text-moss" : h.score >= 40 ? "text-clay" : "text-red-700"
            }`}>
              {h.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}