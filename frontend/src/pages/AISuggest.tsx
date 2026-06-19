import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResume } from "../api/resumes";
import { streamRewrite, streamBullet } from "../api/resumes";
import { ResumeContent } from "../types/auth";
import { useEffect } from "react";

export default function AISuggest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [jd, setJd] = useState("");
  const [jdSaved, setJdSaved] = useState(false);

  const [summaryResult, setSummaryResult] = useState("");
  const [summaryStreaming, setSummaryStreaming] = useState(false);

  const [bulletResults, setBulletResults] = useState<Record<string, string>>({});
  const [bulletStreaming, setBulletStreaming] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    getResume(id).then((r) => setContent(r.content as ResumeContent));
  }, [id]);

  function handleSummaryRewrite() {
    if (!id || !content || !jd.trim()) return;
    setSummaryResult("");
    setSummaryStreaming(true);
    streamRewrite(
      id, "summary", content.summary, jd,
      (chunk) => setSummaryResult((prev) => prev + chunk),
      () => setSummaryStreaming(false),
      (err) => { setSummaryResult(err); setSummaryStreaming(false); }
    );
  }

  function handleBulletRewrite(expIndex: number, bulletIndex: number) {
    if (!id || !content || !jd.trim()) return;
    const exp = content.experience[expIndex];
    const bullet = exp.bullets[bulletIndex];
    const key = `${expIndex}-${bulletIndex}`;
    setBulletResults((prev) => ({ ...prev, [key]: "" }));
    setBulletStreaming((prev) => ({ ...prev, [key]: true }));
    streamBullet(
      id, bullet, exp.role, jd,
      (chunk) => setBulletResults((prev) => ({ ...prev, [key]: (prev[key] || "") + chunk })),
      () => setBulletStreaming((prev) => ({ ...prev, [key]: false })),
      (err) => {
        setBulletResults((prev) => ({ ...prev, [key]: err }));
        setBulletStreaming((prev) => ({ ...prev, [key]: false }));
      }
    );
  }

  const inputCls = "w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss";
  const sectionTitle = "font-display text-lg text-ink mb-4 pb-2 border-b border-ink/10";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 px-8 py-4 flex items-center gap-4 bg-white">
        <button
          onClick={() => navigate(`/editor/${id}`)}
          className="font-body text-sm text-ink/50 hover:text-ink transition"
        >
          ← Back to Editor
        </button>
        <span className="font-display text-xl text-ink">AI Suggestions</span>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12 space-y-10">

        {/* Job description input */}
        <section className="bg-white border border-ink/10 rounded-sm p-6">
          <h2 className={sectionTitle}>Target Job Description</h2>
          <p className="font-body text-sm text-ink/50 mb-3">
            Paste the job description so Claude can tailor suggestions to it.
          </p>
          <textarea
            rows={6}
            value={jd}
            onChange={(e) => { setJd(e.target.value); setJdSaved(false); }}
            className={`${inputCls} resize-none mb-3`}
            placeholder="Paste job description here..."
          />
          <button
            onClick={() => setJdSaved(true)}
            disabled={!jd.trim()}
            className="bg-moss text-paper font-body text-sm px-4 py-2 rounded-sm hover:bg-moss/90 transition disabled:opacity-50"
          >
            {jdSaved ? "✓ Saved" : "Save Job Description"}
          </button>
        </section>

        {!jdSaved && (
          <p className="font-body text-sm text-ink/40 text-center">
            Save a job description above to unlock AI suggestions.
          </p>
        )}

        {jdSaved && content && (
          <>
            {/* Summary rewrite */}
            <section className="bg-white border border-ink/10 rounded-sm p-6">
              <h2 className={sectionTitle}>Summary</h2>

              <div className="mb-4">
                <p className="font-body text-xs uppercase tracking-wide text-ink/40 mb-1">Current</p>
                <p className="font-body text-sm text-ink/70 bg-paper rounded-sm p-3">
                  {content.summary || <span className="italic text-ink/30">No summary yet</span>}
                </p>
              </div>

              <button
                onClick={handleSummaryRewrite}
                disabled={summaryStreaming || !content.summary}
                className="bg-moss text-paper font-body text-sm px-4 py-2 rounded-sm hover:bg-moss/90 transition disabled:opacity-50 mb-4"
              >
                {summaryStreaming ? "Writing..." : "✦ Rewrite with Claude"}
              </button>

              {(summaryResult || summaryStreaming) && (
                <div>
                  <p className="font-body text-xs uppercase tracking-wide text-ink/40 mb-1">
                    Suggestion {summaryStreaming && <span className="text-moss">●</span>}
                  </p>
                  <div className="font-body text-sm text-ink bg-moss/5 border border-moss/20 rounded-sm p-3 min-h-[60px] whitespace-pre-wrap">
                    {summaryResult}
                    {summaryStreaming && <span className="animate-pulse">▋</span>}
                  </div>
                </div>
              )}
            </section>

            {/* Bullet rewrites */}
            {content.experience.length > 0 && (
              <section className="bg-white border border-ink/10 rounded-sm p-6">
                <h2 className={sectionTitle}>Experience Bullets</h2>
                <div className="space-y-6">
                  {content.experience.map((exp, ei) => (
                    <div key={exp.id}>
                      <p className="font-body text-sm font-medium text-ink mb-3">
                        {exp.role || "Role"} @ {exp.company || "Company"}
                      </p>
                      <div className="space-y-4">
                        {exp.bullets.filter(Boolean).map((bullet, bi) => {
                          const key = `${ei}-${bi}`;
                          const streaming = bulletStreaming[key];
                          const result = bulletResults[key];
                          return (
                            <div key={bi} className="border border-ink/10 rounded-sm p-4">
                              <p className="font-body text-xs uppercase tracking-wide text-ink/40 mb-1">Current</p>
                              <p className="font-body text-sm text-ink/70 mb-3">{bullet}</p>
                              <button
                                onClick={() => handleBulletRewrite(ei, bi)}
                                disabled={streaming}
                                className="text-moss font-body text-xs font-medium hover:underline disabled:opacity-50 mb-3"
                              >
                                {streaming ? "Writing..." : "✦ Improve this bullet"}
                              </button>
                              {(result || streaming) && (
                                <div>
                                  <p className="font-body text-xs uppercase tracking-wide text-ink/40 mb-1">
                                    Suggestion {streaming && <span className="text-moss">●</span>}
                                  </p>
                                  <div className="font-body text-sm text-ink bg-moss/5 border border-moss/20 rounded-sm p-3 whitespace-pre-wrap">
                                    {result}
                                    {streaming && <span className="animate-pulse">▋</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}