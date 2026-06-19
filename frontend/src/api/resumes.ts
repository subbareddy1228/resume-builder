import { apiClient } from "./client";
import { Resume, ResumeContent } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function createResume(title: string): Promise<Resume> {
  const defaultContent: ResumeContent = {
    contact: { name: "", email: "", phone: "", location: "", linkedin: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  };
  const { data } = await apiClient.post<Resume>("/api/resumes", {
    title,
    content: defaultContent,
  });
  return data;
}

export async function listResumes(): Promise<Resume[]> {
  const { data } = await apiClient.get<Resume[]>("/api/resumes");
  return data;
}

export async function getResume(id: string): Promise<Resume> {
  const { data } = await apiClient.get<Resume>(`/api/resumes/${id}`);
  return data;
}

export async function updateResume(
  id: string,
  payload: { title?: string; content?: ResumeContent }
): Promise<Resume> {
  const { data } = await apiClient.put<Resume>(`/api/resumes/${id}`, payload);
  return data;
}

export async function deleteResume(id: string): Promise<void> {
  await apiClient.delete(`/api/resumes/${id}`);
}


export interface ATSResult {
  resume_id: string;
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  total_keywords: number;
}

export async function scoreResume(
  resumeId: string,
  jdText: string
): Promise<ATSResult> {
  const { data } = await apiClient.post<ATSResult>("/api/ats/score", {
    resume_id: resumeId,
    jd_text: jdText,
  });
  return data;
}

export function streamRewrite(
  resumeId: string,
  section: string,
  currentText: string,
  jobDescription: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const token = localStorage.getItem("access_token");

  fetch(`${API_URL}/api/ai/rewrite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resume_id: resumeId,
      section,
      current_text: currentText,
      job_description: jobDescription,
    }),
  }).then(async (res) => {
    if (!res.ok) {
      onError("AI request failed");
      return;
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") { onDone(); return; }
          if (data.startsWith("[ERROR]")) { onError(data); return; }
          onChunk(data.replace(/\\n/g, "\n"));
        }
      }
    }
  }).catch(() => onError("Connection failed"));
}

export function streamBullet(
  resumeId: string,
  bullet: string,
  role: string,
  jobDescription: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const token = localStorage.getItem("access_token");

  fetch(`${API_URL}/api/ai/bullet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resume_id: resumeId,
      bullet,
      role,
      job_description: jobDescription,
    }),
  }).then(async (res) => {
    if (!res.ok) {
      onError("AI request failed");
      return;
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") { onDone(); return; }
          if (data.startsWith("[ERROR]")) { onError(data); return; }
          onChunk(data.replace(/\\n/g, "\n"));
        }
      }
    }
  }).catch(() => onError("Connection failed"));
}


export async function downloadPDF(resumeId: string, title: string): Promise<void> {
  const token = localStorage.getItem("access_token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_URL}/api/export/pdf/${resumeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("PDF export failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}


export interface MatchResult {
  job_id: string;
  job_title: string;
  resume_id: string;
  resume_title: string;
  match_score: number;
  similarity: number;
}

export async function saveJob(title: string, rawText: string) {
  const { data } = await apiClient.post("/api/jobs", {
    title,
    raw_text: rawText,
  });
  return data;
}

export async function matchResumeToJobs(resumeId: string): Promise<MatchResult[]> {
  const { data } = await apiClient.post<MatchResult[]>("/api/jobs/match", {
    resume_id: resumeId,
  });
  return data;
}