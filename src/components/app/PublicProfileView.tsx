import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ArrowLeft, User, Briefcase, MapPin, Ruler, Book, Users, Wine, Settings as SettingsIcon, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function PublicProfileView() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docSnap = await getDoc(doc(db, "profiles", user.uid));
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    if (loading) return <div>Loading...</div>;
    // Handle case where profile hasn't been created yet
    if (!loading && !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <p className="mb-4 text-gray-600">Profile incomplete.</p>
                <button onClick={() => navigate('/onboarding')} className="bg-pink-600 text-white px-6 py-2 rounded-full font-bold">
                    Create Profile
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Nav */}
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-20 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold">My Profile</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/app/settings')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                        title="Settings"
                    >
                        <SettingsIcon size={20} />
                    </button>
                    <button
                        onClick={() => navigate('/app/profile/edit')}
                        className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-pink-700 transition"
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                </div>
            </nav>

            <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg overflow-hidden relative">
                {/* Main Photo */}
                <div className="relative h-96 w-full">
                    <img
                        src={profile.avatar || "https://via.placeholder.com/400"}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white pb-10">
                        <h2 className="text-3xl font-bold flex items-center gap-2">
                            {profile.displayName || "User"}, {profile.age || "??"}
                        </h2>
                        <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                            <MapPin size={16} /> {profile.location?.city || "Unknown City"}, {profile.location?.district || ""}
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Bio */}
                    {profile.bio && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">About Me</h3>
                            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <User size={20} className="text-pink-500" />
                            <div>
                                <p className="text-xs text-gray-500">Gender</p>
                                <p className="font-medium capitalize">{profile.gender || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <Briefcase size={20} className="text-pink-500" />
                            <div>
                                <p className="text-xs text-gray-500">Profession</p>
                                <p className="font-medium text-sm line-clamp-2">{profile.profession || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <Ruler size={20} className="text-pink-500" />
                            <div>
                                <p className="text-xs text-gray-500">Height</p>
                                <p className="font-medium">{profile.height || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <Book size={20} className="text-pink-500" />
                            <div>
                                <p className="text-xs text-gray-500">Education</p>
                                <p className="font-medium text-sm line-clamp-2">{profile.education || "N/A"}</p>
                                {profile.university && <p className="text-xs text-gray-500 mt-1">{profile.university}</p>}
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg col-span-2">
                            <Users size={20} className="text-pink-500 mt-1" />
                            <div className="w-full">
                                <p className="text-xs text-gray-500">Family</p>
                                <p className="text-xs font-medium mt-1">
                                    <span className="block text-gray-600">Father: {profile.family?.fatherProfession || 'N/A'}</span>
                                    <span className="block text-gray-600">Mother: {profile.family?.motherProfession || 'N/A'}</span>
                                    <span className="block text-gray-800 border-t border-gray-200 mt-1 pt-1">{profile.family?.siblings ? profile.family.siblings : 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg col-span-2">
                            <Wine size={20} className="text-pink-500" />
                            <div className="flex flex-wrap gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Drinking</p>
                                    <p className="font-medium text-sm">{profile.habits?.drinking || 'No'}</p>
                                </div>
                                <div className="border-l pl-2">
                                    <p className="text-xs text-gray-500">Smoking</p>
                                    <p className="font-medium text-sm">{profile.habits?.smoking || 'No'}</p>
                                </div>
                                <div className="border-l pl-2">
                                    <p className="text-xs text-gray-500">Food</p>
                                    <p className="font-medium text-sm">{profile.habits?.food || 'Any'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    {profile.interests && profile.interests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map((interest: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm border border-pink-100 font-medium">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery */}
                    {profile.photos && profile.photos.length > 1 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Gallery</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {profile.photos.slice(1).map((photo: string, idx: number) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img src={photo} className="w-full h-full object-cover" alt="Gallery" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Report Button Area (Disabled for own profile) */}
                    <div className="pt-8 border-t text-center text-gray-400 text-sm">
                        This is how other users will see your profile.
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
