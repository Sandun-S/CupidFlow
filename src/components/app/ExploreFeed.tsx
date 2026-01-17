import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, where, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import ProfileCard from './ProfileCard';
import { useMatching } from '../../hooks/useMatching';
import { Loader, Rocket, HelpCircle, Mail } from 'lucide-react';
import BottomNav from './BottomNav';

export default function ExploreFeed() {
    const { user, userData } = useAuthStore();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { swipe, matchDetails, setMatchDetails } = useMatching();
    const [boostActive, setBoostActive] = useState(false);

    useEffect(() => {
        fetchProfiles();
        // Check if currently boosted
        if (userData?.boostedUntil) {
            const end = userData.boostedUntil.seconds * 1000;
            if (end > Date.now()) setBoostActive(true);
        }
    }, [user, userData]); // Re-run if userData updates (e.g. after boost)

    const fetchProfiles = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Get IDs of users I've already swiped on
            const mySwipesSnapshot = await getDocs(query(collection(db, "swipes"), where("fromUid", "==", user.uid)));
            const swipedUserIds = new Set(mySwipesSnapshot.docs.map(d => d.data().toUid));
            swipedUserIds.add(user.uid);

            // 2. Fetch Profiles - Prioritize Boosted Users
            // Note: Composite index needed for 'boostedUntil' desc + 'isActive' etc usually.
            // For now, simpler approach: orderBy boostedUntil desc
            const q = query(
                collection(db, "profiles"),
                orderBy("boostedUntil", "desc"), // Boosted users first
                limit(50)
            );

            const querySnapshot = await getDocs(q);

            const validProfiles = [];
            for (const d of querySnapshot.docs) {
                if (!swipedUserIds.has(d.id)) {
                    if (d.data().displayName) {
                        validProfiles.push({ id: d.id, ...d.data() });
                    }
                }
            }
            setProfiles(validProfiles);

        } catch (error) {
            console.error("Error fetching profiles:", error);
            if ((error as any).code === 'failed-precondition') {
                // Fallback: Simple query, filter purely in memory against 'user.uid'
                const q = query(collection(db, "profiles"), limit(50));
                const snap = await getDocs(q);
                const validProfiles = snap.docs
                    .filter(d => d.id !== user.uid)
                    .map(d => ({ id: d.id, ...d.data() }));
                setProfiles(validProfiles);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (profiles.length === 0) return;
        const currentProfile = profiles[0];
        setProfiles(prev => prev.slice(1));
        const isMatch = await swipe(currentProfile.id, direction);
        if (isMatch) { /* Handled via UI state */ }
    };

    const handleBoost = async () => {
        if (userData?.packageId !== 'platinum') {
            alert("Boosting is a Platinum feature! Upgrade to get seen by 10x more people.");
            return;
        }
        if (boostActive) {
            alert("You are already boosted!");
            return;
        }
        if (!window.confirm("Activate your 1-hour Profile Boost?")) return;

        try {
            // Set boostedUntil to 1 hour from now
            const boostEnd = new Date();
            boostEnd.setHours(boostEnd.getHours() + 1);

            await updateDoc(doc(db, "users", user!.uid), {
                boostedUntil: Timestamp.fromDate(boostEnd)
            });
            // Update public profile too for sorting
            await updateDoc(doc(db, "profiles", user!.uid), {
                boostedUntil: Timestamp.fromDate(boostEnd)
            });

            setBoostActive(true);
            alert("🚀 Boost Activated! You are now top of the stack.");
        } catch (e) {
            console.error("Boost failed", e);
        }
    };

    const handleSupport = () => {
        const subject = userData?.packageId === 'gold' || userData?.packageId === 'platinum'
            ? "PRIORITY Support Request - CupidFlow"
            : "Support Request - CupidFlow";
        window.open(`mailto:syntaxsandun@googlegroups.com?subject=${encodeURIComponent(subject)}`);
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
                    <div className="mt-8 pt-6 border-t w-full">
                        <button onClick={handleSupport} className="flex items-center justify-center gap-2 text-gray-400 hover:text-pink-600">
                            <Mail size={16} /> Contact Support
                        </button>
                    </div>
                </div>
                <div className="mt-auto w-full">
                    {/* Spacing for bottom nav */}
                </div>
                <BottomNav />
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center py-6 px-4 relative">
            {/* Header / Actions */}
            <div className="w-full max-w-sm flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-pink-600">CupidFlow</h1>

                <div className="flex gap-3">
                    {/* Support Button */}
                    <button
                        onClick={handleSupport}
                        className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm"
                        title="Contact Support"
                    >
                        <HelpCircle size={20} />
                    </button>

                    {/* Boost Button */}
                    <button
                        onClick={handleBoost}
                        className={`p-2 rounded-full shadow-sm transition-all ${boostActive
                            ? 'bg-purple-600 text-white shadow-purple-200 ring-2 ring-purple-300'
                            : 'bg-white text-purple-600 hover:bg-purple-50'
                            }`}
                        title="Boost Profile"
                    >
                        <Rocket size={20} className={boostActive ? 'animate-pulse' : ''} />
                    </button>
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
                            {/* Placeholder */}
                        </div>
                        {/* Them */}
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white">
                            {/* Placeholder */}
                        </div>
                    </div>
                    <button
                        onClick={() => setMatchDetails(null)}
                        className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Keep Swiping
                    </button>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
