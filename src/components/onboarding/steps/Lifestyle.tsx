import { useUserStore } from '../../../store/userStore';

export default function Lifestyle() {
    const { draft, updateDraft } = useUserStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Lifestyle & Habits</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Drinking</label>
                    <select
                        value={draft.habits.drinking}
                        onChange={(e) => updateDraft({ habits: { ...draft.habits, drinking: e.target.value as any } })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="No">No</option>
                        <option value="Socially">Socially</option>
                        <option value="Regularly">Regularly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Smoking</label>
                    <select
                        value={draft.habits.smoking}
                        onChange={(e) => updateDraft({ habits: { ...draft.habits, smoking: e.target.value as any } })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="No">No</option>
                        <option value="Socially">Socially</option>
                        <option value="Regularly">Regularly</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Food Preference</label>
                <select
                    value={draft.habits.food}
                    onChange={(e) => updateDraft({ habits: { ...draft.habits, food: e.target.value as any } })}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">Select</option>
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">About Me (Bio)</label>
                <textarea
                    value={draft.bio}
                    onChange={(e) => updateDraft({ bio: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">{draft.bio.length}/500</p>
            </div>
        </div>
    );
}
