export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user';
  token?: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
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
  discountedPrice?: number; // Added to resolve ts(2339)
  duration: number;
  image?: string;
  category: string;
  subcategory: string;
}

export interface Booking {
  id: string;
  userId: string;
  offerId: string;
  providerId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  paymentMethod?: 'card' | 'cash';
  createdAt?: string;
}

export type Category = 
  | 'Hair' 
  | 'Nails' 
  | 'Facial' 
  | 'Massage' 
  | 'Makeup' 
  | 'Spa' 
  | 'Waxing' 
  | 'Eyebrows & Lashes';

export interface Salon {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  openingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
}