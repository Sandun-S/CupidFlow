import { useState, useEffect } from 'react';
import { useUserStore } from '../../../store/userStore';
import { DISTRICTS } from '../../../lib/constants'; // Import shared constants
import { auth, db } from '../../../lib/firebase';
import { CheckCircle } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ethnicities = ["Sinhalese", "Tamil", "Muslim", "Burgher", "Other"];
const religions = ["Buddhist", "Christian", "Hindu", "Islam", "Other"];

export default function BasicInfo() {
    const { draft, updateDraft } = useUserStore();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    useEffect(() => {
        // Check if user already has a phone saved
        const checkPhone = async () => {
            if (auth.currentUser) {
                const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (docSnap.exists() && docSnap.data().phone) {
                    setPhoneNumber(docSnap.data().phone);
                    setIsPhoneVerified(true);
                }
            }
        };
        checkPhone();
    }, []);

    // Simple save phone handler - just updates state/firestore on blur or change if needed
    // For now, we'll just let the user type it and it saves when they click Next (which saves draft)
    // But wait, the draft doesn't have phone, it's a separate user field.
    // Let's verify: The original code saved to 'users' collection on verify.
    // We should probably save it to draft or update the user doc when they type.
    // To keep it simple and consistent with "Basic Info" step, let's update the UserStore draft if it had phone,
    // but looking at store, it might not.
    // Actually, let's just update the Firestore 'users' doc when they change it or on blur.

    const handlePhoneChange = async (val: string) => {
        setPhoneNumber(val);
        // Debounce or save on blur would be better, but for simplicity:
        // We will just set local state. 
        // We need to ensure this gets saved to the backend eventually.
        // The previous code updated it immediately upon verification.
        // Let's add a "Save" button or just save on Blur.
    };

    const savePhone = async () => {
        if (auth.currentUser && phoneNumber) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                phone: phoneNumber
            });
            setIsPhoneVerified(true); // Treat as "saved"
        }
    };

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

            {/* Phone Section - Simplified */}
            <div className="bg-white border rounded-xl p-4 shadow-sm hover:border-pink-200 transition-colors">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number (For Notifications)</label>
                <div className="flex gap-2">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onBlur={savePhone}
                        className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-100 outline-none"
                        placeholder="+94 7X XXX XXXX"
                    />
                    {isPhoneVerified && <CheckCircle className="text-pink-500 mt-2" size={20} />}
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1">We'll save this automatically.</p>
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
                    <label className="block text-sm font-medium text-gray-700">Height (ft/cm)</label>
                    <input
                        type="text"
                        value={draft.height || ''}
                        onChange={(e) => updateDraft({ height: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="e.g. 5'8"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                    <select
                        value={draft.civilStatus || ''}
                        onChange={(e) => updateDraft({ civilStatus: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                    </select>
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
                            <option value="">Select District</option>
                            {DISTRICTS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
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
                    <label className="block text-sm font-medium text-gray-700">Address <span className="text-xs text-gray-500">(Private - Visible to Admin)</span></label>
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

            <div>
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <select
                    value={draft.education}
                    onChange={(e) => updateDraft({ education: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">Select Education</option>
                    <option value="G.C.E O/L">G.C.E O/L</option>
                    <option value="G.C.E A/L">G.C.E A/L</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelors">Bachelor's Degree</option>
                    <option value="Masters">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Other">Other</option>
                </select>

                {/* Conditional University Field */}
                {['Diploma', 'Bachelors', 'Masters', 'Doctorate'].includes(draft.education) && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                        <label className="block text-sm font-medium text-gray-700">University / Institute</label>
                        <input
                            type="text"
                            value={draft.university || ''}
                            onChange={(e) => updateDraft({ university: e.target.value })}
                            className="mt-1 w-full p-2 border rounded-md"
                            placeholder="e.g. University of Colombo"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
