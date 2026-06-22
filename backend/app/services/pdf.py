def resume_to_html(content: dict, title: str) -> str:
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
            bullets_html = "".join(f"<li>{safe(b)}</li>" for b in item.get("bullets", []) if b)
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
        if not body: return ""
        return f'<div class="section"><div class="section-title">{title_text}</div>{body}</div>'

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

    name = safe(contact.get("name", title))

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


def generate_pdf(content: dict, title: str) -> bytes:
    try:
        from weasyprint import HTML
    except OSError as e:
        raise RuntimeError(
            "WeasyPrint system libraries not available locally. "
            "PDF export works on Render (Linux). "
            f"Original error: {e}"
        )
    html_string = resume_to_html(content, title)
    pdf = HTML(string=html_string).write_pdf()
    return pdf