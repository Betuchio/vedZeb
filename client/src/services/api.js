import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  sendCode: (phone) => api.post('/auth/send-code', { phone }),
  verifyCode: (phone, code) => api.post('/auth/verify-code', { phone, code }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me')
};

// Profiles API
export const profilesApi = {
  getAll: (params) => api.get('/profiles', { params }),
  getOne: (id) => api.get(`/profiles/${id}`),
  getMy: () => api.get('/profiles/my'),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
  uploadPhoto: (id, formData) => api.post(`/profiles/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: (profileId, photoId) => api.delete(`/profiles/${profileId}/photos/${photoId}`),
  setPrimaryPhoto: (profileId, photoId) => api.put(`/profiles/${profileId}/photos/${photoId}/primary`)
};

// Contact Requests API
export const contactsApi = {
  create: (profileId, message) => api.post('/contact-requests', { profileId, message }),
  getAll: (type) => api.get('/contact-requests', { params: { type } }),
  updateStatus: (id, status) => api.put(`/contact-requests/${id}`, { status }),
  delete: (id) => api.delete(`/contact-requests/${id}`)
};

// Search Alerts API
export const alertsApi = {
  create: (filters) => api.post('/alerts', { filters }),
  getAll: () => api.get('/alerts'),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`)
};

export default api;
