import React from "react";
import { ResumeContent, TemplateId } from "../types/auth";

interface Props {
  content: ResumeContent;
  template: TemplateId;
}

export default function ResumePreview({ content, template }: Props) {
  if (template === "modern") return <ModernPreview content={content} />;
  if (template === "minimal") return <MinimalPreview content={content} />;
  if (template === "bold") return <BoldPreview content={content} />;
  if (template === "executive") return <ExecutivePreview content={content} />;
  if (template === "creative") return <CreativePreview content={content} />;
  return <ClassicPreview content={content} />;
}

/* ─── helpers ─────────────────────────────────────────── */
function SectionHeading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: 8, marginTop: 0, ...style }}>
      {children}
    </h2>
  );
}

/* ─── CLASSIC ──────────────────────────────────────────── */
function ClassicPreview({ content }: { content: ResumeContent }) {
  const c = content;
  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1F2620", fontSize: 12, lineHeight: 1.5 }}>
      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "1.5px solid #1F2620", paddingBottom: 12, marginBottom: 14 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {c.contact.name || "Your Name"}
        </h1>
        <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>
          {[c.contact.email, c.contact.phone, c.contact.location].filter(Boolean).join("  ·  ")}
        </p>
        {c.contact.linkedin && (
          <p style={{ fontSize: 11, color: "#3E5C46", margin: "2px 0 0" }}>{c.contact.linkedin}</p>
        )}
      </div>

      {c.summary && <Section label="Summary"><p style={{ margin: 0 }}>{c.summary}</p></Section>}
      {c.experience.length > 0 && (
        <Section label="Experience">
          {c.experience.map((e) => <ExpBlock key={e.id} item={e} />)}
        </Section>
      )}
      {c.internships.length > 0 && (
        <Section label="Internships">
          {c.internships.map((e) => <ExpBlock key={e.id} item={e} />)}
        </Section>
      )}
      {c.education.length > 0 && (
        <Section label="Education">
          {c.education.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{e.degree || "Degree"}</span>
                <span style={{ opacity: 0.6 }}> · {e.school || "School"}</span>
              </div>
              <span style={{ opacity: 0.5, fontSize: 11 }}>{e.year}</span>
            </div>
          ))}
        </Section>
      )}
      {c.projects.length > 0 && (
        <Section label="Projects">
          {c.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{p.name || "Project"}</span>
                {p.link && <span style={{ color: "#3E5C46", fontSize: 10 }}>{p.link}</span>}
              </div>
              {p.description && <p style={{ margin: "2px 0 0", opacity: 0.75 }}>{p.description}</p>}
              {p.tech && <p style={{ margin: "2px 0 0", fontSize: 10, opacity: 0.5 }}>{p.tech}</p>}
            </div>
          ))}
        </Section>
      )}
      {c.certifications.length > 0 && (
        <Section label="Certifications">
          {c.certifications.map((cert) => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div><span style={{ fontWeight: 600 }}>{cert.name}</span><span style={{ opacity: 0.6 }}> · {cert.issuer}</span></div>
              <span style={{ opacity: 0.5, fontSize: 11 }}>{cert.year}</span>
            </div>
          ))}
        </Section>
      )}
      {c.skills.length > 0 && (
        <Section label="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {c.skills.map((s, i) => (
              <span key={i} style={{ border: "1px solid #1F262033", padding: "2px 8px", fontSize: 11, borderRadius: 2 }}>{s}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ─── MODERN ───────────────────────────────────────────── */
function ModernPreview({ content }: { content: ResumeContent }) {
  const c = content;
  const accent = "#2563EB";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#0F172A", fontSize: 12, lineHeight: 1.5, display: "flex", gap: 0, minHeight: 600 }}>
      {/* Left sidebar */}
      <div style={{ width: 160, background: accent, color: "#fff", padding: "20px 14px", flexShrink: 0 }}>
        <h1 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px", lineHeight: 1.2 }}>
          {c.contact.name || "Your Name"}
        </h1>
        <div style={{ marginTop: 16, fontSize: 10, opacity: 0.85, lineHeight: 1.8 }}>
          {c.contact.email && <p style={{ margin: 0 }}>✉ {c.contact.email}</p>}
          {c.contact.phone && <p style={{ margin: 0 }}>✆ {c.contact.phone}</p>}
          {c.contact.location && <p style={{ margin: 0 }}>◎ {c.contact.location}</p>}
          {c.contact.linkedin && <p style={{ margin: 0, wordBreak: "break-all" }}>in {c.contact.linkedin}</p>}
        </div>
        {c.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, margin: "0 0 6px" }}>Skills</p>
            {c.skills.map((s, i) => (
              <div key={i} style={{ fontSize: 10, background: "rgba(255,255,255,0.15)", borderRadius: 3, padding: "2px 6px", marginBottom: 3 }}>{s}</div>
            ))}
          </div>
        )}
        {c.certifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, margin: "0 0 6px" }}>Certifications</p>
            {c.certifications.map((cert) => (
              <div key={cert.id} style={{ fontSize: 10, opacity: 0.85, marginBottom: 4 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{cert.name}</p>
                <p style={{ margin: 0, opacity: 0.7 }}>{cert.issuer} {cert.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: "20px 20px" }}>
        {c.summary && (
          <div style={{ marginBottom: 14 }}>
            <SectionHeading style={{ color: accent }}>Summary</SectionHeading>
            <p style={{ margin: 0 }}>{c.summary}</p>
          </div>
        )}
        {c.experience.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionHeading style={{ color: accent }}>Experience</SectionHeading>
            {c.experience.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
          </div>
        )}
        {c.internships.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionHeading style={{ color: accent }}>Internships</SectionHeading>
            {c.internships.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
          </div>
        )}
        {c.education.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionHeading style={{ color: accent }}>Education</SectionHeading>
            {c.education.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div><span style={{ fontWeight: 600 }}>{e.degree || "Degree"}</span><span style={{ opacity: 0.6 }}> · {e.school}</span></div>
                <span style={{ opacity: 0.5, fontSize: 11 }}>{e.year}</span>
              </div>
            ))}
          </div>
        )}
        {c.projects.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SectionHeading style={{ color: accent }}>Projects</SectionHeading>
            {c.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                {p.link && <span style={{ color: accent, fontSize: 10, marginLeft: 6 }}>{p.link}</span>}
                {p.description && <p style={{ margin: "2px 0 0", opacity: 0.75 }}>{p.description}</p>}
                {p.tech && <p style={{ margin: "2px 0 0", fontSize: 10, color: accent, opacity: 0.7 }}>{p.tech}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MINIMAL ──────────────────────────────────────────── */
function MinimalPreview({ content }: { content: ResumeContent }) {
  const c = content;
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#111827", fontSize: 12, lineHeight: 1.6 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          {c.contact.name || "Your Name"}
        </h1>
        <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
          {[c.contact.email, c.contact.phone, c.contact.location, c.contact.linkedin].filter(Boolean).join("  ·  ")}
        </p>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0 0 18px" }} />

      {c.summary && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: 0, color: "#374151" }}>{c.summary}</p>
        </div>
      )}
      {c.experience.length > 0 && (
        <MinSection label="Experience">
          {c.experience.map((e) => <ExpBlock key={e.id} item={e} compact />)}
        </MinSection>
      )}
      {c.internships.length > 0 && (
        <MinSection label="Internships">
          {c.internships.map((e) => <ExpBlock key={e.id} item={e} compact />)}
        </MinSection>
      )}
      {c.education.length > 0 && (
        <MinSection label="Education">
          {c.education.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{e.degree} <span style={{ color: "#6B7280" }}>@ {e.school}</span></span>
              <span style={{ color: "#9CA3AF", fontSize: 11 }}>{e.year}</span>
            </div>
          ))}
        </MinSection>
      )}
      {c.projects.length > 0 && (
        <MinSection label="Projects">
          {c.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              {p.tech && <span style={{ color: "#6B7280", fontSize: 10 }}> — {p.tech}</span>}
              {p.description && <p style={{ margin: "2px 0 0", color: "#6B7280" }}>{p.description}</p>}
            </div>
          ))}
        </MinSection>
      )}
      {c.skills.length > 0 && (
        <MinSection label="Skills">
          <p style={{ margin: 0, color: "#374151" }}>{c.skills.join("  ·  ")}</p>
        </MinSection>
      )}
      {c.certifications.length > 0 && (
        <MinSection label="Certifications">
          {c.certifications.map((cert) => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span>{cert.name} <span style={{ color: "#6B7280" }}>· {cert.issuer}</span></span>
              <span style={{ color: "#9CA3AF", fontSize: 11 }}>{cert.year}</span>
            </div>
          ))}
        </MinSection>
      )}
    </div>
  );
}

function MinSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", margin: "0 0 6px" }}>{label}</p>
      {children}
    </div>
  );
}

/* ─── BOLD ─────────────────────────────────────────────── */
function BoldPreview({ content }: { content: ResumeContent }) {
  const c = content;
  const accent = "#F59E0B";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: 1.5 }}>
      {/* Dark header */}
      <div style={{ background: "#111827", color: "#F9FAFB", padding: "20px 24px", marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em", color: accent }}>
          {c.contact.name || "Your Name"}
        </h1>
        <p style={{ fontSize: 11, color: "rgba(249,250,251,0.6)", margin: 0 }}>
          {[c.contact.email, c.contact.phone, c.contact.location].filter(Boolean).join("  ·  ")}
        </p>
        {c.contact.linkedin && <p style={{ fontSize: 11, color: accent, opacity: 0.8, margin: "2px 0 0" }}>{c.contact.linkedin}</p>}
      </div>

      <div style={{ padding: "0 4px", color: "#1F2937" }}>
        {c.summary && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Profile" accent={accent} />
            <p style={{ margin: 0 }}>{c.summary}</p>
          </div>
        )}
        {c.experience.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Experience" accent={accent} />
            {c.experience.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
          </div>
        )}
        {c.internships.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Internships" accent={accent} />
            {c.internships.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
          </div>
        )}
        {c.education.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Education" accent={accent} />
            {c.education.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div><span style={{ fontWeight: 700 }}>{e.degree}</span><span style={{ opacity: 0.6 }}> · {e.school}</span></div>
                <span style={{ opacity: 0.5 }}>{e.year}</span>
              </div>
            ))}
          </div>
        )}
        {c.skills.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Skills" accent={accent} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {c.skills.map((s, i) => (
                <span key={i} style={{ background: "#F3F4F6", border: `1px solid ${accent}33`, padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {c.projects.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Projects" accent={accent} />
            {c.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                {p.link && <span style={{ color: accent, fontSize: 10, marginLeft: 6 }}>{p.link}</span>}
                {p.description && <p style={{ margin: "2px 0 0", opacity: 0.75 }}>{p.description}</p>}
                {p.tech && <p style={{ margin: "2px 0 0", fontSize: 10, opacity: 0.5 }}>{p.tech}</p>}
              </div>
            ))}
          </div>
        )}
        {c.certifications.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <BoldSection label="Certifications" accent={accent} />
            {c.certifications.map((cert) => (
              <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <div><span style={{ fontWeight: 600 }}>{cert.name}</span><span style={{ opacity: 0.6 }}> · {cert.issuer}</span></div>
                <span style={{ opacity: 0.5 }}>{cert.year}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BoldSection({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ width: 4, height: 14, background: accent, borderRadius: 2 }} />
      <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{label}</h2>
    </div>
  );
}

/* ─── EXECUTIVE ────────────────────────────────────────── */
function ExecutivePreview({ content }: { content: ResumeContent }) {
  const c = content;
  const accent = "#7C3AED";
  return (
    <div style={{ fontFamily: "'Georgia', serif", color: "#1C1917", fontSize: 12, lineHeight: 1.55 }}>
      {/* Double-rule header */}
      <div style={{ borderTop: `2px solid ${accent}`, borderBottom: `1px solid ${accent}55`, padding: "14px 0 12px", marginBottom: 16, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.04em" }}>
          {c.contact.name || "Your Name"}
        </h1>
        <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55, margin: 0 }}>
          {[c.contact.email, c.contact.phone, c.contact.location].filter(Boolean).join("   ·   ")}
        </p>
      </div>

      {c.summary && <ExecSection label="Executive Summary" accent={accent}><p style={{ margin: 0, fontStyle: "italic" }}>{c.summary}</p></ExecSection>}
      {c.experience.length > 0 && (
        <ExecSection label="Professional Experience" accent={accent}>
          {c.experience.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
        </ExecSection>
      )}
      {c.internships.length > 0 && (
        <ExecSection label="Internships" accent={accent}>
          {c.internships.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
        </ExecSection>
      )}
      {c.education.length > 0 && (
        <ExecSection label="Education" accent={accent}>
          {c.education.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div><span style={{ fontWeight: 700 }}>{e.degree}</span><span style={{ opacity: 0.6 }}>, {e.school}</span></div>
              <span style={{ opacity: 0.5 }}>{e.year}</span>
            </div>
          ))}
        </ExecSection>
      )}
      {c.skills.length > 0 && (
        <ExecSection label="Core Competencies" accent={accent}>
          <p style={{ margin: 0 }}>{c.skills.join("   ·   ")}</p>
        </ExecSection>
      )}
      {c.projects.length > 0 && (
        <ExecSection label="Key Projects" accent={accent}>
          {c.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              {p.description && <span style={{ opacity: 0.75 }}> — {p.description}</span>}
              {p.tech && <p style={{ margin: "2px 0 0", fontSize: 10, opacity: 0.5 }}>{p.tech}</p>}
            </div>
          ))}
        </ExecSection>
      )}
      {c.certifications.length > 0 && (
        <ExecSection label="Certifications" accent={accent}>
          {c.certifications.map((cert) => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <div><span style={{ fontWeight: 600 }}>{cert.name}</span><span style={{ opacity: 0.6 }}> · {cert.issuer}</span></div>
              <span style={{ opacity: 0.5 }}>{cert.year}</span>
            </div>
          ))}
        </ExecSection>
      )}
    </div>
  );
}

function ExecSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, margin: "0 0 4px", fontFamily: "'Inter', sans-serif" }}>{label}</h2>
      <hr style={{ border: "none", borderTop: "1px solid #E7E5E4", margin: "0 0 10px" }} />
      {children}
    </div>
  );
}

/* ─── CREATIVE ─────────────────────────────────────────── */
function CreativePreview({ content }: { content: ResumeContent }) {
  const c = content;
  const accent = "#0D9488";
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: 1.5, display: "flex", minHeight: 600 }}>
      {/* Left panel */}
      <div style={{ width: 170, background: accent, color: "#fff", padding: "24px 14px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Avatar circle */}
        {c.photo_url ? (
          <img
            src={c.photo_url.startsWith("http") ? c.photo_url : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${c.photo_url}`}
            alt=""
            style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.5)", marginBottom: 14 }}
          />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "rgba(255,255,255,0.7)" }}>
            {(c.contact.name || "?")[0].toUpperCase()}
          </div>
        )}
        <h1 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px", lineHeight: 1.2 }}>
          {c.contact.name || "Your Name"}
        </h1>
        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 10, lineHeight: 1.9 }}>
          {c.contact.email && <p style={{ margin: 0 }}>{c.contact.email}</p>}
          {c.contact.phone && <p style={{ margin: 0 }}>{c.contact.phone}</p>}
          {c.contact.location && <p style={{ margin: 0 }}>{c.contact.location}</p>}
          {c.contact.linkedin && <p style={{ margin: 0, wordBreak: "break-all" }}>{c.contact.linkedin}</p>}
        </div>

        {c.skills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6, margin: "0 0 8px", fontWeight: 700 }}>Skills</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {c.skills.map((s, i) => (
                <span key={i} style={{ background: "rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: 3, fontSize: 9, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {c.certifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6, margin: "0 0 6px", fontWeight: 700 }}>Certifications</p>
            {c.certifications.map((cert) => (
              <div key={cert.id} style={{ fontSize: 9, marginBottom: 5 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{cert.name}</p>
                <p style={{ margin: 0, opacity: 0.7 }}>{cert.issuer} · {cert.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: "24px 20px", color: "#134E4A", background: "#F0FDFA" }}>
        {c.summary && (
          <div style={{ marginBottom: 14 }}>
            <CreativeSection label="About" accent={accent} />
            <p style={{ margin: 0 }}>{c.summary}</p>
          </div>
        )}
        {c.experience.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <CreativeSection label="Experience" accent={accent} />
            {c.experience.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
          </div>
        )}
        {c.internships.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <CreativeSection label="Internships" accent={accent} />
            {c.internships.map((e) => <ExpBlock key={e.id} item={e} accentColor={accent} />)}
          </div>
        )}
        {c.education.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <CreativeSection label="Education" accent={accent} />
            {c.education.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div><span style={{ fontWeight: 600 }}>{e.degree}</span><span style={{ opacity: 0.6 }}> · {e.school}</span></div>
                <span style={{ opacity: 0.5, fontSize: 11 }}>{e.year}</span>
              </div>
            ))}
          </div>
        )}
        {c.projects.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <CreativeSection label="Projects" accent={accent} />
            {c.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                {p.link && <span style={{ color: accent, fontSize: 10, marginLeft: 5 }}>{p.link}</span>}
                {p.description && <p style={{ margin: "2px 0 0", opacity: 0.75 }}>{p.description}</p>}
                {p.tech && <p style={{ margin: "2px 0 0", fontSize: 10, color: accent, opacity: 0.7 }}>{p.tech}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreativeSection({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <div style={{ width: 16, height: 2, background: accent, borderRadius: 1 }} />
      <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, margin: 0 }}>{label}</h2>
    </div>
  );
}

/* ─── Shared sub-components ────────────────────────────── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <SectionHeading>{label}</SectionHeading>
      {children}
    </div>
  );
}

function ExpBlock({ item, accentColor, compact }: { item: any; accentColor?: string; compact?: boolean }) {
  return (
    <div style={{ marginBottom: compact ? 8 : 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 600 }}>{item.role || "Role"}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>{item.start}{item.end ? ` — ${item.end}` : ""}</span>
      </div>
      <p style={{ margin: "1px 0 3px", opacity: 0.6, fontSize: 11, color: accentColor || "inherit" }}>{item.company || "Company"}</p>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {item.bullets.filter(Boolean).map((b: string, i: number) => (
          <li key={i} style={{ fontSize: 11, opacity: 0.8, marginBottom: 1 }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
