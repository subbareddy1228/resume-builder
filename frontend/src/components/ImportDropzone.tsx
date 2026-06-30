import React, { useState, useRef, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { importResumeFile } from "../api/import";

interface Props {
  onError: (msg: string) => void;
}

export default function ImportDropzone({ onError }: Props) {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndImport(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      onError("Only PDF and DOCX files are supported for import.");
      return;
    }
    setFileName(file.name);
    setImporting(true);
    importResumeFile(file)
      .then((resume) => {
        navigate(`/editor/${resume.id}`);
      })
      .catch((e) => {
        const msg = e?.response?.data?.detail || "Couldn't import this resume. Try again.";
        onError(msg);
      })
      .finally(() => {
        setImporting(false);
        setFileName(null);
      });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndImport(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndImport(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !importing && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed px-6 py-5 cursor-pointer transition-all duration-150 ${
        dragging
          ? "border-moss bg-moss/[0.06] scale-[1.01]"
          : importing
          ? "border-moss/30 bg-moss/[0.03] cursor-wait"
          : "border-ink/15 hover:border-moss/40 hover:bg-moss/[0.02]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          importing ? "bg-moss/15" : "bg-moss/10"
        }`}>
          {importing ? (
            <div className="w-4 h-4 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
          ) : (
            <span className="text-moss text-lg">⇪</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-semibold text-ink">
            {importing ? `Parsing ${fileName}...` : "Import an existing resume"}
          </p>
          <p className="font-body text-xs text-ink/45 mt-0.5">
            {importing
              ? "Claude is reading your resume and filling in the editor — this can take up to a minute."
              : "Drag a PDF or DOCX here, or click to browse. We'll fill in the editor for you."}
          </p>
        </div>
      </div>
    </div>
  );
}
