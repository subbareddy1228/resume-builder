def _photo_data_uri(photo_url: str | None) -> str | None:
    """Convert a stored /api/photos/{id}/file path into a base64 data URI
    WeasyPrint can render without needing network access."""
    if not photo_url:
        return None
    try:
        import base64
        from pathlib import Path

        resume_id = photo_url.rstrip("/").split("/")[-2]  # /api/photos/{id}/file
        upload_dir = Path(__file__).resolve().parent.parent.parent / "uploads" / "photos"
        for ext in ("jpg", "jpeg", "png", "webp"):
            filepath = upload_dir / f"{resume_id}.{ext}"
            if filepath.exists():
                mime = "image/png" if ext == "png" else "image/webp" if ext == "webp" else "image/jpeg"
                data = base64.b64encode(filepath.read_bytes()).decode("ascii")
                return f"data:{mime};base64,{data}"
    except Exception:
        pass
    return None


def resume_to_html(content: dict, title: str, template: str = "classic") -> str:
    contact = content.get("contact", {})
    summary = content.get("summary", "")
    experience = content.get("experience", [])
    internships = content.get("internships", [])
    education = content.get("education", [])
    projects = content.get("projects", [])
    certifications = content.get("certifications", [])
    skills = content.get("skills", [])

    def safe(val: str) -> str:
        return (val or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def exp_block(items: list) -> str:
        html = ""
        for item in items:
            bullets_html = "".join(
                f"<li>{safe(b)}</li>" for b in item.get("bullets", []) if b
            )
            html += (
                '<div class="entry">'
                '<div class="entry-header"><div>'
                f'<span class="entry-title">{safe(item.get("role", ""))}</span>'
                f'<span class="entry-sub"> · {safe(item.get("company", ""))}</span>'
                "</div>"
                f'<span class="entry-date">{safe(item.get("start", ""))}'
                + (f' — {safe(item.get("end", ""))}' if item.get("end") else "")
                + "</span></div>"
                f'<ul class="bullets">{bullets_html}</ul>'
                "</div>"
            )
        return html

    exp_html = exp_block(experience)
    intern_html = exp_block(internships)

    edu_html = ""
    for edu in education:
        edu_html += (
            '<div class="entry">'
            '<div class="entry-header"><div>'
            f'<span class="entry-title">{safe(edu.get("degree", ""))}</span>'
            f'<span class="entry-sub"> · {safe(edu.get("school", ""))}</span>'
            "</div>"
            f'<span class="entry-date">{safe(edu.get("year", ""))}</span>'
            "</div></div>"
        )

    proj_html = ""
    for proj in projects:
        link_html = f' <span class="entry-sub">· {safe(proj.get("link", ""))}</span>' if proj.get("link") else ""
        proj_html += (
            '<div class="entry">'
            f'<p class="entry-title">{safe(proj.get("name", ""))}{link_html}</p>'
            + (f'<p class="summary-text">{safe(proj.get("description", ""))}</p>' if proj.get("description") else "")
            + (f'<p class="skills-text">{safe(proj.get("tech", ""))}</p>' if proj.get("tech") else "")
            + "</div>"
        )

    cert_html = ""
    for cert in certifications:
        cert_html += (
            '<div class="entry">'
            '<div class="entry-header"><div>'
            f'<span class="entry-title">{safe(cert.get("name", ""))}</span>'
            f'<span class="entry-sub"> · {safe(cert.get("issuer", ""))}</span>'
            "</div>"
            f'<span class="entry-date">{safe(cert.get("year", ""))}</span>'
            "</div></div>"
        )

    skills_html = " · ".join(safe(s) for s in skills if s)

    # Skills as pill badges (used in modern/creative templates)
    skills_pills = "".join(
        f'<span class="skill-pill">{safe(s)}</span>' for s in skills if s
    )

    contact_parts = [
        contact.get("email", ""),
        contact.get("phone", ""),
        contact.get("location", ""),
        contact.get("linkedin", ""),
    ]
    contact_line = " · ".join(safe(p) for p in contact_parts if p)

    def section(title_text: str, body: str) -> str:
        if not body:
            return ""
        return f'<div class="section"><div class="section-title">{title_text}</div>{body}</div>'

    name = safe(contact.get("name", title))

    # ── CLASSIC ──────────────────────────────────────────────────────────────
    if template == "classic":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 10pt; color: #1F2620; background: white; padding: 40px 48px; line-height: 1.5; }
        .name { font-size: 24pt; font-weight: 700; text-align: center; margin-bottom: 4px; letter-spacing: -0.01em; }
        .contact { text-align: center; font-size: 9pt; color: #6b7280; margin-bottom: 4px; }
        .linkedin { text-align: center; font-size: 9pt; color: #3E5C46; margin-bottom: 20px; }
        .divider { border: none; border-top: 1.5px solid #1F2620; margin: 0 0 18px; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 10px; font-family: 'Inter', sans-serif; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 600; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #6b7280; }
        .entry-date { font-size: 9pt; color: #9ca3af; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #374151; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #374151; line-height: 1.6; }
        .skills-text { font-size: 9.5pt; color: #374151; }
        .skill-pill { display: inline-block; border: 1px solid #d1d5db; padding: 1px 7px; border-radius: 2px; font-size: 9pt; margin: 2px 3px 2px 0; font-family: 'Inter', sans-serif; }
        """
        skills_body = f'<div>{skills_pills}</div>' if skills_pills else ""
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            f'<div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div>'
            '<hr class="divider">'
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", skills_body)
            + "</body></html>"
        )

    # ── MODERN ───────────────────────────────────────────────────────────────
    elif template == "modern":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 10pt; color: #0f172a; background: white; padding: 0; line-height: 1.5; display: flex; min-height: 100vh; }
        .sidebar { width: 190px; min-height: 100vh; background: #2563EB; color: white; padding: 28px 16px; flex-shrink: 0; }
        .sidebar .name { font-size: 14pt; font-weight: 700; color: white; margin-bottom: 4px; line-height: 1.2; }
        .sidebar .contact-item { font-size: 8.5pt; color: rgba(255,255,255,0.8); margin-bottom: 3px; word-break: break-all; }
        .sidebar .side-section { margin-top: 20px; }
        .sidebar .side-title { font-size: 7.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 7px; font-weight: 700; }
        .skill-pill-sidebar { display: inline-block; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 3px; font-size: 8.5pt; margin: 2px 2px 2px 0; }
        .sidebar .cert-item { font-size: 8.5pt; color: rgba(255,255,255,0.85); margin-bottom: 6px; }
        .sidebar .cert-item .cert-name { font-weight: 600; }
        .sidebar .cert-item .cert-sub { color: rgba(255,255,255,0.6); }
        .main { flex: 1; padding: 28px 28px 40px; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: #2563EB; font-weight: 700; border-bottom: 2px solid #2563EB; padding-bottom: 3px; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 600; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #2563EB; }
        .entry-date { font-size: 9pt; color: #94a3b8; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #374151; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #374151; line-height: 1.6; }
        .skills-text { font-size: 9.5pt; color: #374151; }
        """
        sidebar_skills = "".join(f'<span class="skill-pill-sidebar">{safe(s)}</span>' for s in skills if s)
        sidebar_certs = "".join(
            f'<div class="cert-item"><div class="cert-name">{safe(c.get("name",""))}</div>'
            f'<div class="cert-sub">{safe(c.get("issuer",""))} {safe(c.get("year",""))}</div></div>'
            for c in certifications
        )
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            '<div class="sidebar">'
            f'<div class="name">{name}</div>'
            + (f'<div class="contact-item">✉ {safe(contact.get("email",""))}</div>' if contact.get("email") else "")
            + (f'<div class="contact-item">✆ {safe(contact.get("phone",""))}</div>' if contact.get("phone") else "")
            + (f'<div class="contact-item">◎ {safe(contact.get("location",""))}</div>' if contact.get("location") else "")
            + (f'<div class="contact-item">in {safe(contact.get("linkedin",""))}</div>' if contact.get("linkedin") else "")
            + (f'<div class="side-section"><div class="side-title">Skills</div>{sidebar_skills}</div>' if sidebar_skills else "")
            + (f'<div class="side-section"><div class="side-title">Certifications</div>{sidebar_certs}</div>' if sidebar_certs else "")
            + '</div>'
            '<div class="main">'
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + "</div></body></html>"
        )

    # ── MINIMAL ──────────────────────────────────────────────────────────────
    elif template == "minimal":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; color: #111827; background: white; padding: 48px 56px; line-height: 1.6; }
        .name { font-size: 22pt; font-weight: 300; letter-spacing: -0.02em; margin-bottom: 4px; }
        .contact { font-size: 9pt; color: #6B7280; margin-bottom: 28px; }
        hr { border: none; border-top: 1px solid #E5E7EB; margin: 0 0 20px; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 8px; }
        .entry { margin-bottom: 9px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 500; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #6B7280; }
        .entry-date { font-size: 9pt; color: #9CA3AF; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 3px; padding-left: 14px; }
        .bullets li { font-size: 9.5pt; color: #4B5563; margin-bottom: 1px; }
        .summary-text { font-size: 9.5pt; color: #4B5563; line-height: 1.7; }
        .skills-text { font-size: 9.5pt; color: #4B5563; }
        """
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            f'<div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div>'
            "<hr>"
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", f'<p class="skills-text">{skills_html}</p>' if skills_html else "")
            + "</body></html>"
        )

    # ── BOLD ─────────────────────────────────────────────────────────────────
    elif template == "bold":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 10pt; color: #111827; background: white; padding: 0; line-height: 1.5; }
        .header { background: #111827; color: white; padding: 28px 44px; }
        .name { font-size: 26pt; font-weight: 800; color: #F59E0B; letter-spacing: -0.02em; margin-bottom: 5px; }
        .contact { font-size: 9pt; color: rgba(249,250,251,0.6); }
        .linkedin { font-size: 9pt; color: #F59E0B; opacity: 0.8; margin-top: 2px; }
        .body { padding: 24px 44px 40px; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 9.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #111827; border-left: 4px solid #F59E0B; padding-left: 8px; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 700; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #6B7280; }
        .entry-date { font-size: 9pt; color: #9CA3AF; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #374151; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #374151; line-height: 1.6; }
        .skill-pill { display: inline-block; background: #F3F4F6; border: 1px solid rgba(245,158,11,0.3); padding: 2px 8px; border-radius: 3px; font-size: 9pt; font-weight: 500; margin: 2px 3px 2px 0; }
        """
        skills_body = f'<div>{skills_pills}</div>' if skills_pills else ""
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            '<div class="header">'
            f'<div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div>'
            "</div>"
            '<div class="body">'
            + section("Profile", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", skills_body)
            + "</div></body></html>"
        )

    # ── EXECUTIVE ────────────────────────────────────────────────────────────
    elif template == "executive":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 10pt; color: #1C1917; background: white; padding: 40px 52px; line-height: 1.55; }
        .top-rule { border: none; border-top: 2px solid #7C3AED; margin-bottom: 2px; }
        .bottom-rule { border: none; border-top: 1px solid rgba(124,58,237,0.35); margin-bottom: 16px; }
        .name { font-size: 22pt; font-weight: 700; text-align: center; letter-spacing: 0.04em; margin-bottom: 4px; }
        .contact { text-align: center; font-size: 9pt; letter-spacing: 0.1em; text-transform: uppercase; color: #78716C; margin-bottom: 14px; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 8pt; font-family: 'Inter', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; color: #7C3AED; margin-bottom: 4px; font-weight: 700; }
        .section-rule { border: none; border-top: 1px solid #E7E5E4; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 700; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #78716C; }
        .entry-date { font-size: 9pt; color: #A8A29E; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #44403C; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #44403C; line-height: 1.7; font-style: italic; }
        .skills-text { font-size: 9.5pt; color: #44403C; }
        """

        def exec_section(title_text: str, body: str) -> str:
            if not body:
                return ""
            return (
                f'<div class="section">'
                f'<div class="section-title">{title_text}</div>'
                f'<hr class="section-rule">'
                f'{body}</div>'
            )

        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            '<hr class="top-rule">'
            '<hr class="bottom-rule">'
            f'<div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div>'
            + exec_section("Executive Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + exec_section("Professional Experience", exp_html)
            + exec_section("Internships", intern_html)
            + exec_section("Education", edu_html)
            + exec_section("Key Projects", proj_html)
            + exec_section("Certifications", cert_html)
            + exec_section("Core Competencies", f'<p class="skills-text">{skills_html}</p>' if skills_html else "")
            + "</body></html>"
        )

    # ── CREATIVE ─────────────────────────────────────────────────────────────
    elif template == "creative":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Helvetica Neue', sans-serif; font-size: 10pt; color: #134E4A; background: white; padding: 0; line-height: 1.5; display: flex; min-height: 100vh; }
        .sidebar { width: 185px; min-height: 100vh; background: #0D9488; color: white; padding: 28px 14px; flex-shrink: 0; }
        .avatar { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; font-size: 20pt; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 14px; }
        .avatar-img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.5); margin-bottom: 14px; display: block; }
        .sidebar .name { font-size: 13pt; font-weight: 700; color: white; margin-bottom: 12px; line-height: 1.2; }
        .sidebar .contact-item { font-size: 8pt; color: rgba(255,255,255,0.8); margin-bottom: 4px; word-break: break-all; }
        .sidebar .side-title { font-size: 7.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin: 18px 0 7px; font-weight: 700; }
        .skill-chip { display: inline-block; background: rgba(255,255,255,0.18); padding: 2px 6px; border-radius: 3px; font-size: 8pt; margin: 2px 2px 2px 0; }
        .cert-entry { font-size: 8.5pt; margin-bottom: 6px; color: rgba(255,255,255,0.85); }
        .cert-entry .cert-name { font-weight: 600; }
        .cert-entry .cert-sub { color: rgba(255,255,255,0.6); font-size: 7.5pt; }
        .main { flex: 1; padding: 28px 24px 40px; background: #F0FDFA; }
        .section { margin-bottom: 16px; }
        .section-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .section-bar { width: 16px; height: 2.5px; background: #0D9488; border-radius: 2px; }
        .section-title { font-size: 8pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0D9488; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 600; font-size: 10pt; color: #134E4A; }
        .entry-sub { font-size: 9.5pt; color: #0D9488; }
        .entry-date { font-size: 9pt; color: #6B7280; white-space: nowrap; margin-left: 10px; }
        .bullets { margin-top: 4px; padding-left: 14px; }
        .bullets li { font-size: 9.5pt; color: #1F5F5B; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #1F5F5B; line-height: 1.6; }
        .skills-text { font-size: 9.5pt; color: #1F5F5B; }
        """

        def creative_section(title_text: str, body: str) -> str:
            if not body:
                return ""
            return (
                '<div class="section">'
                '<div class="section-header">'
                '<div class="section-bar"></div>'
                f'<div class="section-title">{title_text}</div>'
                "</div>"
                f"{body}</div>"
            )

        sidebar_skills = "".join(f'<span class="skill-chip">{safe(s)}</span>' for s in skills if s)
        sidebar_certs = "".join(
            f'<div class="cert-entry"><div class="cert-name">{safe(c.get("name",""))}</div>'
            f'<div class="cert-sub">{safe(c.get("issuer",""))} · {safe(c.get("year",""))}</div></div>'
            for c in certifications
        )
        initial = (contact.get("name", "?") or "?")[0].upper()
        photo_uri = _photo_data_uri(content.get("photo_url"))
        avatar_html = (
            f'<img class="avatar-img" src="{photo_uri}" />'
            if photo_uri
            else f'<div class="avatar">{initial}</div>'
        )

        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            '<div class="sidebar">'
            f'{avatar_html}'
            f'<div class="name">{name}</div>'
            + (f'<div class="contact-item">{safe(contact.get("email",""))}</div>' if contact.get("email") else "")
            + (f'<div class="contact-item">{safe(contact.get("phone",""))}</div>' if contact.get("phone") else "")
            + (f'<div class="contact-item">{safe(contact.get("location",""))}</div>' if contact.get("location") else "")
            + (f'<div class="contact-item">{safe(contact.get("linkedin",""))}</div>' if contact.get("linkedin") else "")
            + (f'<div class="side-title">Skills</div>{sidebar_skills}' if sidebar_skills else "")
            + (f'<div class="side-title">Certifications</div>{sidebar_certs}' if sidebar_certs else "")
            + '</div>'
            '<div class="main">'
            + creative_section("About", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + creative_section("Experience", exp_html)
            + creative_section("Internships", intern_html)
            + creative_section("Education", edu_html)
            + creative_section("Projects", proj_html)
            + "</div></body></html>"
        )

    # ── fallback → classic ───────────────────────────────────────────────────
    else:
        return resume_to_html(content, title, "classic")


def generate_pdf(content: dict, title: str, template: str = "classic") -> bytes:
    try:
        from weasyprint import HTML
    except OSError as e:
        raise RuntimeError(
            "WeasyPrint system libraries not available locally. "
            "PDF export works on Render (Linux). "
            f"Original error: {e}"
        )
    html_string = resume_to_html(content, title, template)
    pdf = HTML(string=html_string).write_pdf()
    return pdf
