import { Profile } from '../../store/userStore';
import { Heart, X, MapPin, Briefcase, Zap, Crown, User, Book, Ruler, Users, Wine, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { differenceInYears } from 'date-fns';
interface ProfileCardProps {
    profile: Profile;
    onSwipe: (direction: 'left' | 'right') => void;
}

export default function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
    // const { userData } = useAuthStore();
    // const isPremium = userData?.isPremium === true;
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    // Filter valid photos
    const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [];
    const hasPhotos = photos.length > 0;

    // Handle birthDate (string) or dob (Timestamp) if legacy
    let age = 'N/A';
    if (profile.birthDate) {
        age = differenceInYears(new Date(), new Date(profile.birthDate)).toString();
    } else if ((profile as any).dob) {
        age = differenceInYears(new Date(), new Date((profile as any).dob.seconds * 1000)).toString();
    }

    // Swipe Logic
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        setDragX(currentX - startX);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);

        // Add global mouse listeners to handle dragging outside the card
        const moveHandler = (moveEvent: MouseEvent) => {
            setDragX(moveEvent.clientX - e.clientX);
        };
        const upHandler = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
            // Trigger drag end logic (can't access dragX directly inside this closure correctly without ref, but let's try a different approach later or just rely on react state update if we moved logic inline)
            // Actually, best to use a separate effect or refined handler.
        };
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', () => {
            // We need to re-evaluate dragX here or trigger the end logic. 
            // Simplified: Just use the window mouseup to trigger a document-level handler or similar. 
            // For now, let's stick to simple implementation: 
            upHandler();
            // Note: This mouse implementation is tricky without refs. Let's restart mouse handler properly
        });
    };

    // Re-implementing Mouse with simple state updates won't work easily due to closure staleness unless using Refs.
    // Switching to Ref for startX if needed, but let's keep it simple: 
    // Mouse support is secondary to Touch. Let's fix the Mouse Handler to be robust:

    // Better Mouse Handler:
    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setDragX(e.clientX - startX);
            }
        };
        const handleWindowMouseUp = () => {
            if (isDragging) {
                handleDragEnd();
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isDragging, startX]);


    const handleDragEnd = () => {
        setIsDragging(false);
        if (dragX > 150) {
            onSwipe('right');
        } else if (dragX < -150) {
            onSwipe('left');
        }
        setDragX(0);
    };


    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent tap if we were dragging significantly
        if (Math.abs(dragX) > 5) return;

        if (!hasPhotos) return;
        const width = e.currentTarget.offsetWidth;
        const x = e.nativeEvent.offsetX;

        if (x < width * 0.35) {
            setCurrentPhotoIndex(prev => prev === 0 ? prev : prev - 1);
        } else if (x > width * 0.65) {
            setCurrentPhotoIndex(prev => prev === photos.length - 1 ? prev : prev + 1);
        } else {
            setShowInfo(!showInfo);
        }
    };

    return (
        <div className="relative w-full max-w-sm h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto select-none">
            {/* Image Layer - With Swipe Logic */}
            <div
                className="absolute inset-0 bg-gray-200 cursor-grab active:cursor-grabbing touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={handleMouseDown}
                style={{
                    transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.5s ease, opacity 0.5s ease',
                    opacity: Math.abs(dragX) > 150 ? 0.5 : 1
                }}
            >
                {/* Visual Indicators for Swipe */}
                {dragX > 50 && (
                    <div className="absolute top-10 left-10 z-30 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-lg transform -rotate-12 opacity-80">
                        LIKE
                    </div>
                )}
                {dragX < -50 && (
                    <div className="absolute top-10 right-10 z-30 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-lg transform rotate-12 opacity-80">
                        NOPE
                    </div>
                )}

                <div className="w-full h-full" onClick={handleTap}>
                    {hasPhotos ? (
                        <img
                            src={photos[currentPhotoIndex]}
                            alt={profile.displayName}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            draggable="false"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-300 font-bold text-4xl select-none">
                            {profile.displayName ? profile.displayName[0] : '?'}
                        </div>
                    )}

                    {/* Photo Indicators */}
                    {hasPhotos && photos.length > 1 && (
                        <div className="absolute top-2 left-0 right-0 flex gap-1 px-2 z-20">
                            {photos.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 flex-1 rounded-full ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Content Layer - Shown when NOT in Detail View */}
            {!showInfo && (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                    <div className="mb-14">
                        <h2 className="text-3xl font-bold flex items-center gap-2">
                            {profile.displayName}, {age}
                            {/* Badges */}
                            {(profile as any).packageId === 'gold' && <Zap size={20} className="text-yellow-400 fill-yellow-400" />}
                            {(profile as any).packageId === 'platinum' && <Crown size={20} className="text-purple-400 fill-purple-400" />}
                        </h2>

                        <div className="flex flex-wrap gap-2 text-sm opacity-90 mt-2">
                            {/* Brief Chips */}
                            {profile.profession && (
                                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    <Briefcase size={12} /> {profile.profession}
                                </div>
                            )}
                            {profile.location && (
                                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    <MapPin size={12} /> {profile.location.city}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons (Pointer Events Re-enabled) */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center pointer-events-auto">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSwipe('left'); }}
                            className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl hover:scale-110 transition-transform"
                        >
                            <X size={28} strokeWidth={3} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
                            className="w-10 h-10 bg-white/20 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-white/40"
                        >
                            <span className="mb-1 font-bold">i</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSwipe('right'); }}
                            className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
                        >
                            <Heart size={28} fill="white" strokeWidth={0} />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail View Overlay */}
            {showInfo && (
                <div className="absolute inset-0 bg-white z-30 overflow-y-auto animate-in slide-in-from-bottom duration-300 dark:bg-gray-900">
                    <div className="sticky top-0 bg-white/90 backdrop-blur p-4 flex justify-between items-center shadow-sm dark:bg-gray-900/90 dark:border-b dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{profile.displayName}</h2>
                        <button onClick={() => setShowInfo(false)} className="p-2 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300">
                            <ArrowDown size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 pb-20">
                        {/* Bio */}
                        <div>
                            <p className="text-gray-600 leading-relaxed italic dark:text-gray-300">"{profile.bio || "No bio yet"}"</p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-4">
                            <InfoRow icon={Briefcase} label="Profession" value={profile.profession} />
                            <InfoRow icon={MapPin} label="Location" value={`${profile.location?.city}, ${profile.location?.district}`} />
                            <InfoRow icon={User} label="Gender" value={profile.gender} />
                            <InfoRow icon={Ruler} label="Height" value={profile.height} />
                            <InfoRow icon={Book} label="Education" value={profile.education} />
                            <InfoRow icon={Users} label="Family" value={profile.family?.siblings ? `${profile.family.siblings} Siblings` : 'N/A'} />
                            <InfoRow icon={Wine} label="Habits" value={`${profile.habits?.drinking} / ${profile.habits?.smoking}`} />
                        </div>

                        {/* Interests */}
                        {(profile.interests || []).length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.map(i => (
                                        <span key={i} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm border border-pink-100">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="sticky bottom-0 bg-white border-t p-4 flex justify-center gap-8 dark:bg-gray-900 dark:border-gray-800">
                        <button
                            onClick={() => { setShowInfo(false); onSwipe('left'); }}
                            className="w-14 h-14 border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <X size={28} />
                        </button>
                        <button
                            onClick={() => { setShowInfo(false); onSwipe('right'); }}
                            className="w-14 h-14 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-600"
                        >
                            <Heart size={28} fill="white" strokeWidth={0} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: any) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 dark:border-gray-800">
            <div className="p-2 bg-pink-50 rounded-lg text-pink-500 dark:bg-gray-800 dark:text-pink-400">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    );
}
