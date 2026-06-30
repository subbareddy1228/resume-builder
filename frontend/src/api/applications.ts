import { apiClient } from "./client";

export type AppStatus = "applied" | "interview" | "offer" | "rejected";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: AppStatus;
  job_url: string | null;
  notes: string | null;
  resume_id: string | null;
  applied_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationPayload {
  company: string;
  role: string;
  status?: AppStatus;
  job_url?: string;
  notes?: string;
  resume_id?: string;
}

export async function listApplications(): Promise<JobApplication[]> {
  const { data } = await apiClient.get<JobApplication[]>("/api/applications");
  return data;
}

export async function createApplication(payload: CreateApplicationPayload): Promise<JobApplication> {
  const { data } = await apiClient.post<JobApplication>("/api/applications", payload);
  return data;
}

export async function updateApplication(
  id: string,
  payload: Partial<CreateApplicationPayload>
): Promise<JobApplication> {
  const { data } = await apiClient.put<JobApplication>(`/api/applications/${id}`, payload);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  await apiClient.delete(`/api/applications/${id}`);
}