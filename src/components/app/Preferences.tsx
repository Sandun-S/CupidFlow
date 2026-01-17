import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultPreferences = {
    ageRange: { min: 20, max: 40 },
    gender: 'any',
    district: 'any',
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
            // alert("Preferences Saved!");
            navigate(-1);
        } catch (error) {
            console.error("Error saving preferences", error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold">Partner Preferences</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-pink-600 font-bold text-sm flex items-center gap-1 disabled:opacity-50"
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
            </nav>

            <div className="p-6 max-w-md mx-auto space-y-6">

                {/* Age Range */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-4">Age Range</h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={prefs.ageRange.min}
                            onChange={(e) => setPrefs({ ...prefs, ageRange: { ...prefs.ageRange, min: parseInt(e.target.value) } })}
                            className="w-20 p-2 border rounded center"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="number"
                            value={prefs.ageRange.max}
                            onChange={(e) => setPrefs({ ...prefs, ageRange: { ...prefs.ageRange, max: parseInt(e.target.value) } })}
                            className="w-20 p-2 border rounded center"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-4">Gender</h3>
                    <select
                        value={prefs.gender}
                        onChange={(e) => setPrefs({ ...prefs, gender: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="any">Any</option>
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                    </select>
                </div>

                {/* Religion */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-4">Religion</h3>
                    <select
                        value={prefs.religion}
                        onChange={(e) => setPrefs({ ...prefs, religion: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="any">Any</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Christian">Christian</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Islam">Islam</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
