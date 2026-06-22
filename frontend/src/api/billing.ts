import { apiClient } from "./client";

export interface BillingStatus {
  plan: "free" | "pro";
  subscription_status: string | null;
  limits: { resumes: number; ats_scans: number; ai_suggestions: number };
  usage:  { resumes: number; ats_scans: number; ai_suggestions: number };
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const { data } = await apiClient.get("/api/billing/status");
  return data;
}

export async function createCheckout(): Promise<string> {
  const { data } = await apiClient.post("/api/billing/create-checkout");
  return data.checkout_url;
}

export async function createPortal(): Promise<string> {
  const { data } = await apiClient.post("/api/billing/create-portal");
  return data.portal_url;
}
