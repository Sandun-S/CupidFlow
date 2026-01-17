import { Profile } from '../../store/userStore';
import { Heart, X, MapPin, Briefcase, Lock, Zap, Crown } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => void;
}

export default function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
    const { userData } = useAuthStore();
    const navigate = useNavigate();
    const isPremium = userData?.isPremium === true;

    // Handle birthDate (string) or dob (Timestamp) if legacy
    let age = 'N/A';
    if (profile.birthDate) {
        age = differenceInYears(new Date(), new Date(profile.birthDate)).toString();
    } else if ((profile as any).dob) {
        age = differenceInYears(new Date(), new Date((profile as any).dob.seconds * 1000)).toString();
    }

    return (
        <div className="relative w-full max-w-sm h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto">
            {/* Image & Blur Overlay */}
            <div className="absolute inset-0 bg-gray-200">
                {profile.photos?.[0] ? (
                    <img
                        src={profile.photos[0]}
                        alt={profile.displayName}
                        className={`w-full h-full object-cover transition-all duration-500 ${!isPremium ? 'blur-xl scale-110' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-300 font-bold text-4xl">
                        {profile.displayName[0]}
                    </div>
                )}

                {/* Premium Lock Overlay */}
                {!isPremium && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-6 text-center">
                        <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-white text-2xl font-bold mb-2">Upgrade to See Photos</h3>
                        <p className="text-white/80 mb-6 text-sm">Unlock clear photos and see who likes you with CupidFlow Premium.</p>
                        <button
                            onClick={() => navigate('/app/upgrade')}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            Unlock Now
                        </button>
                    </div>
                )}

                {/* Gradient Overlay for Text Visibility (Only if Premium or simple info) */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        {profile.displayName}, <span className="text-2xl font-normal opacity-90">{age}</span>
                        {/* Badges */}
                        {(profile as any).packageId === 'gold' && (
                            <div className="bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-lg" title="Gold Member">
                                <Zap size={20} fill="currentColor" />
                            </div>
                        )}
                        {(profile as any).packageId === 'platinum' && (
                            <div className="bg-purple-500 text-purple-100 rounded-full p-1 shadow-lg border border-purple-300" title="Platinum Member">
                                <Crown size={20} fill="currentColor" />
                            </div>
                        )}
                    </h2>
                </div>

                <div className="flex flex-wrap gap-2 text-sm opacity-90 mb-6">
                    {profile.location && (
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                            <MapPin size={14} /> {profile.location.city || profile.location.district}
                        </div>
                    )}
                    {profile.profession && (
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                            <Briefcase size={14} /> {profile.profession}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-8 items-center pb-4">
                    <button
                        onClick={() => onSwipe('left')}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl hover:scale-110 transition-transform"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => onSwipe('right')}
                        className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
                    >
                        <Heart size={32} fill="white" strokeWidth={0} />
                    </button>
                </div>
            </div>
        </div>
    );
}
