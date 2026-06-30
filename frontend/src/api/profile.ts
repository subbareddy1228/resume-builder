import { apiClient } from "./client";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  created_at: string;
  resume_count: number;
  ats_scans_used: number;
  ats_scans_limit: number;
  ai_suggestions_used: number;
  ai_suggestions_limit: number;
}

export async function getProfile(): Promise<Profile> {
  const { data } = await apiClient.get<Profile>("/api/auth/me");
  return data;
}

export async function updateProfile(fullName: string) {
  const { data } = await apiClient.put("/api/auth/me", { full_name: fullName });
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await apiClient.post("/api/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
}