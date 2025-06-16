import { create } from 'zustand';
import axios, { AxiosError } from 'axios';
import { Booking } from '../types';

// Safe access to environment variable for Vite
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchUserBookings: (userId: string) => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchUserBookings: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<{ bookings: Booking[] }>(`${API_BASE_URL}/bookings/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set({ bookings: response.data.bookings, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      set({ error: err.response?.data?.error || 'Failed to fetch user bookings', isLoading: false });
      throw err;
    }
  },

  fetchAllBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<{ bookings: Booking[] }>(`${API_BASE_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set({ bookings: response.data.bookings, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      set({ error: err.response?.data?.error || 'Failed to fetch all bookings', isLoading: false });
      throw err;
    }
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ booking: Booking }>(`${API_BASE_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const newBooking: Booking = response.data.booking;
      set((state) => ({ bookings: [...state.bookings, newBooking], isLoading: false }));
      return newBooking;
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      set({ error: err.response?.data?.error || 'Failed to create booking', isLoading: false });
      throw err;
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as AxiosError<{ error?: string }>;
      set({ error: err.response?.data?.error || 'Failed to cancel booking', isLoading: false });
      throw err;
    }
  },
}));
