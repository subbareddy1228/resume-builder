import { apiClient } from "./client";
import { AuthResponse } from "../types/auth";

export async function registerUser(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/register", {
    email,
    password,
    full_name: fullName || null,
  });
  return data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/api/auth/me");
  return data;
}
