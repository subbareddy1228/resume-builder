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

    # ── Template styles ──────────────────────────────────────────────────────

    if template == "modern":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; font-size: 10pt; color: #1e293b; background: white; padding: 0; line-height: 1.5; }
        .header { background: #1e293b; color: white; padding: 28px 48px 24px; margin-bottom: 24px; }
        .name { font-size: 24pt; font-weight: 700; color: white; margin-bottom: 4px; }
        .contact { font-size: 9pt; color: #94a3b8; }
        .body { padding: 0 48px 40px; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: #3b82f6; font-weight: 700; border-bottom: 2px solid #3b82f6; padding-bottom: 3px; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 600; font-size: 10pt; color: #1e293b; }
        .entry-sub { font-size: 9.5pt; color: #64748b; }
        .entry-date { font-size: 9pt; color: #94a3b8; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #374151; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #374151; line-height: 1.6; }
        .skills-text { font-size: 9.5pt; color: #374151; }
        """
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            f'<div class="header"><div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div></div>'
            '<div class="body">'
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", f'<p class="skills-text">{skills_html}</p>' if skills_html else "")
            + "</div></body></html>"
        )

    elif template == "minimal":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; color: #111; background: white; padding: 48px 56px; line-height: 1.6; }
        .name { font-size: 20pt; font-weight: 400; letter-spacing: 0.05em; margin-bottom: 4px; }
        .contact { font-size: 9pt; color: #888; margin-bottom: 32px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 8pt; letter-spacing: 0.2em; text-transform: uppercase; color: #999; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 500; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #666; }
        .entry-date { font-size: 9pt; color: #aaa; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 14px; }
        .bullets li { font-size: 9.5pt; color: #444; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #444; line-height: 1.7; }
        .skills-text { font-size: 9.5pt; color: #444; }
        """
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            f'<div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div>'
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", f'<p class="skills-text">{skills_html}</p>' if skills_html else "")
            + "</body></html>"
        )

    elif template == "bold":
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; font-size: 10pt; color: #111; background: white; padding: 0; line-height: 1.5; }
        .header { background: #111; color: white; padding: 32px 48px; margin-bottom: 0; }
        .name { font-size: 28pt; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .contact { font-size: 9pt; color: #aaa; }
        .body { padding: 28px 48px 40px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 10pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #111; border-left: 4px solid #111; padding-left: 8px; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 700; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #555; }
        .entry-date { font-size: 9pt; color: #888; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #333; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #333; line-height: 1.6; }
        .skills-text { font-size: 9.5pt; color: #333; font-weight: 500; }
        """
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            f'<div class="header"><div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div></div>'
            '<div class="body">'
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", f'<p class="skills-text">{skills_html}</p>' if skills_html else "")
            + "</div></body></html>"
        )

    else:  # classic (default)
        css = """
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; font-size: 10pt; color: #1F2620; background: white; padding: 40px 48px; line-height: 1.5; }
        .name { font-family: 'EB Garamond', serif; font-size: 26pt; font-weight: 600; text-align: center; margin-bottom: 4px; }
        .contact { text-align: center; font-size: 9pt; color: #6b7280; margin-bottom: 24px; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 10px; }
        .entry { margin-bottom: 10px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .entry-title { font-weight: 500; font-size: 10pt; }
        .entry-sub { font-size: 9.5pt; color: #6b7280; }
        .entry-date { font-size: 9pt; color: #9ca3af; white-space: nowrap; margin-left: 12px; }
        .bullets { margin-top: 4px; padding-left: 16px; }
        .bullets li { font-size: 9.5pt; color: #374151; margin-bottom: 2px; }
        .summary-text { font-size: 9.5pt; color: #374151; line-height: 1.6; }
        .skills-text { font-size: 9.5pt; color: #374151; }
        """
        return (
            "<!DOCTYPE html><html><head>"
            '<meta charset="utf-8" />'
            f"<style>{css}</style>"
            "</head><body>"
            f'<div class="name">{name}</div>'
            f'<div class="contact">{contact_line}</div>'
            + section("Summary", f'<p class="summary-text">{safe(summary)}</p>' if summary else "")
            + section("Experience", exp_html)
            + section("Internships", intern_html)
            + section("Education", edu_html)
            + section("Projects", proj_html)
            + section("Certifications", cert_html)
            + section("Skills", f'<p class="skills-text">{skills_html}</p>' if skills_html else "")
            + "</body></html>"
        )


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