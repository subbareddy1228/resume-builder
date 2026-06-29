import re
from collections import Counter

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "we", "you", "they",
    "it", "this", "that", "as", "if", "then", "than", "so", "yet", "both",
    "either", "not", "no", "nor", "just", "also", "about", "into", "through",
    "during", "before", "after", "above", "below", "between", "each", "more",
    "most", "other", "some", "such", "only", "own", "same", "our", "their",
    "your", "my", "its", "use", "used", "using", "work", "working", "worked",
}


def extract_keywords(text: str, top_n: int = 40) -> list[str]:
    text = text.lower()
    words = re.findall(r"\b[a-z][a-z0-9+#.\-]{1,}\b", text)
    filtered = [w for w in words if w not in STOPWORDS and len(w) > 2]
    freq = Counter(filtered)
    return [word for word, _ in freq.most_common(top_n)]


def flatten_resume(content: dict) -> str:
    parts = []
    contact = content.get("contact", {})
    parts.append(contact.get("name", ""))
    parts.append(content.get("summary", ""))
    for exp in content.get("experience", []):
        parts.append(exp.get("role", ""))
        parts.append(exp.get("company", ""))
        parts.extend(exp.get("bullets", []))
    for edu in content.get("education", []):
        parts.append(edu.get("degree", ""))
        parts.append(edu.get("school", ""))
    parts.extend(content.get("skills", []))
    for proj in content.get("projects", []):
        parts.append(proj.get("name", ""))
        parts.append(proj.get("description", ""))
    return " ".join(parts)


def build_checklist(
    resume_content: dict,
    missing_keywords: list[str],
    score: int,
) -> list[dict]:
    items = []

    # ── 1. Missing keywords (top 5) ──────────────────────────────────────────
    if missing_keywords:
        top_missing = missing_keywords[:5]
        items.append({
            "priority": "high",
            "done": False,
            "title": "Add missing keywords to your resume",
            "detail": f"Include these in your skills or experience: {', '.join(top_missing)}",
            "impact": "+15–20 pts",
        })

    # ── 2. Summary section ────────────────────────────────────────────────────
    summary = resume_content.get("summary", "").strip()
    if not summary:
        items.append({
            "priority": "high",
            "done": False,
            "title": "Add a professional summary",
            "detail": "A tailored 2–3 sentence summary at the top significantly boosts ATS match.",
            "impact": "+10 pts",
        })
    elif len(summary.split()) < 20:
        items.append({
            "priority": "medium",
            "done": False,
            "title": "Expand your summary section",
            "detail": "Your summary is too short. Aim for 40–60 words mentioning your role and key skills.",
            "impact": "+5 pts",
        })
    else:
        items.append({
            "priority": "low",
            "done": True,
            "title": "Professional summary present",
            "detail": "Your resume has a summary section.",
            "impact": "",
        })

    # ── 3. Experience bullets ─────────────────────────────────────────────────
    experience = resume_content.get("experience", [])
    if not experience:
        items.append({
            "priority": "high",
            "done": False,
            "title": "Add work experience",
            "detail": "ATS systems heavily weight experience sections. Add at least one role.",
            "impact": "+20 pts",
        })
    else:
        thin_exp = [
            e for e in experience
            if len([b for b in e.get("bullets", []) if b.strip()]) < 2
        ]
        if thin_exp:
            items.append({
                "priority": "medium",
                "done": False,
                "title": "Add more bullet points to experience",
                "detail": f"{len(thin_exp)} role(s) have fewer than 2 bullets. Add achievements with numbers.",
                "impact": "+8 pts",
            })
        else:
            items.append({
                "priority": "low",
                "done": True,
                "title": "Experience section looks good",
                "detail": "All roles have sufficient bullet points.",
                "impact": "",
            })

    # ── 4. Skills section ─────────────────────────────────────────────────────
    skills = resume_content.get("skills", [])
    if len(skills) < 5:
        items.append({
            "priority": "high",
            "done": False,
            "title": "Add more skills",
            "detail": f"You have {len(skills)} skill(s). Add at least 8–12 relevant technical and soft skills.",
            "impact": "+10 pts",
        })
    else:
        items.append({
            "priority": "low",
            "done": True,
            "title": "Skills section populated",
            "detail": f"{len(skills)} skills listed.",
            "impact": "",
        })

    # ── 5. Education ──────────────────────────────────────────────────────────
    education = resume_content.get("education", [])
    if not education:
        items.append({
            "priority": "medium",
            "done": False,
            "title": "Add education details",
            "detail": "Many ATS systems filter by education. Add your highest qualification.",
            "impact": "+5 pts",
        })
    else:
        items.append({
            "priority": "low",
            "done": True,
            "title": "Education section present",
            "detail": f"{len(education)} qualification(s) listed.",
            "impact": "",
        })

    # ── 6. Contact completeness ───────────────────────────────────────────────
    contact = resume_content.get("contact", {})
    missing_contact = [
        f for f in ["name", "email", "phone", "location"]
        if not contact.get(f, "").strip()
    ]
    if missing_contact:
        items.append({
            "priority": "high",
            "done": False,
            "title": "Complete your contact information",
            "detail": f"Missing: {', '.join(missing_contact)}. Incomplete contact info can cause rejection.",
            "impact": "+5 pts",
        })
    else:
        items.append({
            "priority": "low",
            "done": True,
            "title": "Contact information complete",
            "detail": "Name, email, phone, and location are all filled in.",
            "impact": "",
        })

    # ── 7. Projects / certifications bonus ───────────────────────────────────
    projects = resume_content.get("projects", [])
    certs = resume_content.get("certifications", [])
    if not projects and not certs:
        items.append({
            "priority": "medium",
            "done": False,
            "title": "Add projects or certifications",
            "detail": "Projects and certifications increase keyword density and show initiative.",
            "impact": "+5 pts",
        })
    else:
        items.append({
            "priority": "low",
            "done": True,
            "title": "Projects or certifications present",
            "detail": f"{len(projects)} project(s), {len(certs)} certification(s).",
            "impact": "",
        })

    # Sort: high → medium → low, undone before done
    priority_order = {"high": 0, "medium": 1, "low": 2}
    items.sort(key=lambda x: (x["done"], priority_order[x["priority"]]))

    return items


def score_resume(resume_content: dict, jd_text: str) -> dict:
    jd_keywords = extract_keywords(jd_text, top_n=40)
    resume_text = flatten_resume(resume_content).lower()

    matched = []
    missing = []

    for kw in jd_keywords:
        if kw in resume_text:
            matched.append(kw)
        else:
            missing.append(kw)

    total = len(jd_keywords)
    score = round((len(matched) / total) * 100) if total > 0 else 0

    checklist = build_checklist(resume_content, missing, score)

    return {
        "score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "total_keywords": total,
        "checklist": checklist,
    }