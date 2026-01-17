import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    userData: any | null; // Stores Firestore user doc (isPremium, etc.)
    loading: boolean;
    setUser: (user: User | null) => void;
    setUserData: (data: any | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    userData: null,
    loading: true,
    setUser: (user) => set({ user }),
    setUserData: (data) => set({ userData: data }),
    setLoading: (loading) => set({ loading }),
}));
