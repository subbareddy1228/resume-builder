import React from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>),
    title: "ATS Score Check",
    desc: "See exactly how your resume scores against any job description before you apply.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>),
    title: "AI Suggestions",
    desc: "Claude rewrites your bullets and summary to match the role — streamed in real time.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>),
    title: "Job Matching",
    desc: "Paste any job description and get a match score powered by vector embeddings.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    title: "PDF Export",
    desc: "Download a polished PDF instantly — no watermarks, no sign-up tricks.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>),
    title: "6 Pro Templates",
    desc: "Classic, Modern, Minimal, Executive, Creative, and Tech — all rendering live.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>),
    title: "Cover Letter AI",
    desc: "Generate a tailored cover letter for each application in seconds.",
  },
];

const STEPS = [
  { n: "01", title: "Create your resume", body: "Fill in your details in our clean editor. Auto-saved as you type." },
  { n: "02", title: "Paste a job description", body: "Drop in any JD and get an instant ATS score and gap analysis." },
  { n: "03", title: "Let AI improve it", body: "Claude rewrites weak bullets and your summary to match the role." },
  { n: "04", title: "Download and apply", body: "Export a pixel-perfect PDF and hit send with confidence." },
];

const FREE_FEATURES  = ["1 resume", "ATS score check", "3 AI suggestions / month", "PDF export", "3 templates"];
const PRO_FEATURES   = ["Unlimited resumes", "Unlimited ATS scoring", "Unlimited AI suggestions", "PDF export — no watermarks", "All 6 templates", "Job matching", "Cover letter AI", "Version history", "Priority support"];
const TEAM_FEATURES  = ["Everything in Pro", "5 team seats", "Shared template library", "Admin dashboard", "SSO / Google Workspace", "Dedicated support"];

