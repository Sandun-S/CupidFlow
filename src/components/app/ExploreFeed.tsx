import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import ProfileCard from './ProfileCard';
import { useMatching } from '../../hooks/useMatching';
import { Loader } from 'lucide-react';

export default function ExploreFeed() {
    const { user } = useAuthStore();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { swipe, matchDetails, setMatchDetails } = useMatching();

    useEffect(() => {
        fetchProfiles();
    }, [user]);

    const fetchProfiles = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Get IDs of users I've already swiped on
            // Ideally this list is cached or paginated. For now we fetch "my swipes".
            const mySwipesSnapshot = await getDocs(query(collection(db, "swipes"), where("fromUid", "==", user.uid)));
            const swipedUserIds = new Set(mySwipesSnapshot.docs.map(d => d.data().toUid));
            swipedUserIds.add(user.uid); // Don't show myself

            // 2. Fetch Profiles
            const q = query(collection(db, "profiles"), limit(50));
            const querySnapshot = await getDocs(q);

            const validProfiles = [];
            for (const d of querySnapshot.docs) {
                if (!swipedUserIds.has(d.id)) {
                    // Double check if data is valid
                    if (d.data().displayName) {
                        validProfiles.push({ id: d.id, ...d.data() });
                    }
                }
            }

            setProfiles(validProfiles);

        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (profiles.length === 0) return;

        const currentProfile = profiles[0];

        // Optimistic UI update: Remove card immediately
        setProfiles(prev => prev.slice(1));

        // Perform Logic in Background
        const isMatch = await swipe(currentProfile.id, direction);

        if (isMatch) {
            // alert("Match!"); // Handled by UI below
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-pink-50">
                <Loader className="animate-spin text-pink-500 w-10 h-10" />
            </div>
        );
    }

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-pink-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No more profiles</h2>
                    <p className="text-gray-500 mb-6">You've seen everyone nearby! Check back later.</p>
                    <button onClick={fetchProfiles} className="text-pink-600 font-bold hover:underline">
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center py-8 px-4 relative">
            <div className="w-full max-w-sm flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-pink-600">CupidFlow</h1>
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                    {/* My Avatar */}
                </div>
            </div>

            {/* Card Stack */}
            <div className="w-full max-w-sm relative h-[600px]">
                {/* We only render the top card for interaction, maybe one below for visual depth */}
                {profiles.length > 1 && (
                    <div className="absolute top-4 left-0 right-0 scale-95 opacity-50 pointer-events-none transform translate-y-4">
                        <ProfileCard profile={profiles[1]} onSwipe={() => { }} />
                    </div>
                )}

                <div className="absolute inset-0 z-10 transition-transform">
                    <ProfileCard
                        key={profiles[0].id}
                        profile={profiles[0]}
                        onSwipe={handleSwipe}
                    />
                </div>
            </div>

            {/* Match Modal */}
            {matchDetails && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8 animate-bounce">
                        IT'S A MATCH!
                    </h2>
                    <div className="flex gap-4 mb-8">
                        {/* Me */}
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white">
                            {/* <img src={myPhoto} /> */}
                        </div>
                        {/* Them */}
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white">
                            {/* <img src={profiles.find(p => p.id === matchDetails.targetUserId)?.photos[0]} /> */}
                        </div>
                    </div>
                    <button
                        onClick={() => setMatchDetails(null)}
                        className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Keep Swiping
                    </button>
                    <button className="mt-4 text-white opacity-80 decoration-slice">
                        Send a Message
                    </button>
                </div>
            )}
        </div>
    );
}
