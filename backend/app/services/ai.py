from app.config import settings


def _get_client():
    import anthropic
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def build_rewrite_prompt(section: str, current_text: str, job_description: str) -> str:
    return f"""You are an expert resume writer helping a candidate improve their resume.

The candidate wants to improve their "{section}" section to better match this job description:

<job_description>
{job_description}
</job_description>

Here is their current {section} text:

<current_text>
{current_text}
</current_text>

Rewrite the {section} to:
1. Use strong action verbs and quantifiable achievements where possible
2. Naturally incorporate relevant keywords from the job description
3. Be concise, professional, and impactful
4. Keep roughly the same length as the original

Return ONLY the rewritten text, no explanations or preamble."""


def build_bullet_prompt(bullet: str, role: str, job_description: str) -> str:
    return f"""You are an expert resume writer. Improve this resume bullet point for a {role} position.

Job description context:
<job_description>
{job_description[:1000]}
</job_description>

Current bullet point:
<bullet>
{bullet}
</bullet>

Rewrite the bullet to:
1. Start with a strong action verb
2. Include measurable impact where possible
3. Be relevant to the job description
4. Stay under 20 words

Return ONLY the improved bullet point, nothing else."""


def stream_suggestion(prompt: str):
    client = _get_client()
    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text