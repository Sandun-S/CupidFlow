import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfileDraft {
    displayName: string;
    gender: "man" | "woman" | "non-binary" | "";
    birthDate: string;
    location: {
        district: string;
        city: string;
        province: string;
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
}

interface UserStore {
    draft: UserProfileDraft;
    updateDraft: (data: Partial<UserProfileDraft>) => void;
    resetDraft: () => void;
}

const initialDraft: UserProfileDraft = {
    displayName: "",
    gender: "",
    birthDate: "",
    location: { district: "", city: "", province: "" },
    ethnicity: "",
    religion: "",
    height: "",
    civilStatus: "",
    profession: "",
    education: "",
    family: { fatherProfession: "", motherProfession: "", siblings: "" },
    habits: { drinking: "", smoking: "", food: "" },
    bio: "",
    lookingFor: ""
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
