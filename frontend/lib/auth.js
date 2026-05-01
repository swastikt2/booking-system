'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tn_token');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data.data))
        .catch(() => { localStorage.removeItem('tn_token'); localStorage.removeItem('tn_refresh'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('tn_token', data.accessToken);
    localStorage.setItem('tn_refresh', data.refreshToken);
    setUser(data.user);
    console.log('✅ Login successful:', data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('tn_token', data.accessToken);
    localStorage.setItem('tn_refresh', data.refreshToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tn_token');
    localStorage.removeItem('tn_refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
