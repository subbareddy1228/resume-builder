import { apiClient } from "./client";
import { Resume } from "../types/auth";

export async function importResumeFile(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<Resume>("/api/import/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000, // parsing can take longer than the default 30s
  });
  return data;
}

export async function uploadPhoto(resumeId: string, file: File): Promise<{ photo_url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ photo_url: string }>(
    `/api/photos/${resumeId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deletePhoto(resumeId: string): Promise<void> {
  await apiClient.delete(`/api/photos/${resumeId}`);
}
