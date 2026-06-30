import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { scoreResume, ATSResult, ChecklistItem } from "../api/resumes";

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#3E5C46" : score >= 40 ? "#C8744A" : "#b91c1c";
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="150" height="150" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#EFE9DC" strokeWidth="13" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke={color} strokeWidth="13"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="70" y="68" textAnchor="middle" dominantBaseline="central"
          fontSize="30" fontWeight="bold" fill={color} fontFamily="Fraunces, serif">
          {score}
        </text>
        <text x="70" y="93" textAnchor="middle" fontSize="11" fill="#A8A29E"
          fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>
      <p className="font-body text-sm font-semibold mt-2" style={{ color }}>
        {score >= 70 ? "Strong match" : score >= 40 ? "Partial match" : "Weak match"}
      </p>
    </div>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  const priorityConfig = {
    high:   { badge: "bg-clay/10 text-clay",        label: "High impact" },
    medium: { badge: "bg-amber-50 text-amber-700",  label: "Medium impact" },
    low:    { badge: "bg-moss/10 text-moss",        label: "Done" },
  };
  const cfg = priorityConfig[item.priority];

  return (
    <div className={`flex gap-4 p-4 rounded-xl border transition-all ${
      item.done
        ? "bg-moss/[0.04] border-moss/15 opacity-75"
        : "bg-white border-ink/[0.08] hover:border-ink/15 hover:shadow-sm"
    }`}>
      {/* Checkbox */}
      <div className="shrink-0 mt-0.5">
        {item.done ? (
          <div className="w-5 h-5 rounded-full bg-moss flex items-center justify-center">
            <span className="text-paper text-xs font-bold">✓</span>
          </div>
        ) : (
          <div className={`w-5 h-5 rounded-full border-2 ${
            item.priority === "high" ? "border-clay" :
            item.priority === "medium" ? "border-amber-500" : "border-moss"
          }`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className={`font-body text-sm font-medium ${item.done ? "line-through text-ink/40" : "text-ink"}`}>
            {item.title}
          </p>
          {!item.done && (
            <span className={`pill ${cfg.badge}`}>
              {cfg.label}
            </span>
          )}
        </div>
        <p className="font-body text-xs text-ink/50">{item.detail}</p>
      </div>

      {/* Impact */}
      {item.impact && !item.done && (
        <div className="shrink-0 text-right">
          <span className="font-body text-xs font-semibold text-moss bg-moss/10 px-2.5 py-1 rounded-lg">
            {item.impact}
          </span>
        </div>
      )}
    </div>
  );
}

export default function ATS() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScore() {
    if (!id || !jdText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await scoreResume(id, jdText);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Couldn't score the resume. Make sure it has content.");
    } finally {
      setLoading(false);
    }
  }

  const pendingItems  = result?.checklist.filter((i) => !i.done) ?? [];
  const doneItems     = result?.checklist.filter((i) => i.done)  ?? [];
  const potentialGain = pendingItems
    .map((i) => parseInt(i.impact) || 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/[0.06] px-8 py-4 flex items-center gap-4 bg-white/80 backdrop-blur sticky top-0 z-10">
        <button onClick={() => navigate(`/editor/${id}`)} className="btn-ghost">
          ← Back to Editor
        </button>
        <span className="font-display text-xl text-ink">ATS Score</span>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <div className="heading-rule inline-block">
          <h1 className="font-display text-3xl text-ink mb-2">Check ATS Score</h1>
        </div>
        <p className="font-body text-sm text-ink/55 mb-8 mt-1">
          Paste a job description below to see how well your resume matches it.
        </p>

        <label className="field-label">Job Description</label>
        <textarea
          rows={10} value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="field-textarea mb-4"
          placeholder="Paste the full job description here..."
        />

        {error && (
          <p className="font-body text-sm text-clay mb-4 bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleScore}
          disabled={loading || !jdText.trim()}
          className="btn-primary mb-10"
        >
          {loading ? "Analysing..." : "Analyse Resume"}
        </button>

        {result && (
          <div className="space-y-6">

            {/* Score gauge */}
            <div className="surface-card p-8 flex flex-col items-center">
              <ScoreGauge score={result.score} />
              <p className="font-body text-sm text-ink/50 mt-3">
                {result.matched_keywords.length} of {result.total_keywords} keywords matched
              </p>
            </div>

            {/* Improvement Checklist */}
            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg text-ink">Improvement Checklist</h2>
                {potentialGain > 0 && (
                  <span className="pill-moss border border-moss/20">
                    Fix all → +{potentialGain} pts potential
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-ink/45 mb-5">
                {pendingItems.length} action{pendingItems.length !== 1 ? "s" : ""} to improve your score
              </p>
              <div className="space-y-3">
                {result.checklist.map((item, i) => (
                  <ChecklistCard key={i} item={item} />
                ))}
              </div>
            </div>

            {/* Matched keywords */}
            {result.matched_keywords.length > 0 && (
              <div className="surface-card p-6">
                <h2 className="font-display text-lg text-ink mb-4">Matched Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {result.matched_keywords.map((kw) => (
                    <span key={kw} className="pill-moss border border-moss/15">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {result.missing_keywords.length > 0 && (
              <div className="surface-card p-6">
                <h2 className="font-display text-lg text-ink mb-1">Missing Keywords</h2>
                <p className="font-body text-sm text-ink/50 mb-4">
                  Add these to your resume to improve your match score.
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw) => (
                    <span key={kw} className="pill-clay border border-clay/15">
                      ✕ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center pt-2">
              <button onClick={() => navigate(`/editor/${id}`)} className="font-body text-sm text-moss font-semibold hover:underline">
                Go back to editor and improve your resume →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
