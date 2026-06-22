import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s — handles Render free tier cold starts
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || !error.response) {
      return Promise.reject({
        response: {
          data: {
            detail:
              "Server is waking up (free tier cold start). Please wait 30 seconds and try again.",
          },
        },
      });
    }
    return Promise.reject(error);
  }
);
