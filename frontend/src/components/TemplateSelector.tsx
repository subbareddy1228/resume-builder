import React from "react";
import { TEMPLATES, TemplateId, Template } from "../types/auth";

interface Props {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
}

function TemplateThumbnail({ t }: { t: Template }) {
  // Each thumbnail is a mini paper mockup styled per template
  const isSelected = false; // handled by parent border

  if (t.id === "classic") {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden" style={{ background: t.bg, fontFamily: "Georgia, serif" }}>
        {/* Header: centered name + thin rule */}
        <div className="flex flex-col items-center pt-2 pb-1 px-2">
          <div style={{ width: "55%", height: 5, background: t.textColor, opacity: 0.85, borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: "75%", height: 2, background: t.textColor, opacity: 0.25, borderRadius: 1 }} />
        </div>
        {/* Two columns of body lines */}
        <div className="px-3 pt-1 space-y-1">
          {[70, 90, 60, 80].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 2, background: t.textColor, opacity: i === 0 ? 0.5 : 0.15, borderRadius: 1 }} />
          ))}
        </div>
        {/* Section label */}
        <div className="px-3 pt-2 flex items-center gap-1">
          <div style={{ width: 22, height: 2, background: t.accent, opacity: 0.7, borderRadius: 1 }} />
          <div style={{ width: "45%", height: 2, background: t.textColor, opacity: 0.2, borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  if (t.id === "modern") {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden flex" style={{ background: t.bg }}>
        {/* Left accent bar */}
        <div style={{ width: 28, background: t.accent, flexShrink: 0, padding: "6px 4px", display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.8)", borderRadius: 1 }} />
          <div style={{ width: "80%", height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }} />
          <div style={{ width: "90%", height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }} />
          <div style={{ width: "70%", height: 2, background: "rgba(255,255,255,0.3)", borderRadius: 1, marginTop: 4 }} />
          <div style={{ width: "85%", height: 2, background: "rgba(255,255,255,0.3)", borderRadius: 1 }} />
        </div>
        {/* Right content */}
        <div className="flex-1 p-2 space-y-1.5">
          <div style={{ width: "60%", height: 4, background: t.textColor, opacity: 0.8, borderRadius: 1 }} />
          <div style={{ width: "40%", height: 2, background: t.accent, opacity: 0.6, borderRadius: 1 }} />
          <div style={{ width: "85%", height: 2, background: t.textColor, opacity: 0.15, borderRadius: 1, marginTop: 4 }} />
          <div style={{ width: "70%", height: 2, background: t.textColor, opacity: 0.15, borderRadius: 1 }} />
          <div style={{ width: "80%", height: 2, background: t.textColor, opacity: 0.15, borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  if (t.id === "minimal") {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden" style={{ background: t.bg, border: "1px solid #E5E7EB" }}>
        <div className="p-3 space-y-1.5">
          <div style={{ width: "50%", height: 5, background: t.textColor, opacity: 0.9, borderRadius: 1 }} />
          <div style={{ width: "35%", height: 2, background: t.textColor, opacity: 0.3, borderRadius: 1 }} />
          {/* hairline divider */}
          <div style={{ width: "100%", height: 1, background: t.textColor, opacity: 0.1, margin: "4px 0" }} />
          {[80, 65, 75, 55].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 2, background: t.textColor, opacity: 0.12, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  if (t.id === "bold") {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden" style={{ background: t.bg }}>
        {/* Dark header block */}
        <div style={{ background: "#1F2937", padding: "8px 10px" }}>
          <div style={{ width: "55%", height: 5, background: t.accent, borderRadius: 1, marginBottom: 3 }} />
          <div style={{ width: "70%", height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }} />
        </div>
        {/* Body */}
        <div className="p-2 space-y-1.5">
          <div style={{ width: 30, height: 2, background: t.accent, opacity: 0.8, borderRadius: 1 }} />
          {[85, 70, 80, 60].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 2, background: "#6B7280", opacity: 0.5, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  if (t.id === "executive") {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden" style={{ background: t.bg }}>
        <div className="p-2">
          {/* Double rule header */}
          <div style={{ width: "100%", height: 2, background: t.accent, marginBottom: 1, borderRadius: 1 }} />
          <div style={{ width: "100%", height: 1, background: t.accent, opacity: 0.4, marginBottom: 4, borderRadius: 1 }} />
          <div style={{ width: "50%", height: 4, background: t.textColor, opacity: 0.8, borderRadius: 1, margin: "0 auto 3px" }} />
          <div style={{ width: "35%", height: 2, background: t.textColor, opacity: 0.3, borderRadius: 1, margin: "0 auto 6px" }} />
          {/* Double rule again */}
          <div style={{ width: "100%", height: 1, background: t.textColor, opacity: 0.2, marginBottom: 1, borderRadius: 1 }} />
          <div className="space-y-1 pt-1">
            {[70, 85, 60].map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: 2, background: t.textColor, opacity: 0.15, borderRadius: 1 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (t.id === "creative") {
    return (
      <div className="w-full h-24 rounded-lg overflow-hidden flex" style={{ background: "#fff" }}>
        {/* Colored left panel */}
        <div style={{ width: 32, background: t.accent, flexShrink: 0, padding: "6px 5px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          {/* Avatar circle */}
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.3)", border: "1.5px solid rgba(255,255,255,0.6)" }} />
          <div style={{ width: "90%", height: 2, background: "rgba(255,255,255,0.6)", borderRadius: 1 }} />
          <div style={{ width: "75%", height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }} />
          <div style={{ width: "80%", height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }} />
        </div>
        {/* Right content */}
        <div className="flex-1 p-2">
          <div style={{ width: "55%", height: 4, background: t.textColor, opacity: 0.8, borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: "40%", height: 2, background: t.accent, opacity: 0.5, borderRadius: 1, marginBottom: 5 }} />
          {[80, 65, 75].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 2, background: t.textColor, opacity: 0.15, borderRadius: 1, marginBottom: 3 }} />
          ))}
          {/* Skill chips */}
          <div className="flex gap-1 mt-1">
            {[22, 28, 20].map((w, i) => (
              <div key={i} style={{ width: w, height: 6, background: t.accent, opacity: 0.2, borderRadius: 3 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TEMPLATES.map((t) => {
        const isActive = selected === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`text-left rounded-xl overflow-hidden transition-all ${
              isActive
                ? "ring-2 ring-offset-2 ring-moss shadow-md scale-[1.02]"
                : "ring-1 ring-ink/10 hover:ring-moss/40 hover:shadow-sm hover:scale-[1.01]"
            }`}
          >
            {/* Visual thumbnail */}
            <TemplateThumbnail t={t} />

            {/* Label strip */}
            <div className={`px-2.5 py-2 flex items-center justify-between ${isActive ? "bg-moss/5" : "bg-white"}`}>
              <div>
                <p className={`font-body text-xs font-semibold ${isActive ? "text-moss" : "text-ink"}`}>
                  {t.name}
                </p>
                <p className="font-body text-[10px] text-ink/40 leading-tight mt-0.5">{t.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-moss text-white" : "bg-ink/8 text-ink/50"
                }`}>
                  {isActive ? "✓ Active" : t.tag}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
