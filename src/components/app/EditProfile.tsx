import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAction } from '../../lib/audit';
import NICUploader from '../verification/NICUploader';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State (Simplified for brevity, similar to Onboarding)
    const [formData, setFormData] = useState({
        displayName: '',
        about: '',
        profession: '',
        photos: [] as string[],
        interests: [] as string[]
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docSnap = await getDoc(doc(db, "profiles", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        displayName: data.displayName || '',
                        about: data.bio || '',
                        profession: data.profession || '',
                        photos: data.photos || [],
                        interests: data.interests || []
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "profiles", user.uid), {
                displayName: formData.displayName,
                bio: formData.about,
                profession: formData.profession,
                photos: formData.photos,
                avatar: formData.photos[0] || '' // Ensure avatar is sync
            });

            // Log Profile Update
            await logAction('PROFILE_UPDATE', {
                fields: ['displayName', 'bio', 'profession', 'photos'], // We could be more granular but this is sufficient
                photoCount: formData.photos.length
            });

            alert("Profile Updated!");
            navigate('/app/explore');
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpdate = (url: string, index: number) => {
        const newPhotos = [...formData.photos];
        newPhotos[index] = url;
        setFormData(prev => ({ ...prev, photos: newPhotos }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold">Edit Profile</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 text-pink-600 font-bold disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </nav>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Photos */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">My Photos</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <NICUploader
                                key={idx}
                                label={`#${idx + 1}`}
                                type="public"
                                onUpload={(url) => handlePhotoUpdate(url, idx)}
                                initialUrl={formData.photos[idx] || ''}
                            />
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                        <input
                            type="text"
                            value={formData.profession}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                        <textarea
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            rows={4}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
