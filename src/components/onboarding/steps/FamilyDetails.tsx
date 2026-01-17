import { useUserStore } from '../../../store/userStore';

export default function FamilyDetails() {
    const { draft, updateDraft } = useUserStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Family Background</h3>
            <p className="text-sm text-gray-500">Provide details about your family (Optional but Recommended)</p>

            <div>
                <label className="block text-sm font-medium text-gray-700">Father's Profession</label>
                <input
                    type="text"
                    value={draft.family.fatherProfession}
                    onChange={(e) => updateDraft({ family: { ...draft.family, fatherProfession: e.target.value } })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="e.g. Retired Businessman"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Mother's Profession</label>
                <input
                    type="text"
                    value={draft.family.motherProfession}
                    onChange={(e) => updateDraft({ family: { ...draft.family, motherProfession: e.target.value } })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="e.g. Housewife"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Siblings</label>
                <textarea
                    value={draft.family.siblings}
                    onChange={(e) => updateDraft({ family: { ...draft.family, siblings: e.target.value } })}
                    className="mt-1 w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="e.g. 1 Elder Brother (Married), 1 Younger Sister (Student)"
                />
            </div>
        </div>
    );
}
