import { Profile } from '../../store/userStore';
import { Heart, X, MapPin, Briefcase } from 'lucide-react';
import { differenceInYears } from 'date-fns';

interface ProfileCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => void;
}

export default function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
    // Handle birthDate (string) or dob (Timestamp) if legacy
    let age = 'N/A';
    if (profile.birthDate) {
        age = differenceInYears(new Date(), new Date(profile.birthDate)).toString();
    } else if ((profile as any).dob) {
        age = differenceInYears(new Date(), new Date((profile as any).dob.seconds * 1000)).toString();
    }

    return (
        <div className="relative w-full max-w-sm h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto">
            {/* Main Photo */}
            <img
                src={profile.photos?.[0] || 'https://via.placeholder.com/400x600'}
                alt={profile.displayName}
                className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2">
                    <h2 className="text-3xl font-bold flex items-end gap-2">
                        {profile.displayName}, <span className="text-2xl font-normal opacity-90">{age}</span>
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
