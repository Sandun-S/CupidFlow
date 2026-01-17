import { useState } from 'react';
import { useUserStore } from '../../../store/userStore';
import { Plus, X, User } from 'lucide-react';

const professions = [
    "Government Officer", "School Teacher", "Doctor", "Engineer", "Businessman",
    "Retired", "Housewife", "Private Sector Employee", "Self-Employed",
    "Farmer", "Military/Police", "Nurse", "Accountant", "Lawyer", "Deceased", "Other"
];

export default function FamilyDetails() {
    const { draft, updateDraft } = useUserStore();

    // Detailed Sibling State
    const [siblingGender, setSiblingGender] = useState('Brother');
    const [siblingStatus, setSiblingStatus] = useState('Student');
    const [siblingOrder, setSiblingOrder] = useState('Elder'); // New State
    const [siblingsList, setSiblingsList] = useState<{ gender: string, status: string, order: string }[]>([]);

    const addSibling = () => {
        const newItem = { gender: siblingGender, status: siblingStatus, order: siblingOrder };
        const newList = [...siblingsList, newItem];
        setSiblingsList(newList);
        updateSiblingString(newList);
    };

    const removeSibling = (idx: number) => {
        const newList = siblingsList.filter((_, i) => i !== idx);
        setSiblingsList(newList);
        updateSiblingString(newList);
    };

    const updateSiblingString = (list: { gender: string, status: string, order: string }[]) => {
        if (list.length === 0) {
            updateDraft({ family: { ...draft.family, siblings: "Only Child" } });
            return;
        }

        // Detailed string: "Elder Brother (Married), Younger Sister (Student)"
        const details = list.map(s => `${s.order} ${s.gender} (${s.status})`).join(", ");
        updateDraft({ family: { ...draft.family, siblings: details } });
    };

    // Helper to handle profession input
    const handleProfessionChange = (field: 'fatherProfession' | 'motherProfession', value: string) => {
        updateDraft({ family: { ...draft.family, [field]: value } });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Family Background</h3>
                <p className="text-sm text-gray-500">Tell us about your family. This helps find compatible matches.</p>
            </div>

            <div className="space-y-5">
                {/* Father's Profession */}
                <div className="bg-white border rounded-xl p-4 shadow-sm hover:border-pink-200 transition-colors">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Father's Profession</label>
                    <select
                        value={professions.includes(draft.family.fatherProfession) && draft.family.fatherProfession !== "Other" ? draft.family.fatherProfession : "Other"}
                        onChange={(e) => {
                            const val = e.target.value;
                            // If they select "Other", we set it to "Other" which triggers input
                            // If they select a real profession, we set it.
                            handleProfessionChange('fatherProfession', val);
                        }}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                        <option value="">Select Profession</option>
                        {professions.filter(p => p !== "Other").map(p => <option key={p} value={p}>{p}</option>)}
                        <option value="Other">Other</option>
                    </select>

                    {/* Show input if "Other" is selected OR if the current value is not in the standard list */}
                    {(draft.family.fatherProfession === "Other" || (!professions.includes(draft.family.fatherProfession) && draft.family.fatherProfession !== "")) && (
                        <input
                            type="text"
                            // If it's literally "Other", show empty to type. Otherwise show the custom value.
                            value={draft.family.fatherProfession === "Other" ? "" : draft.family.fatherProfession}
                            onChange={(e) => handleProfessionChange('fatherProfession', e.target.value)}
                            className="mt-3 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-100 outline-none animate-in fade-in slide-in-from-top-1"
                            placeholder="Please specify profession..."
                            autoFocus
                        />
                    )}
                </div>

                {/* Mother's Profession */}
                <div className="bg-white border rounded-xl p-4 shadow-sm hover:border-pink-200 transition-colors">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mother's Profession</label>
                    <select
                        value={professions.includes(draft.family.motherProfession) && draft.family.motherProfession !== "Other" ? draft.family.motherProfession : "Other"}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleProfessionChange('motherProfession', val);
                        }}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                        <option value="">Select Profession</option>
                        {professions.filter(p => p !== "Other").map(p => <option key={p} value={p}>{p}</option>)}
                        <option value="Other">Other</option>
                    </select>

                    {(draft.family.motherProfession === "Other" || (!professions.includes(draft.family.motherProfession) && draft.family.motherProfession !== "")) && (
                        <input
                            type="text"
                            value={draft.family.motherProfession === "Other" ? "" : draft.family.motherProfession}
                            onChange={(e) => handleProfessionChange('motherProfession', e.target.value)}
                            className="mt-3 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-100 outline-none animate-in fade-in slide-in-from-top-1"
                            placeholder="Please specify profession..."
                        />
                    )}
                </div>

                {/* Dynamic Siblings Builder */}
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Siblings</label>

                    {/* Add Sibling Form */}
                    <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded-lg">
                        <select
                            value={siblingGender}
                            onChange={(e) => setSiblingGender(e.target.value)}
                            className="flex-1 p-2 border rounded-md text-sm"
                        >
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                        </select>
                        <select
                            value={siblingOrder}
                            onChange={(e) => setSiblingOrder(e.target.value)}
                            className="flex-1 p-2 border rounded-md text-sm"
                        >
                            <option value="Elder">Elder</option>
                            <option value="Younger">Younger</option>
                            <option value="Twin">Twin</option>
                        </select>
                        <select
                            value={siblingStatus}
                            onChange={(e) => setSiblingStatus(e.target.value)}
                            className="flex-1 p-2 border rounded-md text-sm"
                        >
                            <option value="Student">Student</option>
                            <option value="Employed">Employed</option>
                            <option value="Married">Married</option>
                            <option value="Looking for work">Looking for work</option>
                            <option value="Studying Abroad">Studying Abroad</option>
                        </select>
                        <button
                            onClick={addSibling}
                            className="bg-pink-600 text-white p-2 rounded-md hover:bg-pink-700 transition"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Sibling List */}
                    <div className="space-y-2">
                        {siblingsList.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                                No siblings added (Selecting: Only Child)
                            </div>
                        ) : (
                            siblingsList.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-pink-50 text-pink-700 px-3 py-2 rounded-lg border border-pink-100">
                                    <div className="flex items-center gap-2">
                                        <User size={16} />
                                        <span className="font-medium">{item.order} {item.gender}</span>
                                        <span className="text-sm opacity-75">- {item.status}</span>
                                    </div>
                                    <button onClick={() => removeSibling(idx)} className="text-pink-400 hover:text-pink-700">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <p className="text-xs text-gray-400 mt-2 text-right">
                        Summary: {draft.family.siblings || "Only Child"}
                    </p>
                </div>
            </div>
        </div>
    );
}
