import { useUserStore } from '../../../store/userStore';

const INTERESTS_LIST = [
    "Music", "Travel", "Foodie", "Movies", "Reading", "Gym / Fitness",
    "Sports", "Photography", "Gaming", "Cooking", "Dancing", "Art",
    "Tech", "Nature", "Pets", "Fashion", "Writing", "Politics",
    "Volunteering", "Swimming", "Hiking", "Yoga", "Meditation"
];

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
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Your Interests</h3>
            <p className="text-sm text-gray-500">Select up to 10 interests that describe you.</p>

            <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map((interest) => {
                    const isSelected = draft.interests?.includes(interest);
                    return (
                        <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSelected
                                    ? "bg-pink-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {interest}
                        </button>
                    );
                })}
            </div>

            <div className="text-sm text-gray-500 mt-2">
                Selected: {draft.interests?.length || 0}/10
            </div>
        </div>
    );
}
