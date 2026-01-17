import { useUserStore } from '../../../store/userStore';

const INTERESTS_CATEGORIES = {
    "Creative": ["Art", "Music", "Photography", "Writing", "Dancing", "DIY/Crafts", "Design"],
    "Active": ["Gym / Fitness", "Sports", "Hiking", "Swimming", "Yoga", "Running", "Cycling"],
    "Social": ["Travel", "Foodie", "Politics", "Volunteering", "Events", "Board Games"],
    "Relaxing": ["Movies", "Reading", "Cooking", "Gardening", "Pets", "Meditation", "Nature"],
    "Tech & Geek": ["Gaming", "Tech", "Coding", "Sci-Fi", "Anime"]
};

export default function Interests() {
    const { draft, updateDraft } = useUserStore();

    const toggleInterest = (interest: string) => {
        const current = draft.interests || [];
        if (current.includes(interest)) {
            updateDraft({ interests: current.filter(i => i !== interest) });
        } else {
            if (current.length >= 10) return; // Limit to 10
            updateDraft({ interests: [...current, interest] });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Your Interests</h3>
                <p className="text-sm text-gray-500">Select up to 10 interests that describe you perfectly.</p>
            </div>

            <div className="space-y-6 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(INTERESTS_CATEGORIES).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {items.map((interest) => {
                                const isSelected = draft.interests?.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${isSelected
                                            ? "bg-pink-600 text-white shadow-md ring-2 ring-pink-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className={`text-sm font-medium border-t pt-2 ${(draft.interests?.length || 0) >= 10 ? "text-red-500" : "text-gray-500"
                }`}>
                Selected: {draft.interests?.length || 0}/10
            </div>
        </div>
    );
}
