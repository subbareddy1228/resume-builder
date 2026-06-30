import React, { useState, useEffect } from "react";
import { listVersions, restoreVersion, ResumeVersion } from "../api/resumes";

interface Props {
  resumeId: string;
  onRestore: (content: any) => void;
  onClose: () => void;
}

export default function VersionHistory({ resumeId, onRestore, onClose }: Props) {
  const [versions, setVersions]     = useState<ResumeVersion[]>([]);
  const [loading, setLoading]       = useState(true);
  const [restoring, setRestoring]   = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<ResumeVersion | null>(null);

  useEffect(() => {
    listVersions(resumeId)
      .then((v) => setVersions([...v].reverse())) // newest first
      .finally(() => setLoading(false));
  }, [resumeId]);

  async function handleRestore(version: ResumeVersion) {
    if (!confirm(`Restore to Version ${version.version_number}? Current content will be saved as a new version.`)) return;
    setRestoring(version.id);
    try {
      const updated = await restoreVersion(resumeId, version.id);
      onRestore(updated.content);
      onClose();
    } catch {
      alert("Restore failed. Please try again.");
    } finally {
      setRestoring(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function previewContact(content: any) {
    const c = content?.contact;
    if (!c) return "Empty resume";
    return [c.name, c.email].filter(Boolean).join(" · ") || "No contact info";
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-96 h-full bg-white border-l border-ink/[0.08] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-ink/[0.07] flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-ink">Version History</h2>
            <p className="font-body text-xs text-ink/40 mt-0.5">
              {versions.length} version{versions.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-ink/5">×</button>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="font-body text-sm text-ink/40 p-6">Loading versions...</p>
          ) : versions.length === 0 ? (
            <p className="font-body text-sm text-ink/40 p-6">No versions saved yet. Start editing to create versions.</p>
          ) : (
            <div className="divide-y divide-ink/[0.05]">
              {versions.map((v, i) => (
                <div
                  key={v.id}
                  className={`px-6 py-4 hover:bg-paper/60 transition-colors cursor-pointer ${
                    previewing?.id === v.id ? "bg-moss/[0.04] border-l-2 border-moss" : ""
                  }`}
                  onClick={() => setPreviewing(previewing?.id === v.id ? null : v)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="pill-moss">
                          v{v.version_number}
                        </span>
                        {i === 0 && (
                          <span className="pill-neutral">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-ink/50">{formatDate(v.created_at)}</p>
                      <p className="font-body text-xs text-ink/40 mt-1 truncate">{previewContact(v.content_snapshot)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRestore(v); }}
                      disabled={restoring === v.id || i === 0}
                      className="shrink-0 font-body text-xs text-moss border border-moss/25 px-3 py-1.5 rounded-lg hover:bg-moss/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {restoring === v.id ? "..." : i === 0 ? "Current" : "Restore"}
                    </button>
                  </div>

                  {/* Preview snippet */}
                  {previewing?.id === v.id && (
                    <div className="mt-3 bg-paper rounded-lg p-3.5 border border-ink/[0.07]">
                      <p className="font-body text-xs font-semibold text-ink mb-1">Preview</p>
                      {v.content_snapshot?.summary ? (
                        <p className="font-body text-xs text-ink/60 line-clamp-3">
                          {v.content_snapshot.summary}
                        </p>
                      ) : (
                        <p className="font-body text-xs text-ink/40 italic">No summary in this version</p>
                      )}
                      <div className="mt-2 flex gap-3 text-xs text-ink/40 font-body">
                        <span>{v.content_snapshot?.experience?.length || 0} experience</span>
                        <span>{v.content_snapshot?.skills?.length || 0} skills</span>
                        <span>{v.content_snapshot?.education?.length || 0} education</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ink/[0.07]">
          <p className="font-body text-xs text-ink/40 text-center">
            Versions are saved automatically on every edit
          </p>
        </div>
      </div>
    </div>
  );
}
