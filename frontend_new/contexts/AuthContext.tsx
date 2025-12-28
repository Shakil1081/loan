'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { User, AuthResponse } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axiosInstance.get('/me');
        const userData = response.data.data || response.data; // Handle both formats
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      console.log('Login response:', response.data);
      
      const { data } = response.data; // ResponseService wraps data in { success, message, data }
      console.log('Extracted data:', data);
      
      if (data && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('User set, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await axiosInstance.post('/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      console.log('Register response:', response.data);
      
      const { data } = response.data; // ResponseService wraps data in { success, message, data }
      console.log('Extracted data:', data);
      
      if (data && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('User registered, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    axiosInstance.post('/logout').finally(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    });
  };

  const hasRole = (roleName: string): boolean => {
    return user?.roles?.some((role) => role.name === roleName) || false;
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    
    // Super Admin has all permissions
    if (hasRole('Super Admin')) return true;
    
    // Check in all_permissions array from backend (includes direct + role permissions)
    return user.all_permissions?.includes(permissionName) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
