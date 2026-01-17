import { useUserStore } from '../../../store/userStore';

const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara", "Jaffna", "Other"];
const ethnicities = ["Sinhalese", "Tamil", "Muslim", "Burgher", "Other"];
const religions = ["Buddhist", "Christian", "Hindu", "Islam", "Other"];

export default function BasicInfo() {
    const { draft, updateDraft } = useUserStore();

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                    type="text"
                    value={draft.displayName}
                    onChange={(e) => updateDraft({ displayName: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="e.g. Sandun S."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        value={draft.gender}
                        onChange={(e) => updateDraft({ gender: e.target.value as any })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                        type="date"
                        value={draft.birthDate}
                        onChange={(e) => updateDraft({ birthDate: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <select
                        value={draft.location.district}
                        onChange={(e) => updateDraft({ location: { ...draft.location, district: e.target.value } })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        type="text"
                        value={draft.location.city}
                        onChange={(e) => updateDraft({ location: { ...draft.location, city: e.target.value } })}
                        className="mt-1 w-full p-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
                    <select
                        value={draft.ethnicity}
                        onChange={(e) => updateDraft({ ethnicity: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        {ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Religion</label>
                    <select
                        value={draft.religion}
                        onChange={(e) => updateDraft({ religion: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        {religions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Profession</label>
                <input
                    type="text"
                    value={draft.profession}
                    onChange={(e) => updateDraft({ profession: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="Software Engineer"
                />
            </div>
        </div>
    );
}
