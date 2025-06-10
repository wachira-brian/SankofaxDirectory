import { create } from 'zustand';
import axios, { AxiosError } from 'axios';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string, avatar?: string) => Promise<void>;
  logout: () => void;
  updateUser: (formData: FormData) => Promise<void>;
}

// Helper to handle localStorage
const storage = {
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  getToken: (): string | null => localStorage.getItem('token'),
  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.getUser(),
  isAuthenticated: !!storage.getUser(),
  isLoading: false,
  error: null,
  token: storage.getToken(),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User; token: string }>(`${import.meta.env.VITE_API_URL}/api/login`, { email, password });
      const { user, token } = response.data;
      storage.setUser(user);
      storage.setToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      set({
        error: err.response?.data?.error || 'Failed to login',
        isLoading: false,
      });
      throw err;
    }
  },

  signup: async (name: string, email: string, password: string, phone?: string, avatar?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User; token: string }>(`${import.meta.env.VITE_API_URL}/api/signup`, { name, email, password, phone, avatar });
      const { user, token } = response.data;
      storage.setUser(user);
      storage.setToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      set({
        error: err.response?.data?.error || 'Failed to signup',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    storage.setUser(null);
    storage.setToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const token = storage.getToken();
      console.log('API Request to:', `${import.meta.env.VITE_API_URL}/api/user`, 'with data:', formData);
      const response = await axios.put<{ user: User }>(`${import.meta.env.VITE_API_URL}/api/user`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const { user } = response.data;
      storage.setUser(user);
      set({ user, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      console.error('Update error:', err.response?.data?.error || err.message);
      set({
        error: err.response?.data?.error || 'Failed to update profile',
        isLoading: false,
      });
      throw err;
    }
  },
}));