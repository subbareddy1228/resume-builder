import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveJob, matchResumeToJobs, MatchResult } from "../api/resumes";

function MatchBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "#3E5C46" : score >= 40 ? "#C8744A" : "#b91c1c";
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-display text-xl font-semibold" style={{ color }}>
          {score}%
        </span>
        <span className="font-body text-xs text-ink/40">
          {score >= 70 ? "Strong match" : score >= 40 ? "Partial match" : "Weak match"}
        </span>
      </div>
      <div className="w-full bg-ink/[0.07] rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function JobMatch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState("");
  const [jobText, setJobText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [matchError, setMatchError] = useState<string | null>(null);

  async function handleSaveJob() {
    if (!jobTitle.trim() || !jobText.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveJob(jobTitle, jobText);
      setSaved(true);
      setJobTitle("");
      setJobText("");
    } catch {
      setSaveError("Couldn't save the job. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMatch() {
    if (!id) return;
    setMatching(true);
    setMatchError(null);
    try {
      const res = await matchResumeToJobs(id);
      setResults(res);
    } catch (err: any) {
      setMatchError(
        err.response?.data?.detail || "Matching failed. Make sure you have saved jobs and your resume has content."
      );
    } finally {
      setMatching(false);
    }
  }

  const sectionTitle = "font-display text-lg text-ink";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/[0.06] px-8 py-4 flex items-center gap-4 bg-white/80 backdrop-blur sticky top-0 z-10">
        <button onClick={() => navigate(`/editor/${id}`)} className="btn-ghost">
          ← Back to Editor
        </button>
        <span className="font-display text-xl text-ink">Job Matching</span>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12 space-y-8">
        <div className="heading-rule inline-block">
          <h1 className="font-display text-3xl text-ink mb-2">
            Match Resume to Jobs
          </h1>
        </div>
        <p className="font-body text-sm text-ink/55 -mt-2">
          Save job descriptions, then match your resume against them using
          AI-powered semantic similarity.
        </p>

        {/* Save job */}
        <section className="surface-card p-6">
          <div className="heading-rule">
            <h2 className={sectionTitle}>Save a Job Description</h2>
          </div>

          <label className="field-label">Job Title</label>
          <input
            className="field-input mb-4"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer at Stripe"
          />

          <label className="field-label">Job Description</label>
          <textarea
            rows={8}
            className="field-textarea mb-4"
            value={jobText}
            onChange={(e) => { setJobText(e.target.value); setSaved(false); }}
            placeholder="Paste the full job description here..."
          />

          {saveError && (
            <p className="font-body text-sm text-clay mb-3 bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">{saveError}</p>
          )}

          <button
            onClick={handleSaveJob}
            disabled={saving || !jobTitle.trim() || !jobText.trim()}
            className="btn-primary"
          >
            {saving ? "Saving..." : saved ? "✓ Job Saved" : "Save Job"}
          </button>

          {saved && (
            <p className="font-body text-sm text-moss mt-3">
              Job saved. Save more jobs or run the match below.
            </p>
          )}
        </section>

        {/* Run match */}
        <section className="surface-card p-6">
          <div className="heading-rule">
            <h2 className={sectionTitle}>Run Match</h2>
          </div>
          <p className="font-body text-sm text-ink/55 mb-4">
            Compare your resume against all saved jobs using semantic similarity.
            Results are ranked by match score.
          </p>

          {matchError && (
            <p className="font-body text-sm text-clay mb-4 bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">{matchError}</p>
          )}

          <button onClick={handleMatch} disabled={matching} className="btn-primary">
            {matching ? "Matching..." : "Match My Resume"}
          </button>
        </section>

        {/* Results */}
        {results.length > 0 && (
          <section>
            <div className="heading-rule inline-block">
              <h2 className="font-display text-xl text-ink">Match Results</h2>
            </div>
            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={result.job_id} className="surface-card surface-card-hover p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-body font-semibold text-ink">
                        {result.job_title}
                      </p>
                      <p className="font-body text-xs text-ink/40 mt-0.5">
                        #{i + 1} ranked match
                      </p>
                    </div>
                  </div>
                  <MatchBar score={result.match_score} />
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button onClick={() => navigate(`/editor/${id}`)} className="font-body text-sm text-moss font-semibold hover:underline">
                Go back to editor and improve your resume →
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
