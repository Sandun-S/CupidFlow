
import { useUserStore } from '../../../store/userStore';

const professions = [
    "Government Officer", "School Teacher", "Doctor", "Engineer", "Businessman",
    "Retired", "Housewife", "Private Sector Employee", "Self-Employed",
    "Farmer", "Military/Police", "Nurse", "Accountant", "Lawyer", "Deceased", "Other"
];

const siblingOptions = [
    "Only Child", "1 Brother", "1 Sister", "1 Sibling",
    "2 Siblings", "3 Siblings", "4+ Siblings", "Other"
];

export default function FamilyDetails() {
    const { draft, updateDraft } = useUserStore();

    // Local state to handle 'Other' inputs visibility if needed, 
    // but better to check if value is in list.
    const isCustomProfession = (val: string) => val && !professions.includes(val) && val !== "Other";

    // We need to handle the case where existing data might be custom.
    const getSelectValue = (val: string, options: string[]) => {
        if (!val) return "";
        if (options.includes(val)) return val;
        return "Other";
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Family Background</h3>
            <p className="text-sm text-gray-500">Provide details about your family (Optional but Recommended)</p>

            {/* Father's Profession */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Father's Profession</label>
                <select
                    value={getSelectValue(draft.family.fatherProfession, professions)}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                            updateDraft({ family: { ...draft.family, fatherProfession: "Other" } });
                        } else {
                            updateDraft({ family: { ...draft.family, fatherProfession: val } });
                        }
                    }}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">Select</option>
                    {professions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {/* Show input if "Other" is selected OR if the value is custom (not in list) */}
                {(draft.family.fatherProfession === "Other" || isCustomProfession(draft.family.fatherProfession)) && (
                    <input
                        type="text"
                        value={draft.family.fatherProfession === "Other" ? "" : draft.family.fatherProfession}
                        onChange={(e) => updateDraft({ family: { ...draft.family, fatherProfession: e.target.value } })}
                        className="mt-2 w-full p-2 border rounded-md bg-gray-50"
                        placeholder="Specify Profession"
                        autoFocus
                    />
                )}
            </div>

            {/* Mother's Profession */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Mother's Profession</label>
                <select
                    value={getSelectValue(draft.family.motherProfession, professions)}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                            updateDraft({ family: { ...draft.family, motherProfession: "Other" } });
                        } else {
                            updateDraft({ family: { ...draft.family, motherProfession: val } });
                        }
                    }}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">Select</option>
                    {professions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {(draft.family.motherProfession === "Other" || isCustomProfession(draft.family.motherProfession)) && (
                    <input
                        type="text"
                        value={draft.family.motherProfession === "Other" ? "" : draft.family.motherProfession}
                        onChange={(e) => updateDraft({ family: { ...draft.family, motherProfession: e.target.value } })}
                        className="mt-2 w-full p-2 border rounded-md bg-gray-50"
                        placeholder="Specify Profession"
                        autoFocus
                    />
                )}
            </div>

            {/* Siblings */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Siblings</label>
                <select
                    value={getSelectValue(draft.family.siblings, siblingOptions)}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                            updateDraft({ family: { ...draft.family, siblings: "Other" } });
                        } else {
                            updateDraft({ family: { ...draft.family, siblings: val } });
                        }
                    }}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">Select</option>
                    {siblingOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {(draft.family.siblings === "Other" || (!siblingOptions.includes(draft.family.siblings) && draft.family.siblings !== "")) && (
                    <textarea
                        value={draft.family.siblings === "Other" ? "" : draft.family.siblings}
                        onChange={(e) => updateDraft({ family: { ...draft.family, siblings: e.target.value } })}
                        className="mt-2 w-full p-2 border rounded-md bg-gray-50"
                        rows={3}
                        placeholder="Describe your siblings..."
                        autoFocus
                    />
                )}
            </div>
        </div>
    );
}
