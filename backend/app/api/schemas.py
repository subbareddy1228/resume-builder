# add to bottom of schemas.py

from pydantic import BaseModel


class ProjectItem(BaseModel):
    id: str
    name: str
    description: str
    tech: str
    link: str

class CertificationItem(BaseModel):
    id: str
    name: str
    issuer: str
    year: str

class InternshipItem(BaseModel):
    id: str
    company: str
    role: str
    start: str
    end: str
    bullets: list[str]