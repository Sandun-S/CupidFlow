import { useUserStore } from '../../../store/userStore';

export default function Interests() {
    const { draft, updateDraft } = useUserStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Lifestyle & Habits</h3>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Drinking</label>
                    <div className="flex gap-4 mt-2">
                        {["No", "Socially", "Regularly"].map((opt) => (
                            <label key={opt} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={draft.habits.drinking === opt}
                                    onChange={() => updateDraft({ habits: { ...draft.habits, drinking: opt as any } })}
                                    className="accent-pink-600"
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Smoking</label>
                    <div className="flex gap-4 mt-2">
                        {["No", "Socially", "Regularly"].map((opt) => (
                            <label key={opt} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={draft.habits.smoking === opt}
                                    onChange={() => updateDraft({ habits: { ...draft.habits, smoking: opt as any } })}
                                    className="accent-pink-600"
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Food Preference</label>
                    <div className="flex gap-4 mt-2">
                        {["Veg", "Non-Veg", "Vegan"].map((opt) => (
                            <label key={opt} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={draft.habits.food === opt}
                                    onChange={() => updateDraft({ habits: { ...draft.habits, food: opt as any } })}
                                    className="accent-pink-600"
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                    value={draft.bio}
                    onChange={(e) => updateDraft({ bio: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Tell us about yourself..."
                />
            </div>
        </div>
    );
}
