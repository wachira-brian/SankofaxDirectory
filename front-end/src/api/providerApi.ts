import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

export interface Provider {
id: string;
name: string;
address: string;
city: string;
zipCode?: string;
phone?: string;
email?: string;
website?: string;
description?: string;
rating: number;
reviewCount: number;
images: string[];
openingHours: Record<string, { open: string | null; close: string | null }>;
location: { lat: number; lng: number };
category: string;
subcategory: string;
createdAt: string;
}

export interface Offer {
id: string;
providerId: string;
name: string;
description?: string;
price: number;
duration: number;
category: string;
subcategory: string;
image?: string;
createdAt: string;
location: string;
}

export interface Category {
name: string;
slug: string;
subcategories: { name: string; slug: string }[];
}

const getAuthHeaders = () => ({
headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const providerApi = {
async fetchCategories(): Promise<Record<string, Category[]>> {
try {
    const response = await axios.get(`${API_BASE_URL}/api/categories`, getAuthHeaders());
    return response.data;
} catch (error) {
    throw new Error(`Failed to fetch categories: ${(error as AxiosError).message}`);
}
},

async fetchProviders(params: {
category?: string;
subcategory?: string;
search?: string;
}): Promise<Provider[]> {
try {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.subcategory) query.set('subcategory', params.subcategory);
    if (params.search) query.set('search', params.search);
    const response = await axios.get(`${API_BASE_URL}/api/providers?${query.toString()}`, getAuthHeaders());
    return response.data.providers;
} catch (error) {
    throw new Error(`Failed to fetch providers: ${(error as AxiosError).message}`);
}
},

async fetchOffers(params: {
category?: string;
subcategory?: string;
search?: string;
}): Promise<Offer[]> {
try {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.subcategory) query.set('subcategory', params.subcategory);
    if (params.search) query.set('search', params.search);
    const response = await axios.get(`${API_BASE_URL}/api/offers?${query.toString()}`, getAuthHeaders());
    return response.data.offers;
} catch (error) {
    throw new Error(`Failed to fetch offers: ${(error as AxiosError).message}`);
}
},
};