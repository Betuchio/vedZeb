import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkAdminAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await adminApi.getMe();
      if (response.data?.admin) {
        setAdmin(response.data.admin);
        setPermissions(response.data.permissions || []);
      } else {
        // Invalid response structure
        localStorage.removeItem('adminToken');
        setAdmin(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Admin auth check failed:', error.message);
      localStorage.removeItem('adminToken');
      setAdmin(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const adminLogin = useCallback(async (username, password) => {
    const response = await adminApi.login(username, password);
    const { token, admin } = response.data;

    localStorage.setItem('adminToken', token);
    setAdmin(admin);

    // Fetch permissions after login
    const meResponse = await adminApi.getMe();
    setPermissions(meResponse.data.permissions);

    return admin;
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setPermissions([]);
  }, []);

  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const value = {
    admin,
    permissions,
    loading,
    isAdminAuthenticated: !!admin,
    adminLogin,
    adminLogout,
    hasPermission,
    checkAdminAuth
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
