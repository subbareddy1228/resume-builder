import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getResume, updateResume, downloadPDF, updateTemplate } from "../api/resumes";
import { ResumeContent } from "../types/auth";
import TemplateSelector from "../components/TemplateSelector";
import ResumePreview from "../components/ResumePreview";
import VersionHistory from "../components/VersionHistory";
import PhotoUpload from "../components/PhotoUpload";
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
  const [showVersions, setShowVersions] = useState(false);
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
  // Update UI immediately
  setTemplate(newTemplate);

  // Close template popup/card
  setShowTemplates(false);

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

  function addEducation() {
    setContent((prev) => ({ ...prev, education: [...prev.education, { id: crypto.randomUUID(), school: "", degree: "", year: "" }] }));
  }
  function updateEducation(i: number, field: string, value: string) {
    setContent((prev) => { const edu = [...prev.education]; edu[i] = { ...edu[i], [field]: value }; return { ...prev, education: edu }; });
  }
  function removeEducation(i: number) {
    setContent((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  }

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

  function addProject() {
    setContent((prev) => ({ ...prev, projects: [...prev.projects, { id: crypto.randomUUID(), name: "", description: "", tech: "", link: "" }] }));
  }
  function updateProject(i: number, field: string, value: string) {
    setContent((prev) => { const p = [...prev.projects]; p[i] = { ...p[i], [field]: value }; return { ...prev, projects: p }; });
  }
  function removeProject(i: number) {
    setContent((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));
  }

  function addCertification() {
    setContent((prev) => ({ ...prev, certifications: [...prev.certifications, { id: crypto.randomUUID(), name: "", issuer: "", year: "" }] }));
  }
  function updateCertification(i: number, field: string, value: string) {
    setContent((prev) => { const c = [...prev.certifications]; c[i] = { ...c[i], [field]: value }; return { ...prev, certifications: c }; });
  }
  function removeCertification(i: number) {
    setContent((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));
  }

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-moss/20 border-t-moss rounded-full animate-spin" />
          <p className="font-body text-sm text-ink/40">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const sectionTitle = "font-display text-lg text-ink";
  const addBtnCls = "font-body text-sm text-moss border border-moss/25 rounded-lg px-4 py-2 hover:bg-moss/5 hover:border-moss/40 transition-all";
  const cardCls = "bg-paper/50 border border-ink/[0.07] rounded-xl p-4";
  const navBtnCls = "bg-white border border-ink/12 text-ink/75 font-body text-sm px-3.5 py-1.5 rounded-lg hover:border-moss/40 hover:text-moss transition-all";
  const navBtnActiveCls = "bg-moss/10 border border-moss text-moss font-body text-sm px-3.5 py-1.5 rounded-lg transition-all";

  return (
    <div className="min-h-screen bg-paper">

      <header className="border-b border-ink/[0.06] px-8 py-3 flex items-center justify-between bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="btn-ghost">
            ← Dashboard
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-display text-lg text-ink border-none outline-none bg-transparent w-64 focus:bg-ink/[0.03] rounded-md px-2 -mx-2 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <span className="font-body text-xs text-ink/40 mr-1">
            {saving ? "Saving..." : saveMsg || "Auto-saved"}
          </span>
          <button onClick={() => setShowTemplates(!showTemplates)} className={showTemplates ? navBtnActiveCls : navBtnCls}>
            🎨 Templates
          </button>
          <button onClick={() => setShowVersions(!showVersions)} className={showVersions ? navBtnActiveCls : navBtnCls}>
            🕐 History
          </button>
          <button onClick={handleManualSave} disabled={saving} className="btn-secondary !py-1.5 !px-3.5 !text-sm">
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleExport} disabled={exporting} className={navBtnCls + " disabled:opacity-50"}>
            {exporting ? "Exporting..." : "↓ PDF"}
          </button>
          <button onClick={() => navigate(`/ats/${id}`)} className={navBtnCls}>
            ATS Score
          </button>
          <button onClick={() => navigate(`/jobs/${id}`)} className={navBtnCls}>
            Job Match
          </button>
          <button onClick={() => navigate(`/cover-letter/${id}`)} className={navBtnCls}>
            ✉ Cover Letter
          </button>
          <button onClick={() => navigate(`/ai/${id}`)} className="btn-primary !py-1.5 !px-3.5 !text-sm whitespace-nowrap">
            ✦ AI Suggestions
          </button>
        </div>
      </header>

      {showTemplates && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-[900px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h2 className="text-xl font-semibold">
            Choose Resume Template
          </h2>
          <p className="text-sm text-gray-500">
            Select a template to update the preview.
          </p>
        </div>

        <button
          onClick={() => setShowTemplates(false)}
          className="text-xl"
        >
          ✕
        </button>
      </div>

      <div className="p-6">
        <TemplateSelector
          selected={template}
          onChange={handleTemplateChange}
        />
      </div>

    </div>
  </div>
)}

      <div className="flex h-[calc(100vh-57px)]">
        <div className="w-1/2 overflow-y-auto p-8 space-y-10">

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Contact</h2></div>
            {id && (
              <PhotoUpload
                resumeId={id}
                photoUrl={content.photo_url}
                onChange={(url) => setContent((prev) => ({ ...prev, photo_url: url }))}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              {(["name", "email", "phone", "location", "linkedin"] as const).map((f) => (
                <div key={f} className={f === "name" ? "col-span-2" : ""}>
                  <label className="field-label">{f}</label>
                  <input className="field-input" value={content.contact[f]}
                    onChange={(e) => setContact(f, e.target.value)}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Summary</h2></div>
            <textarea className="field-textarea" rows={4} value={content.summary}
              onChange={(e) => setContent((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="A brief professional summary..." />
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Experience</h2></div>
            <div className="space-y-4">
              {content.experience.map((exp, i) => (
                <div key={exp.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {(["company", "role", "start", "end"] as const).map((f) => (
                      <div key={f}>
                        <label className="field-label">{f}</label>
                        <input className="field-input" value={exp[f]}
                          onChange={(e) => updateExperience(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                      </div>
                    ))}
                  </div>
                  <label className="field-label">Bullets</label>
                  {exp.bullets.map((b, bi) => (
                    <input key={bi} className="field-input mb-2" value={b}
                      onChange={(e) => updateBullet(i, bi, e.target.value)} placeholder="Achieved..." />
                  ))}
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => addBullet(i)} className="font-body text-xs text-moss font-medium hover:underline">+ Add bullet</button>
                    <button onClick={() => removeExperience(i)} className="font-body text-xs text-clay font-medium hover:underline">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={addExperience} className={addBtnCls}>+ Add Experience</button>
            </div>
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Internships</h2></div>
            <div className="space-y-4">
              {content.internships.map((intern, i) => (
                <div key={intern.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {(["company", "role", "start", "end"] as const).map((f) => (
                      <div key={f}>
                        <label className="field-label">{f}</label>
                        <input className="field-input" value={intern[f]}
                          onChange={(e) => updateInternship(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                      </div>
                    ))}
                  </div>
                  <label className="field-label">Bullets</label>
                  {intern.bullets.map((b, bi) => (
                    <input key={bi} className="field-input mb-2" value={b}
                      onChange={(e) => updateInternshipBullet(i, bi, e.target.value)} placeholder="Achieved..." />
                  ))}
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => addInternshipBullet(i)} className="font-body text-xs text-moss font-medium hover:underline">+ Add bullet</button>
                    <button onClick={() => removeInternship(i)} className="font-body text-xs text-clay font-medium hover:underline">Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={addInternship} className={addBtnCls}>+ Add Internship</button>
            </div>
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Education</h2></div>
            <div className="space-y-4">
              {content.education.map((edu, i) => (
                <div key={edu.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3">
                    {(["school", "degree", "year"] as const).map((f) => (
                      <div key={f} className={f === "school" ? "col-span-2" : ""}>
                        <label className="field-label">{f}</label>
                        <input className="field-input" value={edu[f]}
                          onChange={(e) => updateEducation(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)} />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => removeEducation(i)} className="font-body text-xs text-clay font-medium hover:underline mt-3">Remove</button>
                </div>
              ))}
              <button onClick={addEducation} className={addBtnCls}>+ Add Education</button>
            </div>
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Projects</h2></div>
            <div className="space-y-4">
              {content.projects.map((proj, i) => (
                <div key={proj.id} className={cardCls}>
                  <div className="space-y-2">
                    {(["name", "description", "tech", "link"] as const).map((f) => (
                      <div key={f}>
                        <label className="field-label">{f === "tech" ? "Technologies" : f === "link" ? "Project Link" : f}</label>
                        {f === "description" ? (
                          <textarea className="field-textarea" rows={2} value={proj[f]}
                            onChange={(e) => updateProject(i, f, e.target.value)}
                            placeholder="Brief project description..." />
                        ) : (
                          <input className="field-input" value={proj[f]}
                            onChange={(e) => updateProject(i, f, e.target.value)}
                            placeholder={f === "tech" ? "React, Node.js, PostgreSQL..." : f === "link" ? "https://github.com/..." : f.charAt(0).toUpperCase() + f.slice(1)} />
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => removeProject(i)} className="font-body text-xs text-clay font-medium hover:underline mt-3">Remove</button>
                </div>
              ))}
              <button onClick={addProject} className={addBtnCls}>+ Add Project</button>
            </div>
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Certifications</h2></div>
            <div className="space-y-4">
              {content.certifications.map((cert, i) => (
                <div key={cert.id} className={cardCls}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="field-label">Certification Name</label>
                      <input className="field-input" value={cert.name}
                        onChange={(e) => updateCertification(i, "name", e.target.value)}
                        placeholder="AWS Solutions Architect..." />
                    </div>
                    <div>
                      <label className="field-label">Issuer</label>
                      <input className="field-input" value={cert.issuer}
                        onChange={(e) => updateCertification(i, "issuer", e.target.value)}
                        placeholder="Amazon, Google, Microsoft..." />
                    </div>
                    <div>
                      <label className="field-label">Year</label>
                      <input className="field-input" value={cert.year}
                        onChange={(e) => updateCertification(i, "year", e.target.value)}
                        placeholder="2024" />
                    </div>
                  </div>
                  <button onClick={() => removeCertification(i)} className="font-body text-xs text-clay font-medium hover:underline mt-3">Remove</button>
                </div>
              ))}
              <button onClick={addCertification} className={addBtnCls}>+ Add Certification</button>
            </div>
          </section>

          <section>
            <div className="heading-rule"><h2 className={sectionTitle}>Skills</h2></div>
            {content.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {content.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-1 bg-moss/10 text-moss text-xs font-medium px-3 py-1.5 rounded-full border border-moss/20">
                    {skill}
                    <button onClick={() => removeSkill(i)} className="ml-1 text-moss/60 hover:text-clay transition-colors font-bold leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input className="field-input" value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Type a skill and press Add or Enter..." />
              <button onClick={addSkill} disabled={!newSkill.trim()} className="btn-primary whitespace-nowrap">
                + Add
              </button>
            </div>
            <p className="font-body text-xs text-ink/40 mt-1.5">Press Enter or click Add. You can also paste comma-separated skills.</p>
          </section>

          <div className="pt-4 pb-8">
            <button onClick={handleManualSave} disabled={saving} className="btn-primary w-full !py-3">
              {saving ? "Saving..." : saveMsg || "Save Resume"}
            </button>
          </div>
        </div>

        <div className="w-1/2 overflow-y-auto border-l border-ink/[0.06] bg-gradient-to-b from-white to-paper/30 p-10">
          <div className="flex items-center justify-between mb-6">
            <span className="font-body text-xs text-ink/40 uppercase tracking-widest font-semibold">Live Preview</span>
            <button onClick={() => setShowTemplates(true)} className="font-body text-xs text-moss border border-moss/25 px-3 py-1.5 rounded-lg hover:bg-moss/5 transition-colors">
              🎨 Change Template
            </button>
          </div>
          <div className="max-w-[600px] mx-auto rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(31,38,32,0.06),0_16px_40px_-16px_rgba(31,38,32,0.18)]">
            <ResumePreview content={content} template={template} />
          </div>
        </div>
      </div>

      {showVersions && id && (
        <VersionHistory
          resumeId={id}
          onRestore={(restoredContent) => {
            setContent(restoredContent);
            setSaveMsg("Restored ✓");
            setTimeout(() => setSaveMsg(""), 2000);
          }}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}
