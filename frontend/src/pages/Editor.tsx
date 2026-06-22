import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResume, updateResume, downloadPDF, updateTemplate } from "../api/resumes";
import { ResumeContent } from "../types/auth";
import TemplateSelector from "../components/TemplateSelector";
import ResumePreview from "../components/ResumePreview";
import { TemplateId } from "../types/auth";


const EMPTY_CONTENT: ResumeContent = {
  contact: { name: "", email: "", phone: "", location: "", linkedin: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  internships: [],
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Resume");
  const [content, setContent] = useState<ResumeContent>(EMPTY_CONTENT);
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const isFirstLoad = useRef(true);

  const debouncedContent = useDebounce(content, 1500);
  const debouncedTitle = useDebounce(title, 1500);

  useEffect(() => {
    if (!id) return;
    getResume(id)
      .then((r) => {
        setTitle(r.title);
        setTemplate((r.template as TemplateId) || "classic");
        const c = r.content as ResumeContent;
        setContent({
          ...EMPTY_CONTENT,
          ...c,
          projects: c.projects || [],
          certifications: c.certifications || [],
          internships: c.internships || [],
        });
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    if (!id) return;
    setSaving(true);
    updateResume(id, { title: debouncedTitle, content: debouncedContent })
      .then(() => setSaveMsg("Saved ✓"))
      .catch(() => setSaveMsg("Save failed"))
      .finally(() => { setSaving(false); setTimeout(() => setSaveMsg(""), 2000); });
  }, [debouncedContent, debouncedTitle]);

  async function handleManualSave() {
    if (!id) return;
    setSaving(true);
    try {
      await updateResume(id, { title, content });
      setSaveMsg("Saved ✓");
    } catch {
      setSaveMsg("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2000);
    }
  }

  async function handleExport() {
    if (!id) return;
    setExporting(true);
    try {
      await downloadPDF(id, title);
    } catch {
      alert("PDF export failed. Make sure your resume has content.");
    } finally {
      setExporting(false);
    }
  }

  async function handleTemplateChange(newTemplate: TemplateId) {
    setTemplate(newTemplate);
    if (!id) return;
    try {
      await updateTemplate(id, newTemplate);
    } catch {
      console.error("Failed to save template");
    }
  }

  function setContact(field: string, value: string) {
    setContent((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }

  // Experience
  function addExperience() {
    setContent((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: crypto.randomUUID(), company: "", role: "", start: "", end: "", bullets: [""] }],
    }));
  }
  function updateExperience(i: number, field: string, value: string) {
    setContent((prev) => { const exp = [...prev.experience]; exp[i] = { ...exp[i], [field]: value }; return { ...prev, experience: exp }; });
  }
  function updateBullet(ei: number, bi: number, value: string) {
    setContent((prev) => { const exp = [...prev.experience]; const bullets = [...exp[ei].bullets]; bullets[bi] = value; exp[ei] = { ...exp[ei], bullets }; return { ...prev, experience: exp }; });
  }
  function addBullet(ei: number) {
    setContent((prev) => { const exp = [...prev.experience]; exp[ei] = { ...exp[ei], bullets: [...exp[ei].bullets, ""] }; return { ...prev, experience: exp }; });
  }
  function removeExperience(i: number) {
    setContent((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
  }

  // Education
  function addEducation() {
    setContent((prev) => ({ ...prev, education: [...prev.education, { id: crypto.randomUUID(), school: "", degree: "", year: "" }] }));
  }
  function updateEducation(i: number, field: string, value: string) {
    setContent((prev) => { const edu = [...prev.education]; edu[i] = { ...edu[i], [field]: value }; return { ...prev, education: edu }; });
  }
  function removeEducation(i: number) {
    setContent((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  }

  // Skills
  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    const incoming = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    setContent((prev) => ({ ...prev, skills: [...prev.skills, ...incoming.filter((s) => !prev.skills.includes(s))] }));
    setNewSkill("");
  }
  function removeSkill(i: number) {
    setContent((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));
  }

  // Projects
  function addProject() {
    setContent((prev) => ({ ...prev, projects: [...prev.projects, { id: crypto.randomUUID(), name: "", description: "", tech: "", link: "" }] }));
  }
  function updateProject(i: number, field: string, value: string) {
    setContent((prev) => { const p = [...prev.projects]; p[i] = { ...p[i], [field]: value }; return { ...prev, projects: p }; });
  }
  function removeProject(i: number) {
    setContent((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));
  }

  // Certifications
  function addCertification() {
    setContent((prev) => ({ ...prev, certifications: [...prev.certifications, { id: crypto.randomUUID(), name: "", issuer: "", year: "" }] }));
  }
  function updateCertification(i: number, field: string, value: string) {
    setContent((prev) => { const c = [...prev.certifications]; c[i] = { ...c[i], [field]: value }; return { ...prev, certifications: c }; });
  }
  function removeCertification(i: number) {
    setContent((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));
  }

  // Internships
  function addInternship() {
    setContent((prev) => ({ ...prev, internships: [...prev.internships, { id: crypto.randomUUID(), company: "", role: "", start: "", end: "", bullets: [""] }] }));
  }
  function updateInternship(i: number, field: string, value: string) {
    setContent((prev) => { const intern = [...prev.internships]; intern[i] = { ...intern[i], [field]: value }; return { ...prev, internships: intern }; });
  }
  function updateInternshipBullet(ii: number, bi: number, value: string) {
    setContent((prev) => { const intern = [...prev.internships]; const bullets = [...intern[ii].bullets]; bullets[bi] = value; intern[ii] = { ...intern[ii], bullets }; return { ...prev, internships: intern }; });
  }
  function addInternshipBullet(ii: number) {
    setContent((prev) => { const intern = [...prev.internships]; intern[ii] = { ...intern[ii], bullets: [...intern[ii].bullets, ""] }; return { ...prev, internships: intern }; });
  }
  function removeInternship(i: number) {
    setContent((prev) => ({ ...prev, internships: prev.internships.filter((_, idx) => idx !== i) }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink/40">Loading...</p>
      </div>
    );
  }

  const inputCls = "w-full border border-ink/20 rounded-sm px-3 py-1.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-moss bg-white";
  const labelCls = "block font-body text-xs uppercase tracking-wide text-ink/50 mb-1";
  const sectionTitle = "font-display text-lg text-ink mb-4 pb-2 border-b border-ink/10";
  const addBtnCls = "font-body text-sm text-moss border border-moss/30 rounded-sm px-4 py-2 hover:bg-moss/5 transition";
  const cardCls = "bg-white border border-ink/10 rounded-sm p-4";

  return (
    <div className="min-h-screen bg-paper">

      {/* Header */}
      <header className="border-b border-ink/10 px-8 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="font-body text-sm text-ink/50 hover:text-ink transition">
            ← Dashboard
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-display text-lg text-ink border-none outline-none bg-transparent w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-ink/40">
            {saving ? "Saving..." : saveMsg || "Auto-saved"}
          </span>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`bg-paper border font-body text-sm px-4 py-1.5 rounded-sm transition ${
              showTemplates
                ? "border-moss text-moss"
                : "border-ink/20 text-ink hover:border-moss hover:text-moss"
            }`}
          >
            🎨 Templates
          </button>
          <button onClick={handleManualSave} disabled={saving}
            className="bg-paper border border-moss text-moss font-body text-sm px-4 py-1.5 rounded-sm hover:bg-moss hover:text-paper transition disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="bg-paper border border-ink/20 text-ink font-body text-sm px-4 py-1.5 rounded-sm hover:border-ink/40 transition disabled:opacity-50">
            {exporting ? "Exporting..." : "↓ PDF"}
          </button>
          <button onClick={() => navigate(`/ats/${id}`)}
            className="bg-paper border border-ink/20 text-ink font-body text-sm px-4 py-1.5 rounded-sm hover:border-moss hover:text-moss transition">
            ATS Score
          </button>
          <button onClick={() => navigate(`/jobs/${id}`)}
            className="bg-paper border border-ink/20 text-ink font-body text-sm px-4 py-1.5 rounded-sm hover:border-moss hover:text-moss transition">
            Job Match
          </button>
          <button onClick={() => navigate(`/ai/${id}`)}
            className="bg-moss text-paper font-body text-sm px-4 py-1.5 rounded-sm hover:bg-moss/90 transition">
            ✦ AI Suggestions
          </button>
        </div>
      </header>

      {/* Template selector panel */}
      {showTemplates && (
        <div className="border-b border-ink/10 bg-white px-8 py-6">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg text-ink">Choose a Template</h2>
                <p className="font-body text-xs text-ink/40 mt-0.5">Select a template to instantly update the live preview</p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="font-body text-sm text-ink/40 hover:text-ink"
              >
                ✕ Close
              </button>
            </div>
            <TemplateSelector selected={template} onChange={handleTemplateChange} />
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-57px)]">

        {/* Editor panel */}
        <div className="w-1/2 overflow-y-auto p-8 space-y-10">

          {/* Contact */}
          <section>
            <h2 className={sectionTitle}>Contact</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["name", "email", "phone", "location", "linkedin"] as const).map((f) => (
                <div key={f} className={f === "name" ? "col-span-2" : ""}>
                  <label className={labelCls}>{f}</label>
                  <input className={inputCls} value={content.contact[f]}
                    onChange={(e) => setContact(f, e.target.value)}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className={sectionTitle}>Summary</h2>
            <textarea className={`${inputCls} resize-none`} rows={4} value={content.summary}
              onChange={(e) => setContent((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="A brief professional summary..." />
          </section>

          {/* Experience */}
          <section>
            <h2 className={sectionTitle}>Experience</h2>
            <div className="space-y-6">
              {content.experience.map((exp, i) => (
                <div key={exp.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {(["company", "role", "start", "end"] as const).map((f) => (
                      <div key={f}>
                        <label className={labelCls}>{f}</label>
                        <input className={inputCls} value={exp[f]}
                          onChange={(e) => updateExperience(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                      </div>
                    ))}
                  </div>
                  <label className={labelCls}>Bullets</label>
                  {exp.bullets.map((b, bi) => (
                    <input key={bi} className={`${inputCls} mb-2`} value={b}
                      onChange={(e) => updateBullet(i, bi, e.target.value)} placeholder="Achieved..." />
                  ))}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => addBullet(i)} className="font-body text-xs text-moss hover:underline">+ Add bullet</button>
                    <button onClick={() => removeExperience(i)} className="font-body text-xs text-clay hover:underline">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={addExperience} className={addBtnCls}>+ Add Experience</button>
            </div>
          </section>

          {/* Internships */}
          <section>
            <h2 className={sectionTitle}>Internships</h2>
            <div className="space-y-6">
              {content.internships.map((intern, i) => (
                <div key={intern.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {(["company", "role", "start", "end"] as const).map((f) => (
                      <div key={f}>
                        <label className={labelCls}>{f}</label>
                        <input className={inputCls} value={intern[f]}
                          onChange={(e) => updateInternship(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                      </div>
                    ))}
                  </div>
                  <label className={labelCls}>Bullets</label>
                  {intern.bullets.map((b, bi) => (
                    <input key={bi} className={`${inputCls} mb-2`} value={b}
                      onChange={(e) => updateInternshipBullet(i, bi, e.target.value)} placeholder="Achieved..." />
                  ))}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => addInternshipBullet(i)} className="font-body text-xs text-moss hover:underline">+ Add bullet</button>
                    <button onClick={() => removeInternship(i)} className="font-body text-xs text-clay hover:underline">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={addInternship} className={addBtnCls}>+ Add Internship</button>
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className={sectionTitle}>Education</h2>
            <div className="space-y-4">
              {content.education.map((edu, i) => (
                <div key={edu.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3">
                    {(["school", "degree", "year"] as const).map((f) => (
                      <div key={f} className={f === "school" ? "col-span-2" : ""}>
                        <label className={labelCls}>{f}</label>
                        <input className={inputCls} value={edu[f]}
                          onChange={(e) => updateEducation(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => removeEducation(i)} className="font-body text-xs text-clay hover:underline mt-3">Remove</button>
                </div>
              ))}
              <button onClick={addEducation} className={addBtnCls}>+ Add Education</button>
            </div>
          </section>

          {/* Projects */}
          <section>
            <h2 className={sectionTitle}>Projects</h2>
            <div className="space-y-4">
              {content.projects.map((proj, i) => (
                <div key={proj.id} className={cardCls}>
                  <div className="space-y-2">
                    {(["name", "description", "tech", "link"] as const).map((f) => (
                      <div key={f}>
                        <label className={labelCls}>{f === "tech" ? "Technologies" : f === "link" ? "Project Link" : f}</label>
                        {f === "description" ? (
                          <textarea className={`${inputCls} resize-none`} rows={2} value={proj[f]}
                            onChange={(e) => updateProject(i, f, e.target.value)}
                            placeholder="Brief project description..." />
                        ) : (
                          <input className={inputCls} value={proj[f]}
                            onChange={(e) => updateProject(i, f, e.target.value)}
                            placeholder={f === "tech" ? "React, Node.js, PostgreSQL..." : f === "link" ? "https://github.com/..." : f.charAt(0).toUpperCase() + f.slice(1)} />
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => removeProject(i)} className="font-body text-xs text-clay hover:underline mt-3">Remove</button>
                </div>
              ))}
              <button onClick={addProject} className={addBtnCls}>+ Add Project</button>
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h2 className={sectionTitle}>Certifications</h2>
            <div className="space-y-4">
              {content.certifications.map((cert, i) => (
                <div key={cert.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Certification Name</label>
                      <input className={inputCls} value={cert.name}
                        onChange={(e) => updateCertification(i, "name", e.target.value)}
                        placeholder="AWS Solutions Architect..." />
                    </div>
                    <div>
                      <label className={labelCls}>Issuer</label>
                      <input className={inputCls} value={cert.issuer}
                        onChange={(e) => updateCertification(i, "issuer", e.target.value)}
                        placeholder="Amazon, Google, Microsoft..." />
                    </div>
                    <div>
                      <label className={labelCls}>Year</label>
                      <input className={inputCls} value={cert.year}
                        onChange={(e) => updateCertification(i, "year", e.target.value)}
                        placeholder="2024" />
                    </div>
                  </div>
                  <button onClick={() => removeCertification(i)} className="font-body text-xs text-clay hover:underline mt-3">Remove</button>
                </div>
              ))}
              <button onClick={addCertification} className={addBtnCls}>+ Add Certification</button>
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className={sectionTitle}>Skills</h2>
            {content.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {content.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-1 bg-moss/10 text-moss text-xs font-medium px-3 py-1 rounded-full border border-moss/20">
                    {skill}
                    <button onClick={() => removeSkill(i)} className="ml-1 text-moss/60 hover:text-clay transition font-bold leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input className={inputCls} value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Type a skill and press Add or Enter..." />
              <button onClick={addSkill} disabled={!newSkill.trim()}
                className="bg-moss text-paper font-body text-sm px-4 py-1.5 rounded-sm hover:bg-moss/90 transition disabled:opacity-50 whitespace-nowrap">
                + Add
              </button>
            </div>
            <p className="font-body text-xs text-ink/40 mt-1">Press Enter or click Add. You can also paste comma-separated skills.</p>
          </section>

          {/* Bottom save button */}
          <div className="pt-4 pb-8">
            <button onClick={handleManualSave} disabled={saving}
              className="w-full bg-moss text-paper font-body text-sm font-medium py-3 rounded-sm hover:bg-moss/90 transition disabled:opacity-60">
              {saving ? "Saving..." : saveMsg || "Save Resume"}
            </button>
          </div>
        </div>

        {/* Live preview panel */}
        <div className="w-1/2 overflow-y-auto border-l border-ink/10 bg-white p-10">
          {/* Template badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-body text-xs text-ink/40 uppercase tracking-widest">Live Preview</span>
            <button
              onClick={() => setShowTemplates(true)}
              className="font-body text-xs text-moss border border-moss/30 px-2.5 py-1 rounded-sm hover:bg-moss/5 transition"
            >
              🎨 Change Template
            </button>
          </div>
          <div className="max-w-[600px] mx-auto">
            <ResumePreview content={content} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}