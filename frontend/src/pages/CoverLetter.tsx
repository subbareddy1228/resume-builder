import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResume, streamCoverLetter } from "../api/resumes";

type Tone = "professional" | "conversational" | "confident";

const TONES: { id: Tone; label: string; description: string }[] = [
  { id: "professional", label: "Professional", description: "Formal and polished" },
  { id: "conversational", label: "Conversational", description: "Warm and approachable" },
  { id: "confident", label: "Confident", description: "Bold and assertive" },
];

export default function CoverLetter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resumeTitle, setResumeTitle] = useState("");
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [letter, setLetter] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getResume(id).then((r) => setResumeTitle(r.title));
  }, [id]);

  function handleGenerate() {
    if (!id || !jd.trim()) return;
    setLetter("");
    setError(null);
    setStreaming(true);

    streamCoverLetter(
      id, jd, tone,
      (chunk) => setLetter((prev) => prev + chunk),
      () => setStreaming(false),
      (err) => { setError(err); setStreaming(false); }
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${resumeTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/[0.06] px-8 py-4 flex items-center gap-4 bg-white/80 backdrop-blur sticky top-0 z-10">
        <button onClick={() => navigate(`/editor/${id}`)} className="btn-ghost">
          ← Back to Editor
        </button>
        <span className="font-display text-xl text-ink">Cover Letter</span>
        {resumeTitle && (
          <span className="font-body text-sm text-ink/40">— {resumeTitle}</span>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8 heading-rule inline-block">
          <h1 className="font-display text-3xl text-ink mb-2">Generate Cover Letter</h1>
          <p className="font-body text-sm text-ink/55 max-w-md">
            Claude writes a tailored cover letter using your resume and the job description.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">

          {/* Left — inputs */}
          <div className="space-y-6">

            <div>
              <label className="field-label !mb-3">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`text-left rounded-xl p-3.5 transition-all duration-150 ${
                      tone === t.id
                        ? "border-2 border-moss bg-moss/[0.06] shadow-sm"
                        : "border border-ink/10 hover:border-moss/40 bg-white hover:shadow-sm"
                    }`}
                  >
                    <p className={`font-body text-sm font-semibold ${
                      tone === t.id ? "text-moss" : "text-ink"
                    }`}>
                      {t.label}
                    </p>
                    <p className="font-body text-xs text-ink/50 mt-0.5">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Job Description</label>
              <textarea
                rows={14}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="field-textarea"
                placeholder="Paste the full job description here..."
              />
            </div>

            {error && (
              <p className="font-body text-sm text-clay bg-clay/5 border border-clay/15 rounded-lg px-3 py-2">{error}</p>
            )}

            <button onClick={handleGenerate} disabled={streaming || !jd.trim()} className="btn-primary w-full">
              {streaming ? "Writing..." : "✦ Generate Cover Letter"}
            </button>
          </div>

          {/* Right — output */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="field-label !mb-0 flex items-center gap-1.5">
                Cover Letter {streaming && <span className="text-moss">●</span>}
              </label>
              {letter && !streaming && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="font-body text-xs text-moss border border-moss/25 px-3 py-1.5 rounded-lg hover:bg-moss/5 transition-colors"
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="font-body text-xs text-ink/60 border border-ink/15 px-3 py-1.5 rounded-lg hover:border-ink/30 transition-colors"
                  >
                    ↓ Download
                  </button>
                </div>
              )}
            </div>

            <div className={`flex-1 min-h-[460px] rounded-xl p-5 font-body text-sm leading-relaxed whitespace-pre-wrap ${
              letter ? "surface-card text-ink" : "border border-dashed border-ink/15 bg-white/60 text-ink/30"
            }`}>
              {letter || (streaming ? "" : "Your cover letter will appear here...")}
              {streaming && <span className="animate-pulse text-moss">▋</span>}
            </div>

            {letter && !streaming && (
              <p className="font-body text-xs text-ink/40 mt-2 text-right">
                {letter.split(/\s+/).length} words
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
