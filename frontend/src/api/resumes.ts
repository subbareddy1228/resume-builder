import { apiClient } from "./client";
import { Resume, ResumeContent } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function createResume(title: string): Promise<Resume> {
  const defaultContent: ResumeContent = {
    contact: { name: "", email: "", phone: "", location: "", linkedin: "" },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    internships: [],
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
    if (!res.ok) { onError("AI request failed"); return; }
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
    if (!res.ok) { onError("AI request failed"); return; }
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

export async function updateTemplate(
  id: string,
  template: string
): Promise<Resume> {
  const { data } = await apiClient.put<Resume>(`/api/resumes/${id}`, {
    template,
  });
  return data;
}


export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  content_snapshot: ResumeContent;
  created_at: string;
}

export async function listVersions(resumeId: string): Promise<ResumeVersion[]> {
  const { data } = await apiClient.get<ResumeVersion[]>(
    `/api/resumes/${resumeId}/versions`
  );
  return data;
}

export async function restoreVersion(
  resumeId: string,
  versionId: string
): Promise<Resume> {
  const { data } = await apiClient.post<Resume>(
    `/api/resumes/${resumeId}/versions/${versionId}/restore`
  );
  return data;
}


export function streamCoverLetter(
  resumeId: string,
  jobDescription: string,
  tone: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const token = localStorage.getItem("access_token");

  fetch(`${API_URL}/api/ai/cover-letter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resume_id: resumeId,
      job_description: jobDescription,
      tone,
    }),
  }).then(async (res) => {
    if (!res.ok) { onError("Cover letter request failed"); return; }
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


export interface ChecklistItem {
  priority: "high" | "medium" | "low";
  done: boolean;
  title: string;
  detail: string;
  impact: string;
}

export interface ATSResult {
  resume_id: string;
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  total_keywords: number;
  checklist: ChecklistItem[];
}

export interface ATSHistoryItem {
  id: string;
  score: number;
  jd_snippet: string | null;
  created_at: string;
}

export async function getATSHistory(resumeId: string): Promise<ATSHistoryItem[]> {
  const { data } = await apiClient.get<ATSHistoryItem[]>(`/api/ats/history/${resumeId}`);
  return data;
}