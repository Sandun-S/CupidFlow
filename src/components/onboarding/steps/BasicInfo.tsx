import { useUserStore } from '../../../store/userStore';

const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
    "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const ethnicities = ["Sinhalese", "Tamil", "Muslim", "Burgher", "Other"];
const religions = ["Buddhist", "Christian", "Hindu", "Islam", "Other"];

export default function BasicInfo() {
    const { draft, updateDraft } = useUserStore();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name <span className="text-xs text-gray-500">(Private)</span></label>
                    <input
                        type="text"
                        value={draft.firstName}
                        onChange={(e) => updateDraft({ firstName: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-xs text-gray-500">(Private)</span></label>
                    <input
                        type="text"
                        value={draft.lastName}
                        onChange={(e) => updateDraft({ lastName: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Display Name <span className="text-xs text-gray-500">(Visible to others)</span></label>
                <input
                    type="text"
                    value={draft.displayName}
                    onChange={(e) => updateDraft({ displayName: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="e.g. JD"
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

            <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
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
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Address <span className="text-xs text-gray-500">(Private)</span></label>
                    <textarea
                        value={draft.location.address || ''}
                        onChange={(e) => updateDraft({ location: { ...draft.location, address: e.target.value } })}
                        className="mt-1 w-full p-2 border rounded-md"
                        rows={2}
                        placeholder="Detailed address for verification..."
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
