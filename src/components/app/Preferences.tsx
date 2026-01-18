import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ArrowLeft, SlidersHorizontal, MapPin, Users, BookHeart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultPreferences: {
    ageRange: { min: number; max: number };
    gender: string;
    district: string | string[];
    ethnicity: string;
    religion: string;
} = {
    ageRange: { min: 20, max: 40 },
    gender: 'any',
    district: 'any',
    ethnicity: 'any',
    religion: 'any'
};

export default function Preferences() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [prefs, setPrefs] = useState(defaultPreferences);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPrefs = async () => {
            if (!user) return;
            try {
                const docSnap = await getDoc(doc(db, "preferences", user.uid));
                if (docSnap.exists()) {
                    setPrefs(docSnap.data() as any);
                }
            } catch (error) {
                console.error("Error fetching preferences", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrefs();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "preferences", user.uid), prefs, { merge: true });
            navigate(-1);
        } catch (error) {
            console.error("Error saving preferences", error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    const OptionButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${active ? 'bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/30 dark:border-pink-500 dark:text-pink-400' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900 transition-colors duration-300">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between dark:bg-gray-900 dark:border-b dark:border-gray-800 transition-colors duration-300">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800">
                    <ArrowLeft className="text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Partner Preferences</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-pink-600 font-bold text-sm bg-pink-50 px-3 py-1.5 rounded-full hover:bg-pink-100 disabled:opacity-50 transition-colors dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </nav>

            <div className="p-5 max-w-md mx-auto space-y-6">

                {/* Header Info */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <SlidersHorizontal className="mb-4 opacity-80" size={32} />
                    <h2 className="text-xl font-bold mb-1">Customize Your Match</h2>
                    <p className="text-pink-100 text-sm opacity-90">We'll prioritize showing you people who match these preferences.</p>

                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* Age Range */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600 dark:bg-gray-700 dark:text-gray-300"><User size={20} /></div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Age Preference</h3>
                    </div>

                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{prefs.ageRange.min}</span>
                        <span className="text-gray-300 font-medium dark:text-gray-600">to</span>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{prefs.ageRange.max}</span>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block dark:text-gray-500">Min Age</label>
                            <input type="range" min="18" max="60" value={prefs.ageRange.min} onChange={e => setPrefs({ ...prefs, ageRange: { ...prefs.ageRange, min: parseInt(e.target.value) } })} className="w-full accent-pink-600 bg-gray-200 rounded-lg dark:bg-gray-700" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block dark:text-gray-500">Max Age</label>
                            <input type="range" min="18" max="70" value={prefs.ageRange.max} onChange={e => setPrefs({ ...prefs, ageRange: { ...prefs.ageRange, max: parseInt(e.target.value) } })} className="w-full accent-pink-600 bg-gray-200 rounded-lg dark:bg-gray-700" />
                        </div>
                    </div>
                </div>

                {/* Gender */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600 dark:bg-gray-700 dark:text-gray-300"><Users size={20} /></div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Gender</h3>
                    </div>
                    <div className="flex gap-2">
                        {['any', 'man', 'woman'].map(opt => (
                            <OptionButton
                                key={opt}
                                label={opt === 'any' ? 'Everyone' : opt === 'man' ? 'Men' : 'Women'}
                                active={prefs.gender === opt}
                                onClick={() => setPrefs({ ...prefs, gender: opt })}
                            />
                        ))}
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600 dark:bg-gray-700 dark:text-gray-300"><MapPin size={20} /></div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Location (Select Multiple)</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setPrefs({ ...prefs, district: 'any' })}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${prefs.district === 'any' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Anywhere
                        </button>
                        {['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Kurunegala', 'Kalutara', 'Matara', 'Ratnapura', 'Kegalle', 'Jaffna', 'Batticaloa', 'Anuradhapura', 'Nuwara Eliya', 'Puttalam', 'Badulla', 'Monaragala', 'Hambantota', 'Ampara', 'Trincomalee', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Kilinochchi', 'Polonnaruwa'].map(d => (
                            <button
                                key={d}
                                onClick={() => {
                                    let current = Array.isArray(prefs.district) ? [...prefs.district] : (prefs.district === 'any' ? [] : [prefs.district]);
                                    if (current.includes(d)) {
                                        current = current.filter(c => c !== d);
                                        if (current.length === 0) current = ['any']; // Default to any if empty
                                    } else {
                                        current = current.filter(c => c !== 'any'); // Remove 'any' if selecting specific
                                        current.push(d);
                                    }
                                    setPrefs({ ...prefs, district: current });
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${(Array.isArray(prefs.district) && prefs.district.includes(d)) || prefs.district === d
                                    ? 'bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/30 dark:border-pink-500 dark:text-pink-400'
                                    : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600 dark:bg-gray-700 dark:text-gray-300"><BookHeart size={20} /></div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Background</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block dark:text-gray-500">Religion</label>
                            <div className="flex flex-wrap gap-2">
                                {['any', 'Buddhist', 'Christian', 'Hindu', 'Islam'].map(opt => (
                                    <OptionButton
                                        key={opt}
                                        label={opt === 'any' ? 'Any' : opt}
                                        active={prefs.religion === opt}
                                        onClick={() => setPrefs({ ...prefs, religion: opt })}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block dark:text-gray-500">Ethnicity</label>
                            <div className="flex flex-wrap gap-2">
                                {['any', 'Sinhalese', 'Tamil', 'Muslim', 'Burgher'].map(opt => (
                                    <OptionButton
                                        key={opt}
                                        label={opt === 'any' ? 'Any' : opt}
                                        active={prefs.ethnicity === opt}
                                        onClick={() => setPrefs({ ...prefs, ethnicity: opt })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
