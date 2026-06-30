import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { importLinkedInText } from "../api/import";

interface Props {
  onClose: () => void;
}

export default function LinkedInImportModal({ onClose }: Props) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (text.trim().length < 50) {
      setError("Paste your full profile text — that looks too short.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resume = await importLinkedInText(text);
      navigate(`/editor/${resume.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Import failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-sm max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg text-ink">Import from LinkedIn</h2>
          <button onClick={onClose} className="font-body text-ink/40 hover:text-ink">✕</button>
        </div>

        <p className="font-body text-sm text-ink/60 mb-4">
          Open your LinkedIn profile, select all the text on the page (Ctrl/Cmd+A), copy it,
          and paste it below. Claude will extract your experience, education, and skills automatically.
        </p>

        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-ink/20 rounded-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none mb-3"
          placeholder="Paste your LinkedIn profile text here..."
        />

        {error && <p className="font-body text-sm text-clay mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={loading || !text.trim()}
            className="bg-moss text-paper font-body text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-50"
          >
            {loading ? "Parsing with Claude..." : "Import Profile"}
          </button>
          <button
            onClick={onClose}
            className="font-body text-sm text-ink/50 hover:text-ink px-5 py-2.5"
          >
            Cancel
          </button>
        </div>

        <p className="font-body text-xs text-ink/30 mt-4">
          Tip: you can also export your LinkedIn profile as a PDF (Profile → Resources → Save to PDF)
          and use the regular file import instead — it works the same way.
        </p>
      </div>
    </div>
  );
}