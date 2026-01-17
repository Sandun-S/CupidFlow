import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAction } from '../../lib/audit';
import NICUploader from '../verification/NICUploader';
import { ArrowLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        about: '',
        profession: '',
        university: '',
        photos: [] as string[]
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
                        university: data.university || '',
                        photos: data.photos || []
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
            // Validate minimal data
            if (!formData.displayName) {
                alert("Display Name is required.");
                setSaving(false);
                return;
            }

            await updateDoc(doc(db, "profiles", user.uid), {
                displayName: formData.displayName,
                bio: formData.about,
                profession: formData.profession,
                university: formData.university || '',
                photos: formData.photos,
                avatar: formData.photos[0] || '' // Sync avatar with 1st photo
            });

            await logAction('PROFILE_UPDATE', {
                fields: ['displayName', 'bio', 'profession', 'photos'],
                photoCount: formData.photos.length
            });

            alert("Profile Updated!");
            navigate('/app/profile/view');
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpdate = (url: string, index: number) => {
        const newPhotos = [...(formData.photos || [])];
        // Ensure array is large enough
        while (newPhotos.length <= index) {
            newPhotos.push("");
        }
        newPhotos[index] = url;
        // Filter out empty strings if needed, but for fixed slots we might keep empty strings or handle holes.
        // Better to just set it.
        setFormData(prev => ({ ...prev, photos: newPhotos }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Nav */}
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

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* Photos Grid */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">My Photos</h3>
                        <span className="text-xs text-gray-500">Tap to upload</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <div key={idx} className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-pink-300 transition-colors">
                                <NICUploader
                                    label={`#${idx + 1}`}
                                    type="public"
                                    onUpload={(url) => handlePhotoUpdate(url, idx)}
                                    initialUrl={formData.photos[idx] || ''}
                                    minimal={true}
                                />
                                {!formData.photos[idx] && (
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <Camera size={20} className="mb-1" />
                                        <span className="text-[10px] font-medium">Upload</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fields */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Display Name</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            placeholder="Your Name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Profession</label>
                        <input
                            type="text"
                            value={formData.profession}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            placeholder="e.g. Engineer"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">University / College</label>
                        <input
                            type="text"
                            value={formData.university || ''}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            placeholder="e.g. University of Colombo"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">About Me</label>
                        <textarea
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
                            placeholder="Write something interesting..."
                            rows={4}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
