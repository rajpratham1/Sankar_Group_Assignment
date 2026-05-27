import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// ─── LEAD API CALLS ───────────────────────────────────────────────────────────

export const leadsApi = {
  getAll: (params = {}) => api.get("/leads", { params }),

  getById: (id) => api.get(`/leads/${id}`),

  create: (data) => api.post("/leads", data),

  updateStatus: (id, data) => api.patch(`/leads/${id}/status`, data),

  delete: (id) => api.delete(`/leads/${id}`),

  getStats: () => api.get("/leads/stats"),
};

export default api;
