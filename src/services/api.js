import axios from 'axios';

const API_BASE_URL = 'https://resumescorerbackend-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API
export const resumeAPI = {
  upload: (file, email) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_email', email);
    return api.post('/resumes/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAnalysis: (id) => api.get(`/resumes/${id}/analysis/`),
  list: () => api.get('/resumes/list/'),
};

// Jobs API
export const jobsAPI = {
  search: (query, location) => api.get('/jobs/search/', {
    params: { query, location }
  }),
  getDetails: (id) => api.get(`/jobs/${id}/`),
  getRecentSearches: () => api.get('/jobs/recent-searches/'),
};

// Scoring API
export const scoringAPI = {
  calculate: (resumeId, jobIds) => api.post('/scoring/calculate/', {
    resume_id: resumeId,
    job_ids: jobIds
  }),
  getResumeScores: (id) => api.get(`/scoring/resume/${id}/`),
  getAnalytics: (id) => api.get(`/scoring/analytics/${id}/`),
  getComparison: (id) => api.get(`/scoring/comparison/${id}/`),
};

export default api;