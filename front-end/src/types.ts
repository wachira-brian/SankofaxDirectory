export interface User {
  [x: string]: string | undefined;
  [x: string]: string | undefined;
  id: string;
  email: string;
  role: 'admin' | 'user';
  token?: string; // Optional token for auth store
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  checkAuth: () => Promise<void>;
}

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
  openingHours: Record<string, { open: string; close: string }>;
  location: { lat: number; lng: number };
  category: string;
  subcategory: string;
}

export interface Offer {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  duration: number;
  category: string;
  subcategory: string;
  image?: string;
}

export interface Booking {
  id: string;
  userId: string;
  offerId: string;
  providerId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid';
  paymentMethod: 'card' | 'cash';
  createdAt?: string;
}