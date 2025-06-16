import { create } from 'zustand';

export interface Provider {
  id: string;
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
  isFeatured?: boolean;
  address?: string;
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
  offers: Offer[];
  filteredProviders: Provider[];
  filteredOffers: Offer[];
  userCount: number;
  admins: { id: string; name: string; email: string }[];
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
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  applyFilters: () => void;
  getProviderById: (id: string) => Provider | undefined; // Added getter
  getOffersByProviderId: (providerId: string) => Offer[]; // Ensure this exists
  searchTerm: string;
  selectedCategory: string | null;
}

export const useProviderStore = create<AdminStore>((set, get) => ({
  providers: [],
  offers: [],
  filteredProviders: [],
  filteredOffers: [],
  userCount: 0,
  admins: [],
  fetchProviders: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/providers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (response.ok) {
      const data = await response.json();
      set({ providers: data.providers || [], filteredProviders: data.providers || [] });
      get().applyFilters(); // Apply filters after fetching
    }
  },
  fetchOffers: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (response.ok) {
      const data = await response.json();
      set({ offers: data.offers || [], filteredOffers: data.offers || [] });
      get().applyFilters(); // Apply filters after fetching
    }
  },
  fetchUserCount: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/count`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (response.ok) {
      const data = await response.json();
      set({ userCount: data.count });
    }
  },
  fetchAdmins: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/admins`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (response.ok) {
      const data = await response.json();
      set({ admins: data.admins });
    }
  },
  createProvider: async (provider: FormData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/providers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: provider,
    });
    if (!response.ok) throw new Error('Failed to create provider');
  },
  updateProvider: async (id: string, provider: FormData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/providers/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: provider,
    });
    if (!response.ok) throw new Error('Failed to update provider');
  },
  deleteProvider: async (id: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/providers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to delete provider');
  },
  createOffer: async (offer: Partial<Offer>) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(offer),
    });
    if (!response.ok) throw new Error('Failed to create offer');
  },
  updateOffer: async (id: string, offer: Partial<Offer>) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(offer),
    });
    if (!response.ok) throw new Error('Failed to update offer');
  },
  deleteOffer: async (id: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/offers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to delete offer');
  },
  setFeaturedProvider: async (id: string, featured: boolean) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/providers/${id}/featured`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ isFeatured: featured }),
    });
    if (!response.ok) throw new Error('Failed to update featured status');
  },
  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().applyFilters(); // Apply filters when search term changes
  },
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
    get().applyFilters(); // Apply filters when category changes
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
