import api from "./api/axiosInstance";

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data)    => api.post("/auth/login", data),
  register: (data)    => api.post("/auth/register", data),
  me:       ()        => api.get("/auth/me"),
};

// ── Vendors ───────────────────────────────────────────────────────
export const vendorAPI = {
  getAll:   ()        => api.get("/vendors"),
  getById:  (id)      => api.get(`/vendors/${id}`),
  create:   (data)    => api.post("/vendors", data),
  update:   (id,data) => api.put(`/vendors/${id}`, data),
  delete:   (id)      => api.delete(`/vendors/${id}`),
};

// ── Jobs ──────────────────────────────────────────────────────────
export const jobAPI = {
  getAll:         (params)    => api.get("/jobs", { params }),
  getById:        (id)        => api.get(`/jobs/${id}`),
  create:         (data)      => api.post("/jobs", data),
  update:         (id, data)  => api.put(`/jobs/${id}`, data),
  updateStatus:   (id, data)  => api.patch(`/jobs/${id}/status`, data),
  assignVendors:  (id, data)  => api.patch(`/jobs/${id}/assign-vendors`, data),
  delete:         (id)        => api.delete(`/jobs/${id}`),
};

// ── Candidates ────────────────────────────────────────────────────
export const candidateAPI = {
  getAll:         (params)    => api.get("/candidates", { params }),
  getById:        (id)        => api.get(`/candidates/${id}`),
  create:         (formData)  => api.post("/candidates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateStatus:   (id, data)  => api.patch(`/candidates/${id}/status`, data),
  update:         (id, data)  => api.put(`/candidates/${id}`, data),
  delete:         (id)        => api.delete(`/candidates/${id}`),
};

// ── Interviews ────────────────────────────────────────────────────
export const interviewAPI = {
  getAll:   (params)      => api.get("/interviews", { params }),
  getById:  (id)          => api.get(`/interviews/${id}`),
  create:   (data)        => api.post("/interviews", data),
  update:   (id, data)    => api.patch(`/interviews/${id}`, data),
  delete:   (id)          => api.delete(`/interviews/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats:       () => api.get("/dashboard/stats"),
  getVendorStats: () => api.get("/dashboard/vendor-stats"),
};
