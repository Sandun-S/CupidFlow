import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Profile extends UserProfileDraft {
    id?: string;
    photos?: string[];
}

export interface UserProfileDraft {
    firstName: string;
    lastName: string;
    displayName: string;
    gender: "man" | "woman" | "non-binary" | "";
    birthDate: string;
    location: {
        district: string;
        city: string;
        province: string;
        address?: string; // Private address
    };
    ethnicity: string;
    religion: string;
    height: string;
    civilStatus: string;
    profession: string;
    education: string;

    family: {
        fatherProfession: string;
        motherProfession: string;
        siblings: string;
    };

    habits: {
        drinking: "No" | "Socially" | "Regularly" | "";
        smoking: "No" | "Socially" | "Regularly" | "";
        food: "Veg" | "Non-Veg" | "Vegan" | "";
    };

    bio: string;
    lookingFor: string;
    interests: string[];
    photos?: string[]; // Up to 6 URLs

    // Verification Draft Data
    nicFront?: string;
    nicBack?: string;
    selfie?: string;
    nicNumber?: string;
}

interface UserStore {
    draft: UserProfileDraft;
    updateDraft: (data: Partial<UserProfileDraft>) => void;
    resetDraft: () => void;
}

const initialDraft: UserProfileDraft = {
    firstName: "",
    lastName: "",
    displayName: "",
    gender: "",
    birthDate: "",
    location: { district: "", city: "", province: "", address: "" },
    ethnicity: "",
    religion: "",
    height: "",
    civilStatus: "",
    profession: "",
    education: "",
    family: { fatherProfession: "", motherProfession: "", siblings: "" },
    habits: { drinking: "", smoking: "", food: "" },
    bio: "",
    lookingFor: "",
    interests: [],
    photos: [],
    nicFront: "",
    nicBack: "",
    selfie: "",
    nicNumber: ""
};

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            draft: initialDraft,
            updateDraft: (data) => set((state) => ({
                draft: { ...state.draft, ...data }
            })),
            resetDraft: () => set({ draft: initialDraft }),
        }),
        {
            name: 'cupidflow-user-storage',
        }
    )
);
