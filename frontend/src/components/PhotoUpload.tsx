import React, { useState, useRef, DragEvent } from "react";
import { uploadPhoto, deletePhoto } from "../api/import";

interface Props {
  resumeId: string;
  photoUrl?: string;
  onChange: (url: string | undefined) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PhotoUpload({ resumeId, photoUrl, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndUpload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are supported.");
      return;
    }
    setError(null);
    setUploading(true);
    uploadPhoto(resumeId, file)
      .then((res) => onChange(res.photo_url))
      .catch((e) => setError(e?.response?.data?.detail || "Upload failed. Try again."))
      .finally(() => setUploading(false));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    deletePhoto(resumeId).then(() => onChange(undefined)).catch(() => setError("Couldn't remove photo."));
  }

  const fullPhotoUrl = photoUrl
    ? photoUrl.startsWith("http") ? photoUrl : `${API_URL}${photoUrl}`
    : null;

  return (
    <div className="mb-4">
      <label className="field-label">Profile photo (optional)</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex items-center gap-4 rounded-xl border-2 border-dashed px-4 py-3.5 cursor-pointer transition-all duration-150 ${
          dragging
            ? "border-moss bg-moss/[0.06]"
            : "border-ink/15 hover:border-moss/40 hover:bg-moss/[0.02]"
        }`}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} className="hidden" />

        <div className="w-12 h-12 rounded-full overflow-hidden bg-ink/5 flex items-center justify-center shrink-0 border border-ink/10">
          {uploading ? (
            <div className="w-4 h-4 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
          ) : fullPhotoUrl ? (
            <img src={fullPhotoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-ink/30 text-lg">👤</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-medium text-ink">
            {uploading ? "Uploading..." : fullPhotoUrl ? "Photo added" : "Drag a photo here or click to browse"}
          </p>
          <p className="font-body text-xs text-ink/40 mt-0.5">
            Shows on templates with an avatar, like Creative. JPEG, PNG, or WEBP.
          </p>
        </div>

        {fullPhotoUrl && !uploading && (
          <button onClick={handleRemove} className="font-body text-xs text-clay font-medium hover:underline shrink-0">
            Remove
          </button>
        )}
      </div>
      {error && <p className="font-body text-xs text-clay mt-1.5">{error}</p>}
    </div>
  );
}