function CheckIcon({ color = "text-moss" }: { color?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`}>
      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HeroCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-moss/20" />
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-ink/5">
        <div className="bg-[#1e293b] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-moss/30 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display text-lg">A</span>
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">Hari Sharma</p>
              <p className="text-slate-400 text-xs mt-0.5">Senior Software Engineer</p>
              <div className="flex items-center gap-3 mt-2">
                {["hari@dev.io", "Bangalore, IN"].map(t => (
                  <span key={t} className="text-slate-500 text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold">ATS Score</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[87%] bg-moss rounded-full" />
              </div>
              <span className="text-xs font-bold text-moss">87%</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-2">Experience</p>
            <div className="space-y-2.5">
              {[
                { role: "Senior Engineer", co: "Anthropic · 2023–Present", bullets: ["Reduced API latency by 40%", "Led team of 6 engineers"] },
                { role: "Software Engineer", co: "Infosys · 2020–2023", bullets: ["Built microservices for 2M+ daily requests"] },
              ].map((exp) => (
                <div key={exp.role}>
                  <p className="text-[11px] font-semibold text-ink">{exp.role}</p>
                  <p className="text-[10px] text-slate-500 mb-1">{exp.co}</p>
                  {exp.bullets.map(b => (
                    <p key={b} className="text-[10px] text-slate-600 pl-2 before:content-['·'] before:mr-1 before:text-moss">{b}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Claude API"].map(s => (
                <span key={s} className="text-[9px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 top-20 bg-white border border-moss/20 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 max-w-[180px]">
        <div className="w-6 h-6 rounded-full bg-moss flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px]">✦</span>
        </div>
        <p className="text-[10px] text-ink leading-tight">AI rewrote 3 bullets to boost your score</p>
      </div>
      <div className="absolute -left-4 bottom-16 bg-white border border-clay/20 shadow-lg rounded-xl px-3 py-2">
        <p className="text-[10px] text-ink/50 mb-0.5">Job match</p>
        <p className="text-sm font-bold text-clay">92% match</p>
      </div>
    </div>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper font-body text-ink overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-ink/[0.07] bg-paper/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-moss flex items-center justify-center shadow-sm">
              <span className="font-display text-paper text-sm font-bold">R</span>
            </div>
            <span className="font-display text-xl text-ink">Resume Builder</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo("features")} className="font-body text-sm text-ink/55 hover:text-ink transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo("templates")} className="font-body text-sm text-ink/55 hover:text-ink transition-colors">
              Templates
            </button>
            <button onClick={() => scrollTo("how-it-works")} className="font-body text-sm text-ink/55 hover:text-ink transition-colors">
              How it works
            </button>
            <button onClick={() => scrollTo("about")} className="font-body text-sm text-ink/55 hover:text-ink transition-colors">
              About
            </button>
            <button onClick={() => scrollTo("pricing")} className="font-body text-sm text-ink/55 hover:text-ink transition-colors">
              Pricing
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="font-body text-sm text-ink/70 hover:text-ink transition-colors px-4 py-2 rounded-lg border border-ink/10 hover:border-ink/20"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn-primary text-sm px-5 py-2.5"
            >
              Start free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-moss/8 border border-moss/15 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
            <span className="font-body text-xs text-moss font-medium">AI-powered · Free to start</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl text-ink leading-[1.08] mb-6">
            Build a resume<br />
            <span className="text-moss">that gets read.</span>
          </h1>
          <p className="font-body text-lg text-ink/60 leading-relaxed mb-8 max-w-md">
            Write, score against any job description, and let AI rewrite your bullets — all before you hit send.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={() => navigate("/register")} className="btn-primary text-base px-7 py-3.5">
              Build my resume free
            </button>
            <button onClick={() => navigate("/login")} className="btn-secondary text-base px-7 py-3.5">
              Sign in
            </button>
          </div>
          <div className="flex items-center gap-6">
            {[
              { val: "100%", label: "Free first resume" },
              { val: "6", label: "Pro templates" },
              { val: "AI", label: "Claude-powered" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="font-display text-xl text-ink">{val}</p>
                <p className="font-body text-xs text-ink/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:pl-8">
          <HeroCard />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="bg-white border-y border-ink/[0.07] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-moss font-semibold mb-3">Features</p>
            <h2 className="font-display text-4xl text-ink">Everything you need to land the job</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="surface-card p-6 surface-card-hover">
                <div className="w-10 h-10 rounded-xl bg-moss/8 flex items-center justify-center text-moss mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg text-ink mb-2">{f.title}</h3>
                <p className="font-body text-sm text-ink/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <div className="text-center mb-14">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-moss font-semibold mb-3">How it works</p>
          <h2 className="font-display text-4xl text-ink">From blank page to application-ready</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px bg-ink/10 z-0" />
              )}
              <div className="surface-card p-6 relative z-10">
                <span className="font-display text-3xl text-moss/20 font-bold">{s.n}</span>
                <h3 className="font-display text-base text-ink mt-2 mb-2">{s.title}</h3>
                <p className="font-body text-sm text-ink/50 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────────── */}
      <section id="templates" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <div className="text-center mb-14">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-moss font-semibold mb-3">Templates</p>
          <h2 className="font-display text-4xl text-ink mb-4">15 designs. One that's yours.</h2>
          <p className="font-body text-base text-ink/50 max-w-xl mx-auto">
            Every template is ATS-compatible and exports as a pixel-perfect PDF.
            Switch anytime — your content stays put.
          </p>
        </div>

        {/* Template showcase grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            { name: "Classic",     accent: "#3E5C46", bg: "#FBF8F1", text: "#1F2620", tag: "ATS-safe",      type: "centered" },
            { name: "Modern",      accent: "#2563EB", bg: "#F8FAFC", text: "#0F172A", tag: "Popular",       type: "sidebar" },
            { name: "Bold",        accent: "#F59E0B", bg: "#111827", text: "#F9FAFB", tag: "Striking",      type: "dark-header" },
            { name: "Creative",    accent: "#0D9488", bg: "#F0FDFA", text: "#134E4A", tag: "Creative",      type: "color-panel" },
            { name: "Minimal",     accent: "#111827", bg: "#FFFFFF", text: "#111827", tag: "Clean",         type: "minimal" },
            { name: "Executive",   accent: "#7C3AED", bg: "#FAFAF9", text: "#1C1917", tag: "Senior",        type: "centered" },
            { name: "Navy",        accent: "#B45309", bg: "#F8F7F4", text: "#1E3A5F", tag: "Corporate",     type: "dark-header" },
            { name: "Terra",       accent: "#C2410C", bg: "#FFF7ED", text: "#431407", tag: "Warm",          type: "color-panel" },
            { name: "Midnight",    accent: "#818CF8", bg: "#0F172A", text: "#E2E8F0", tag: "Dark",          type: "dark-header" },
            { name: "Sidebar Pro", accent: "#06B6D4", bg: "#FFFFFF", text: "#111827", tag: "Premium",       type: "sidebar" },
          ].map((t) => (
            <div key={t.name} className="group cursor-pointer">
              {/* Mini preview */}
              <div
                className="w-full rounded-xl overflow-hidden border border-ink/8 shadow-sm group-hover:shadow-md group-hover:scale-[1.02] transition-all duration-200"
                style={{ aspectRatio: "3/4", background: t.bg }}
              >
                {t.type === "centered" && (
                  <div className="h-full flex flex-col" style={{ padding: "12px 10px" }}>
                    <div style={{ textAlign: "center", borderBottom: `2px solid ${t.accent}`, paddingBottom: 6, marginBottom: 6 }}>
                      <div style={{ width: "50%", height: 5, background: t.text, opacity: 0.85, borderRadius: 1, margin: "0 auto 3px" }} />
                      <div style={{ width: "65%", height: 2, background: t.text, opacity: 0.25, borderRadius: 1, margin: "0 auto" }} />
                    </div>
                    {[80, 65, 75, 55, 70, 60].map((w, i) => (
                      <div key={i} style={{ width: `${w}%`, height: i === 0 ? 3 : 2, background: i === 0 ? t.accent : t.text, opacity: i === 0 ? 0.6 : 0.13, borderRadius: 1, marginBottom: 4 }} />
                    ))}
                  </div>
                )}
                {t.type === "sidebar" && (
                  <div className="h-full flex">
                    <div style={{ width: 28, background: t.accent, padding: "8px 5px", flexShrink: 0 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.3)", margin: "0 auto 5px" }} />
                      {[90, 70, 80, 65, 75, 60, 70].map((w, i) => (
                        <div key={i} style={{ width: `${w}%`, height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1, marginBottom: 3 }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, padding: "8px 8px" }}>
                      <div style={{ width: "60%", height: 5, background: t.text, opacity: 0.85, borderRadius: 1, marginBottom: 3 }} />
                      <div style={{ width: "40%", height: 2, background: t.accent, opacity: 0.6, borderRadius: 1, marginBottom: 7 }} />
                      {[85, 70, 80, 60, 75, 55].map((w, i) => (
                        <div key={i} style={{ width: `${w}%`, height: 2, background: t.text, opacity: 0.13, borderRadius: 1, marginBottom: 4 }} />
                      ))}
                    </div>
                  </div>
                )}
                {t.type === "dark-header" && (
                  <div className="h-full flex flex-col">
                    <div style={{ background: t.bg === "#111827" || t.bg === "#0F172A" ? "#1E293B" : "#1E3A5F", padding: "10px 10px 8px" }}>
                      <div style={{ width: "55%", height: 5, background: t.accent, borderRadius: 1, marginBottom: 3 }} />
                      <div style={{ width: "70%", height: 2, background: "rgba(255,255,255,0.35)", borderRadius: 1 }} />
                    </div>
                    <div style={{ flex: 1, padding: "8px 10px" }}>
                      <div style={{ width: 26, height: 2, background: t.accent, opacity: 0.8, borderRadius: 1, marginBottom: 5 }} />
                      {[85, 70, 80, 60, 75].map((w, i) => (
                        <div key={i} style={{ width: `${w}%`, height: 2, background: t.text === "#E2E8F0" ? "#94A3B8" : "#6B7280", opacity: 0.45, borderRadius: 1, marginBottom: 4 }} />
                      ))}
                    </div>
                  </div>
                )}
                {t.type === "color-panel" && (
                  <div className="h-full flex">
                    <div style={{ width: 32, background: t.accent, padding: "10px 5px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.3)", border: "1.5px solid rgba(255,255,255,0.6)" }} />
                      {[90, 75, 80, 65, 70, 60].map((w, i) => (
                        <div key={i} style={{ width: `${w}%`, height: 2, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, padding: "8px 8px" }}>
                      <div style={{ width: "55%", height: 5, background: t.text, opacity: 0.8, borderRadius: 1, marginBottom: 3 }} />
                      <div style={{ width: "40%", height: 2, background: t.accent, opacity: 0.5, borderRadius: 1, marginBottom: 6 }} />
                      {[80, 65, 75, 55, 70].map((w, i) => (
                        <div key={i} style={{ width: `${w}%`, height: 2, background: t.text, opacity: 0.13, borderRadius: 1, marginBottom: 4 }} />
                      ))}
                    </div>
                  </div>
                )}
                {t.type === "minimal" && (
                  <div className="h-full" style={{ padding: "12px 12px", border: "1px solid #E5E7EB" }}>
                    <div style={{ width: "48%", height: 6, background: t.text, opacity: 0.9, borderRadius: 1, marginBottom: 3 }} />
                    <div style={{ width: "32%", height: 2, background: t.text, opacity: 0.3, borderRadius: 1, marginBottom: 2 }} />
                    <div style={{ width: "100%", height: 1, background: t.text, opacity: 0.1, margin: "6px 0" }} />
                    {[80, 65, 75, 55, 70, 60].map((w, i) => (
                      <div key={i} style={{ width: `${w}%`, height: 2, background: i === 0 ? t.accent : t.text, opacity: i === 0 ? 0.5 : 0.11, borderRadius: 1, marginBottom: 4 }} />
                    ))}
                  </div>
                )}
              </div>
              {/* Label */}
              <div className="mt-2 flex items-center justify-between px-0.5">
                <p className="font-body text-xs font-semibold text-ink">{t.name}</p>
                <span className="font-body text-[10px] text-ink/35 bg-ink/5 px-1.5 py-0.5 rounded-full">{t.tag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="font-body text-sm text-ink/50 mb-4">
            All 15 templates · Switch anytime · No re-formatting needed
          </p>
          <button
            onClick={() => navigate("/register")}
            className="btn-primary px-7 py-3"
          >
            Try all templates free →
          </button>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────── */}
      <section id="about" className="bg-white border-y border-ink/[0.07] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-moss font-semibold mb-4">About</p>
              <h2 className="font-display text-4xl text-ink mb-6 leading-tight">
                Built for job seekers,<br />not HR software vendors.
              </h2>
              <p className="font-body text-base text-ink/60 leading-relaxed mb-5">
                Most resume tools are built for recruiters — full of compliance features and locked behind enterprise contracts. We built this for the person on the other side: someone trying to get their next role, not manage a hiring pipeline.
              </p>
              <p className="font-body text-base text-ink/60 leading-relaxed mb-8">
                Every feature — the ATS scorer, the AI rewriter, the cover letter generator — was designed to answer one question: does this actually help you get more interviews? If not, it's not in the product.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { val: "Claude AI",   label: "Powers every AI feature" },
                  { val: "15",          label: "Professional templates" },
                  { val: "100%",        label: "Free first resume" },
                  { val: "No lock-in",  label: "Cancel anytime, keep your data" },
                ].map(({ val, label }) => (
                  <div key={label} className="border-l-2 border-moss/30 pl-4">
                    <p className="font-display text-xl text-ink mb-0.5">{val}</p>
                    <p className="font-body text-xs text-ink/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — values cards */}
            <div className="space-y-4">
              {[
                {
                  icon: "✦",
                  title: "AI that actually helps",
                  body: "We use Claude — not a fine-tuned keyword stuffer — because job seekers deserve advice that sounds like a human wrote it.",
                },
                {
                  icon: "◎",
                  title: "Your data is yours",
                  body: "We don't sell your resume data, train models on it, or share it with employers. Your application is private.",
                },
                {
                  icon: "→",
                  title: "Honest about what we are",
                  body: "A resume builder. Not a job board, not a recruiter marketplace. We don't take commissions when you get hired.",
                },
                {
                  icon: "◈",
                  title: "Free tier that's actually free",
                  body: "One resume, ATS scoring, and PDF export — forever, no credit card, no expiry. Upgrade when it makes sense for you.",
                },
              ].map((item) => (
                <div key={item.title} className="surface-card p-5 flex gap-4">
                  <span className="text-moss font-display text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-display text-base text-ink mb-1">{item.title}</p>
                    <p className="font-body text-sm text-ink/55 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-y border-ink/[0.07] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-moss font-semibold mb-3">Pricing</p>
            <h2 className="font-display text-4xl text-ink mb-3">Simple, honest pricing</h2>
            <p className="font-body text-ink/50 text-base">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">

            {/* Free */}
            <div className="surface-card p-8 flex flex-col">
              <div className="mb-6">
                <p className="font-display text-lg text-ink mb-1">Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl text-ink">$0</span>
                  <span className="font-body text-sm text-ink/40">/ month</span>
                </div>
                <p className="font-body text-sm text-ink/45 mt-2">Perfect for getting started.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span className="font-body text-sm text-ink/70">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/register")}
                className="btn-secondary w-full py-3 text-sm font-semibold"
              >
                Get started free
              </button>
            </div>

            {/* Pro — highlighted */}
            <div className="relative rounded-2xl bg-moss p-8 flex flex-col shadow-xl shadow-moss/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-clay text-white font-body text-xs font-semibold px-4 py-1 rounded-full shadow">
                  Most popular
                </span>
              </div>
              <div className="mb-6">
                <p className="font-display text-lg text-white mb-1">Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl text-white">$9</span>
                  <span className="font-body text-sm text-white/50">/ month</span>
                </div>
                <p className="font-body text-sm text-white/50 mt-2">For serious job seekers.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckIcon color="text-white/80" />
                    <span className="font-body text-sm text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/register")}
                className="w-full bg-white text-moss font-body text-sm font-semibold py-3 rounded-xl hover:bg-white/90 transition shadow"
              >
                Start Pro free for 7 days
              </button>
            </div>

            {/* Team */}
            <div className="surface-card p-8 flex flex-col">
              <div className="mb-6">
                <p className="font-display text-lg text-ink mb-1">Team</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl text-ink">$29</span>
                  <span className="font-body text-sm text-ink/40">/ month</span>
                </div>
                <p className="font-body text-sm text-ink/45 mt-2">For career coaches & teams.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {TEAM_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span className="font-body text-sm text-ink/70">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/register")}
                className="btn-secondary w-full py-3 text-sm font-semibold"
              >
                Contact us
              </button>
            </div>
          </div>

          {/* FAQ row */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { q: "Can I cancel anytime?", a: "Yes — no contracts, no lock-in. Cancel from your dashboard in one click." },
              { q: "Is my first resume really free?", a: "Yes. Free plan includes one full resume with PDF export, forever." },
              { q: "What payment methods do you accept?", a: "All major cards via Stripe. Invoices available on Team plan." },
            ].map(({ q, a }) => (
              <div key={q} className="surface-card p-6">
                <p className="font-display text-sm text-ink mb-2">{q}</p>
                <p className="font-body text-xs text-ink/50 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-moss rounded-2xl px-10 py-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #FBF8F1 0%, transparent 60%)" }}
          />
          <h2 className="font-display text-4xl text-paper mb-4 relative">
            Your next role is one resume away.
          </h2>
          <p className="font-body text-paper/70 text-lg mb-8 relative">
            Free to start. No credit card. No watermarks.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-paper text-moss font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-paper/90 transition shadow-lg relative"
          >
            Build my resume — it's free
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-ink/[0.07] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-moss flex items-center justify-center">
              <span className="font-display text-paper text-xs">R</span>
            </div>
            <span className="font-body text-sm text-ink/40">Resume Builder</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Features",     id: "features" },
              { label: "Templates",    id: "templates" },
              { label: "How it works", id: "how-it-works" },
              { label: "About",        id: "about" },
              { label: "Pricing",      id: "pricing" },
            ].map(({ label, id }) => (
              <button
                key={label}
                onClick={() => scrollTo(id)}
                className="font-body text-xs text-ink/30 hover:text-ink/60 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="font-body text-xs text-ink/30">&copy; 2024 Resume Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}