import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Briefcase, MapPin, Ruler, Book, Users, Wine, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PublicProfileView() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Derived State: Age
    let displayAge = profile?.age;
    if (profile?.birthDate) {
        const today = new Date();
        const birthDate = new Date(profile.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        displayAge = age;
    }

    // Check if we are viewing *another* user (passed via location state or query?)
    // Or if this is for the current user.
    // Ideally this component should accept a prop or read from URL param `:uid`
    // But currently routes as `/app/profile/view`.
    // Let's modify it to default to `user.uid` but accept an ID?
    // Actually, for Admin view, we need a way to pass the target UID.
    // I'll update it to check for `location.state.uid` if provided.

    const location = useLocation();
    const targetUid = location.state?.uid || user?.uid;
    const isOwner = targetUid === user?.uid;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!targetUid) return;
            try {
                const docSnap = await getDoc(doc(db, "profiles", targetUid));
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
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-white min-h-screen md:min-h-0 md:h-auto md:mt-8 md:rounded-3xl md:shadow-xl md:overflow-hidden dark:bg-gray-900 dark:shadow-none transition-colors duration-300">

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left Column: Photos (Desktop) / Main Carousel (Mobile) */}
                    <div className="relative h-96 md:h-full min-h-[400px]">
                        <div
                            className="relative h-full w-full cursor-pointer group"
                            onClick={(e) => {
                                // Tap Logic
                                const width = e.currentTarget.offsetWidth;
                                const x = e.nativeEvent.offsetX;
                                const photos = profile.photos || [];
                                if (photos.length <= 1) return;
                                if (x < width * 0.35) setCarouselIndex(prev => prev === 0 ? prev : prev - 1);
                                else if (x > width * 0.65) setCarouselIndex(prev => prev === photos.length - 1 ? prev : prev + 1);
                            }}
                        >
                            <img
                                src={profile.photos?.[carouselIndex] || profile.avatar || "https://via.placeholder.com/400"}
                                alt={profile.displayName}
                                className="w-full h-full object-cover"
                            />

                            {/* Desktop Hover Arrows */}
                            {profile.photos && profile.photos.length > 1 && (
                                <div className="absolute inset-0 flex justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
                                    <button onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => prev > 0 ? prev - 1 : prev) }} className="p-2 bg-black/30 text-white rounded-full hover:bg-black/50 backdrop-blur-sm">
                                        ←
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => prev < (profile.photos?.length || 0) - 1 ? prev + 1 : prev) }} className="p-2 bg-black/30 text-white rounded-full hover:bg-black/50 backdrop-blur-sm">
                                        →
                                    </button>
                                </div>
                            )}

                            {/* Mobile Indicators */}
                            {profile.photos && profile.photos.length > 1 && (
                                <div className="absolute top-2 left-0 right-0 flex gap-1 px-4 z-10 md:hidden">
                                    {profile.photos.map((_: any, idx: number) => (
                                        <div key={idx} className={`h-1 flex-1 rounded-full ${idx === carouselIndex ? 'bg-white' : 'bg-white/40'}`} />
                                    ))}
                                </div>
                            )}

                            {/* Settings Button (Owner Only) - Floating on Mobile, inline on Desktop? Keep floating for consistency */}
                            {isOwner && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/app/settings');
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition backdrop-blur-sm z-20"
                                    title="Settings"
                                >
                                    <SettingsIcon size={24} />
                                </button>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white md:hidden">
                                <h2 className="text-3xl font-bold flex items-center gap-2">
                                    {profile.displayName || "User"}, {displayAge || "??"}
                                </h2>
                                <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                                    <MapPin size={16} /> {profile.location?.city || "Unknown City"}, {profile.location?.district || ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="p-6 space-y-6 md:h-[600px] md:overflow-y-auto custom-scrollbar">
                        {/* Desktop Header Name */}
                        <div className="hidden md:block mb-4">
                            <h2 className="text-4xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                {profile.displayName || "User"}, {displayAge || "??"}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-500 mt-2 dark:text-gray-400">
                                <MapPin size={18} /> {profile.location?.city || "Unknown City"}, {profile.location?.district || ""}
                            </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 dark:text-white">About Me</h3>
                                <p className="text-gray-600 leading-relaxed dark:text-gray-300">{profile.bio}</p>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg dark:bg-gray-800 dark:text-gray-200">
                                <User size={20} className="text-pink-500" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                                    <p className="font-medium capitalize">{profile.gender || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg dark:bg-gray-800 dark:text-gray-200">
                                <Briefcase size={20} className="text-pink-500" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Profession</p>
                                    <p className="font-medium text-sm line-clamp-2">{profile.profession || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg dark:bg-gray-800 dark:text-gray-200">
                                <Ruler size={20} className="text-pink-500" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                                    <p className="font-medium">{profile.height || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg dark:bg-gray-800 dark:text-gray-200">
                                <Book size={20} className="text-pink-500" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Education</p>
                                    <p className="font-medium text-sm line-clamp-2">{profile.education || "N/A"}</p>
                                </div>
                            </div>

                            {/* NEW: University / Education (if available) */}
                            {profile.university && (
                                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg col-span-2 dark:bg-gray-800 dark:text-gray-200">
                                    <BookOpen size={20} className="text-pink-500" />
                                    <div>
                                        <p className="font-bold text-sm">Studies at</p>
                                        <p className="text-sm">{profile.university}</p>
                                    </div>
                                </div>
                            )}

                            {/* NEW: Family Details (if available) */}
                            {profile.family && (profile.family.fatherProfession || profile.family.motherProfession) && (
                                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-2 rounded-lg col-span-2 dark:bg-gray-800 dark:text-gray-200">
                                    <Users size={20} className="text-pink-500" />
                                    <div>
                                        <p className="font-bold text-sm">Family Background</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {[
                                                profile.family.fatherProfession ? `Father: ${profile.family.fatherProfession}` : '',
                                                profile.family.motherProfession ? `Mother: ${profile.family.motherProfession}` : ''
                                            ].filter(Boolean).join(' • ')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg col-span-2 dark:bg-gray-800 dark:text-gray-200">
                                <Wine size={20} className="text-pink-500" />
                                <div className="flex flex-wrap gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Drinking</p>
                                        <p className="font-medium text-sm">{profile.habits?.drinking || 'No'}</p>
                                    </div>
                                    <div className="border-l pl-2 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Smoking</p>
                                        <p className="font-medium text-sm">{profile.habits?.smoking || 'No'}</p>
                                    </div>
                                    <div className="border-l pl-2 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Food</p>
                                        <p className="font-medium text-sm">{profile.habits?.food || 'Any'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interests */}
                        {profile.interests && profile.interests.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-white">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map((interest: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm border border-pink-100 font-medium dark:bg-pink-900/30 dark:border-pink-500 dark:text-pink-300">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery Thumbnails (Desktop) */}
                        {profile.photos && profile.photos.length > 1 && (
                            <div className="hidden md:block">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-white">Gallery</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {profile.photos.map((photo: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${carouselIndex === idx ? 'border-pink-500' : 'border-transparent'}`}
                                            onClick={() => setCarouselIndex(idx)}
                                        >
                                            <img src={photo} className="w-full h-full object-cover" alt="Gallery" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Report Button Area */}
                        {isOwner ? (
                            <div className="pt-8 border-t text-center text-gray-400 text-sm dark:border-gray-800">
                                This is how other users will see your profile.
                            </div>
                        ) : (
                            <div className="pt-8 border-t text-center dark:border-gray-800">
                                <button
                                    onClick={() => alert("Report User feature coming soon")}
                                    className="text-red-500 font-bold text-sm hover:underline"
                                >
                                    Report this user
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
