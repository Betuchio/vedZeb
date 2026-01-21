import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const adminApiInstance = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add admin token
adminApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
adminApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: (username, password) => adminApiInstance.post('/login', { username, password }),
  getMe: () => adminApiInstance.get('/me'),
  changePassword: (currentPassword, newPassword) =>
    adminApiInstance.put('/change-password', { currentPassword, newPassword }),

  // Stats
  getStats: () => adminApiInstance.get('/stats'),

  // Users
  getUsers: (params) => adminApiInstance.get('/users', { params }),
  getUser: (id) => adminApiInstance.get(`/users/${id}`),
  banUser: (id, reason) => adminApiInstance.put(`/users/${id}/ban`, { reason }),
  unbanUser: (id) => adminApiInstance.put(`/users/${id}/unban`),
  deleteUser: (id) => adminApiInstance.delete(`/users/${id}`),
  assignRole: (id, role, username, password) =>
    adminApiInstance.put(`/users/${id}/role`, { role, username, password }),

  // Profiles
  getProfiles: (params) => adminApiInstance.get('/profiles', { params }),
  updateProfile: (id, data) => adminApiInstance.put(`/profiles/${id}`, data),
  deleteProfile: (id) => adminApiInstance.delete(`/profiles/${id}`),

  // Messages
  getMessages: (params) => adminApiInstance.get('/messages', { params }),
  deleteMessage: (id) => adminApiInstance.delete(`/messages/${id}`),

  // Audit logs
  getAuditLogs: (params) => adminApiInstance.get('/audit-logs', { params })
};

export default adminApiInstance;
