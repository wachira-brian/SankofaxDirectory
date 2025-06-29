import { create } from 'zustand';

export interface Provider {
  id: string;
  userId?: string;
  username: string;
  name: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  images: string[];
  openingHours: Record<string, { open: string; close: string }>;
  category: string;
  subcategory: string;
  location?: string;
  zipCode?: string;
  address?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  providerId: string;
  name: string;
  price?: number;
  originalPrice?: number;
  discountedPrice?: number;
  duration?: number;
  category: string;
  subcategory: string;
  description?: string;
}

interface AdminStore {
  providers: Provider[];
  userProviders: Provider[];
  offers: Offer[];
  filteredProviders: Provider[];
  filteredOffers: Offer[];
  userCount: number;
  admins: { id: string; name: string; email: string }[];
  fetchProviders: () => Promise<void>;
  fetchUserProviders: () => Promise<void>;
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
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  applyFilters: () => void;
  getProviderById: (id: string) => Provider | undefined;
  getOffersByProviderId: (providerId: string) => Offer[];
  searchTerm: string;
  selectedCategory: string | null;
}

export const useProviderStore = create<AdminStore>((set, get) => ({
  providers: [],
  userProviders: [],
  offers: [],
  filteredProviders: [],
  filteredOffers: [],
  userCount: 0,
  admins: [],
  fetchProviders: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/providers`);
      if (response.ok) {
        const data = await response.json();
        set({ providers: data.providers || [], filteredProviders: data.providers || [] });
        get().applyFilters();
      } else {
        throw new Error('Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  },
  fetchUserProviders: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user-providers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        set({ userProviders: data.providers || [] });
      } else {
        throw new Error('Failed to fetch user providers');
      }
    } catch (error) {
      console.error('Error fetching user providers:', error);
    }
  },
  fetchOffers: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/offers`);
      if (response.ok) {
        const data = await response.json();
        set({ offers: data.offers || [], filteredOffers: data.offers || [] });
        get().applyFilters();
      } else {
        throw new Error('Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  },
  fetchUserCount: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        set({ userCount: data.count });
      } else {
        throw new Error('Failed to fetch user count');
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  },
  fetchAdmins: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/admins`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        set({ admins: data.admins });
      } else {
        throw new Error('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  },
  createProvider: async (provider: FormData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/providers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: provider,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create provider');
      }
      await get().fetchUserProviders(); // Refresh user providers
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  },
  updateProvider: async (id: string, provider: FormData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: provider,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update provider');
      }
      await get().fetchUserProviders(); // Refresh user providers
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  },
  deleteProvider: async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/providers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete provider');
      }
      await get().fetchUserProviders(); // Refresh user providers
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  },
  createOffer: async (offer: Partial<Offer>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(offer),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create offer');
      }
      await get().fetchOffers();
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  },
  updateOffer: async (id: string, offer: Partial<Offer>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(offer),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update offer');
      }
      await get().fetchOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  },
  deleteOffer: async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete offer');
      }
      await get().fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  },
  setFeaturedProvider: async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/providers/${id}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isFeatured: featured }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update featured status');
      }
      await get().fetchUserProviders(); // Refresh user providers
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw error;
    }
  },
  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().applyFilters();
  },
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },
  applyFilters: () => {
    const { providers, offers, searchTerm, selectedCategory } = get();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const newFilteredProviders = providers.filter((provider) => {
      const matchesSearch = !searchTerm || 
        provider.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        provider.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
        provider.city.toLowerCase().includes(lowerCaseSearchTerm);
      const matchesCategory = !selectedCategory || provider.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const newFilteredOffers = offers.filter((offer) => {
      const matchesSearch = !searchTerm || 
        offer.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        offer.description?.toLowerCase().includes(lowerCaseSearchTerm);
      const matchesCategory = !selectedCategory || offer.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    set({ filteredProviders: newFilteredProviders, filteredOffers: newFilteredOffers });
  },
  getProviderById: (id: string) => {
    return get().providers.find((provider) => provider.id === id);
  },
  getOffersByProviderId: (providerId: string) => {
    return get().offers.filter((offer) => offer.providerId === providerId);
  },
  searchTerm: '',
  selectedCategory: null,
}));
