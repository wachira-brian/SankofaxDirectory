import { create } from 'zustand';
import axios from 'axios';
import { Provider, Offer } from './providerStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  createdAt: string;
}

interface AdminState {
  providers: Provider[];
  offers: Offer[];
  featuredProviders: Provider[];
  userCount: number;
  admins: User[];
  fetchProviders: () => Promise<void>;
  fetchOffers: () => Promise<void>;
  fetchUserCount: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  createProvider: (provider: FormData) => Promise<void>;
  updateProvider: (id: string, provider: FormData) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  createOffer: (offer: Partial<Offer>) => Promise<void>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  setFeaturedProvider: (id: string, featured: boolean) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useAdminStore = create<AdminState>((set) => ({
  providers: [],
  offers: [],
  featuredProviders: [],
  userCount: 0,
  admins: [],
  fetchProviders: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/providers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set({
        providers: response.data.providers,
        featuredProviders: response.data.providers.filter((p: Provider) => p.isFeatured),
      });
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  },
  fetchOffers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/offers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set({ offers: response.data.offers });
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  },
  fetchUserCount: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set({ userCount: response.data.count });
    } catch (error) {
      console.error('Error fetching user count:', error);
      throw error;
    }
  },
  fetchAdmins: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/admins`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set({ admins: response.data.admins });
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },
  createProvider: async (provider) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/providers`, provider, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status !== 201) throw new Error('Failed to create provider');
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error(`Create provider failed: ${(error as Error).message}`);
    }
  },
  updateProvider: async (id, provider) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/providers/${id}`, provider, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status !== 200) throw new Error('Failed to update provider');
    } catch (error) {
      console.error('Error updating provider:', error);
      throw new Error(`Update provider failed: ${(error as Error).message}`);
    }
  },
  deleteProvider: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/providers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status !== 200) throw new Error('Failed to delete provider');
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw new Error(`Delete provider failed: ${(error as Error).message}`);
    }
  },
  createOffer: async (offer) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/offers`, offer, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 201) throw new Error('Failed to create offer');
    } catch (error) {
      console.error('Error creating offer:', error);
      throw new Error(`Create offer failed: ${(error as Error).message}`);
    }
  },
  updateOffer: async (id, offer) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/offers/${id}`, offer, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 200) throw new Error('Failed to update offer');
    } catch (error) {
      console.error('Error updating offer:', error);
      throw new Error(`Update offer failed: ${(error as Error).message}`);
    }
  },
  deleteOffer: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/offers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status !== 200) throw new Error('Failed to delete offer');
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw new Error(`Delete offer failed: ${(error as Error).message}`);
    }
  },
  setFeaturedProvider: async (id, featured) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/providers/${id}/featured`,
        { isFeatured: featured },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status !== 200) throw new Error('Failed to update featured status');
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw new Error(`Update featured status failed: ${(error as Error).message}`);
    }
  },
}));
