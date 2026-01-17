import { create } from 'zustand';
import { User } from 'firebase/auth';

export interface UserData {
    uid: string;
    email: string;
    displayName?: string;
    photoUrl?: string;
    isPremium: boolean;
    packageId: string; // 'free', 'silver', 'gold', 'platinum'
    boostedUntil?: any;
    accountExpiry?: any;
    accessStatus?: 'active' | 'pending_payment' | 'expired';
}

interface AuthState {
    user: User | null;
    userData: UserData | null; // Stores Firestore user doc
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
