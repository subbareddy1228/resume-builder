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

    return " ".join(parts)


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

    return {
        "score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "total_keywords": total,
    }