import React from "react";
import { TEMPLATES, TemplateId } from "../types/auth";

interface Props {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`text-left border rounded-sm p-3 transition ${
            selected === t.id
              ? "border-moss bg-moss/5 ring-1 ring-moss"
              : "border-ink/15 hover:border-moss/40 bg-white"
          }`}
        >
          {/* Mini preview thumbnail */}
          <div className={`w-full h-16 rounded-sm mb-2 flex flex-col justify-center px-2 gap-1 ${
            t.id === "classic" ? "bg-paper" :
            t.id === "modern" ? "bg-slate-50" :
            t.id === "minimal" ? "bg-white border border-ink/10" :
            "bg-ink"
          }`}>
            <div className={`h-2 rounded-full w-2/3 mx-auto ${
              t.id === "bold" ? "bg-paper" : "bg-ink/30"
            }`} />
            <div className={`h-1 rounded-full w-1/2 mx-auto ${
              t.id === "bold" ? "bg-paper/60" : "bg-ink/15"
            }`} />
            <div className={`h-1 rounded-full w-3/4 mx-auto ${
              t.id === "bold" ? "bg-paper/40" : "bg-ink/10"
            }`} />
          </div>

          <p className={`font-body text-sm font-medium ${
            selected === t.id ? "text-moss" : "text-ink"
          }`}>
            {t.name}
          </p>
          <p className="font-body text-xs text-ink/50 mt-0.5">{t.description}</p>

          {selected === t.id && (
            <p className="font-body text-xs text-moss mt-1 font-medium">✓ Selected</p>
          )}
        </button>
      ))}
    </div>
  );
}