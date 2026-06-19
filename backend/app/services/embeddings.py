from app.config import settings


def get_embedding(text: str) -> list[float]:
    from openai import OpenAI
    client = OpenAI(api_key=settings.openai_api_key)
    text = text.replace("\n", " ").strip()
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small",
    )
    return response.data[0].embedding


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    import numpy as np
    a = np.array(vec_a)
    b = np.array(vec_b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))