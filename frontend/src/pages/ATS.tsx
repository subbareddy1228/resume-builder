import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { scoreResume, ATSResult } from "../api/resumes";

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "#3E5C46" : score >= 40 ? "#C8744A" : "#b91c1c";
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="#e5e0d8" strokeWidth="12"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="70" y="70"
          textAnchor="middle" dominantBaseline="central"
          fontSize="28" fontWeight="bold" fill={color}
          fontFamily="Fraunces, serif"
        >
          {score}
        </text>
        <text
          x="70" y="95"
          textAnchor="middle"
          fontSize="11" fill="#9ca3af"
          fontFamily="Inter, sans-serif"
        >
          / 100
        </text>
      </svg>
      <p className="font-body text-sm font-medium mt-1" style={{ color }}>
        {score >= 70 ? "Strong match" : score >= 40 ? "Partial match" : "Weak match"}
      </p>
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
    } catch {
      setError("Couldn't score the resume. Make sure it has content.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 px-8 py-4 flex items-center gap-4 bg-white">
        <button
          onClick={() => navigate(`/editor/${id}`)}
          className="font-body text-sm text-ink/50 hover:text-ink transition"
        >
          ← Back to Editor
        </button>
        <span className="font-display text-xl text-ink">ATS Score</span>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <h1 className="font-display text-3xl text-ink mb-2">
          Check ATS Score
        </h1>
        <p className="font-body text-sm text-ink/60 mb-8">
          Paste a job description below to see how well your resume matches it.
        </p>

        <label className="block font-body text-xs uppercase tracking-wide text-ink/50 mb-2">
          Job Description
        </label>
        <textarea
          rows={10}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="w-full border border-ink/20 rounded-sm px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none mb-4"
          placeholder="Paste the full job description here..."
        />

        {error && (
          <p className="font-body text-sm text-clay mb-4">{error}</p>
        )}

        <button
          onClick={handleScore}
          disabled={loading || !jdText.trim()}
          className="bg-moss text-paper font-body text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-60 mb-10"
        >
          {loading ? "Analysing..." : "Analyse Resume"}
        </button>

        {result && (
          <div className="space-y-8">
            {/* Score gauge */}
            <div className="bg-white border border-ink/10 rounded-sm p-8 flex flex-col items-center">
              <ScoreGauge score={result.score} />
              <p className="font-body text-sm text-ink/50 mt-3">
                {result.matched_keywords.length} of {result.total_keywords} keywords matched
              </p>
            </div>

            {/* Matched keywords */}
            {result.matched_keywords.length > 0 && (
              <div className="bg-white border border-ink/10 rounded-sm p-6">
                <h2 className="font-display text-lg text-ink mb-4">
                  Matched Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.matched_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-moss/10 text-moss text-xs font-medium px-3 py-1 rounded-full border border-moss/20"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {result.missing_keywords.length > 0 && (
              <div className="bg-white border border-ink/10 rounded-sm p-6">
                <h2 className="font-display text-lg text-ink mb-1">
                  Missing Keywords
                </h2>
                <p className="font-body text-sm text-ink/50 mb-4">
                  Add these to your resume to improve your match score.
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-clay/10 text-clay text-xs font-medium px-3 py-1 rounded-full border border-clay/20"
                    >
                      ✕ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA back to editor */}
            <div className="text-center">
              <button
                onClick={() => navigate(`/editor/${id}`)}
                className="font-body text-sm text-moss font-medium hover:underline"
              >
                Go back to editor and improve your resume →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}