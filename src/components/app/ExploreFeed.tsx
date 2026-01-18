import { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, query, limit, where, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import ProfileCard from './ProfileCard';
import { useMatching } from '../../hooks/useMatching';
import { Loader, Rocket, HelpCircle, Mail, Filter } from 'lucide-react';
// import BottomNav from './BottomNav';

export default function ExploreFeed() {
    const { user, userData } = useAuthStore();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { swipe, matchDetails, setMatchDetails } = useMatching();
    const [boostActive, setBoostActive] = useState(false);

    // Filters & Search State
    const [preferences, setPreferences] = useState<any>(null);

    useEffect(() => {
        const loadPrefs = async () => {
            if (user) {
                try {
                    const docSnap = await getDoc(doc(db, "preferences", user.uid));
                    if (docSnap.exists()) {
                        setPreferences(docSnap.data());
                    }
                } catch (e) { console.error("Error loading prefs", e); }
            }
        };
        loadPrefs();
    }, [user]);

    useEffect(() => {
        if (user) fetchProfiles();
    }, [user]);

    const fetchProfiles = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Get IDs of users I've already swiped on
            const mySwipesSnapshot = await getDocs(query(collection(db, "swipes"), where("fromUid", "==", user.uid)));
            const swipedUserIds = new Set(mySwipesSnapshot.docs.map(d => d.data().toUid));
            swipedUserIds.add(user.uid);

            // 2. Fetch Profiles - Prioritize Boosted Users
            // Fetching a larger limit to allow client-side filtering
            const q = query(
                collection(db, "profiles"),
                // orderBy("boostedUntil", "desc"), // Disabled because it requires a composite index
                limit(100)
            );

            const querySnapshot = await getDocs(q);

            const validProfiles = [];
            for (const d of querySnapshot.docs) {
                if (!swipedUserIds.has(d.id)) {
                    // Check if critical data exists
                    if (d.data().displayName && d.data().age) {
                        validProfiles.push({ id: d.id, ...d.data() });
                    }
                }
            }
            setProfiles(validProfiles);

        } catch (error) {
            console.error("Error fetching profiles:", error);
            // Simple fallback if index fails
            if ((error as any).code === 'failed-precondition') {
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

    // Client-side Filtering
    const filteredProfiles = profiles.filter(p => {
        // 1. Gender Filter
        const prefGender = preferences?.gender || 'any';
        const matchesGender = prefGender === 'any' || p.gender === prefGender;

        // 2. Age Filter
        const minAge = preferences?.ageRange?.min || 18;
        const maxAge = preferences?.ageRange?.max || 60;
        // Handle missing age safely
        const pAge = p.age || 18; // Default to 18 if undefined so we don't crash, but ideally should be filtered by query
        const matchesAge = pAge >= minAge && pAge <= maxAge;

        // 3. District Filter (Multi-select)
        let matchesDistrict = true;
        const prefDistrict = preferences?.district || 'any';
        if (prefDistrict !== 'any') {
            const allowedDistricts = Array.isArray(prefDistrict) ? prefDistrict : [prefDistrict];
            // If profile has no location, we might hide it? Or show it? Let's hide if location is preferred.
            matchesDistrict = allowedDistricts.includes(p.location?.district);
        }

        return matchesGender && matchesAge && matchesDistrict;
    });

    // Elastic Logic
    // If strict match fails, we can fallback to standard query or ask user to broaden.
    // For now, let's just use filteredProfiles.
    const displayProfiles = filteredProfiles;
    const isElasticActive = false; // Disable elastic for now to ensure correctness


    // const isElasticActive = filters.expandSearch && filteredProfiles.length < 5 && profiles.length >= 5;

    const handleSwipe = async (direction: 'left' | 'right') => {
        if (displayProfiles.length === 0) return;

        const swipedProfile = displayProfiles[0];

        // Optimistic UI update: Remove from main profiles list
        setProfiles(prev => prev.filter(p => p.id !== swipedProfile.id));

        const isMatch = await swipe(swipedProfile.id, direction);
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
            const boostEnd = new Date();
            boostEnd.setHours(boostEnd.getHours() + 1);

            await updateDoc(doc(db, "users", user!.uid), {
                boostedUntil: Timestamp.fromDate(boostEnd)
            });
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
            <div className="flex items-center justify-center h-screen bg-pink-50 dark:bg-gray-900 transition-colors duration-300">
                <Loader className="animate-spin text-pink-500 w-10 h-10" />
            </div>
        );
    }

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-pink-50 p-4 text-center dark:bg-gray-900 transition-colors duration-300">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full dark:bg-gray-800 dark:shadow-none">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-white">No more profiles</h2>
                    <p className="text-gray-500 mb-6 dark:text-gray-400">You've seen everyone nearby! Check back later.</p>
                    <button onClick={fetchProfiles} className="text-pink-600 font-bold hover:underline mb-4 dark:text-pink-400">
                        Refresh
                    </button>
                    <div className="pt-6 border-t w-full dark:border-gray-700">
                        <button onClick={handleSupport} className="flex items-center justify-center gap-2 text-gray-400 hover:text-pink-600 mx-auto dark:hover:text-pink-400">
                            <Mail size={16} /> Contact Support
                        </button>
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center py-6 px-4 relative pb-24 overflow-hidden dark:bg-gray-900 transition-colors duration-300">
            {/* Header / Actions */}
            <div className="w-full max-w-sm flex justify-between items-center mb-6 relative z-30">
                <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-500">CupidFlow</h1>

                <div className="flex gap-3">
                    {/* Filter Button -> Preferences */}
                    <button
                        onClick={() => window.location.href = '/app/preferences'}
                        className="p-2 rounded-full shadow-sm bg-white text-gray-500 hover:text-pink-600 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:text-pink-400"
                        title="Preferences"
                    >
                        <Filter size={20} />
                    </button>

                    {/* Support Button */}
                    <button
                        onClick={handleSupport}
                        className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Contact Support"
                    >
                        <HelpCircle size={20} />
                    </button>

                    {/* Boost Button */}
                    <button
                        onClick={handleBoost}
                        className={`p-2 rounded-full shadow-sm transition-all ${boostActive
                            ? 'bg-purple-600 text-white shadow-purple-200 ring-2 ring-purple-300 dark:shadow-none'
                            : 'bg-white text-purple-600 hover:bg-purple-50 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700'
                            }`}
                        title="Boost Profile"
                    >
                        <Rocket size={20} className={boostActive ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </div>

            {/* Elastic Indicator */}
            {isElasticActive && (
                <div className="w-full max-w-sm bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2 border border-indigo-100 shadow-sm animate-in fade-in zoom-in duration-300">
                    <div className="bg-indigo-100 p-1.5 rounded-full">
                        <Rocket size={14} className="text-indigo-600" />
                    </div>
                    <span>Expanded search to verify more matches!</span>
                </div>
            )}

            {/* Card Stack */}
            <div className="w-full max-w-sm relative h-[580px]">
                {displayProfiles.length > 0 ? (
                    <>
                        {/* Second Card (Background) */}
                        {displayProfiles.length > 1 && (
                            <div className="absolute top-4 left-0 right-0 scale-95 opacity-50 pointer-events-none transform translate-y-4 transition-all duration-300">
                                <ProfileCard profile={displayProfiles[1]} onSwipe={() => { }} />
                            </div>
                        )}

                        {/* Top Card */}
                        <div className="absolute inset-0 z-10 transition-transform duration-300">
                            <ProfileCard
                                key={displayProfiles[0].id}
                                profile={displayProfiles[0]}
                                onSwipe={handleSwipe}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 shadow-sm dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-200">
                        <div className="bg-gray-100 p-4 rounded-full mb-4 dark:bg-gray-700">
                            <Filter size={32} className="text-gray-400 dark:text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-white">No matches found</h3>
                        <p className="text-gray-500 mb-6 mt-2 dark:text-gray-400">
                            Check your preferences or try again later.
                        </p>
                        <button
                            onClick={() => window.location.href = '/app/preferences'}
                            className="bg-white border border-pink-200 text-pink-600 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-pink-50 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-pink-400 dark:hover:bg-gray-600"
                        >
                            Update Preferences
                        </button>
                    </div>
                )}
            </div>

            {/* Match Modal */}
            {
                matchDetails && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8 animate-bounce">
                            IT'S A MATCH!
                        </h2>
                        <div className="flex gap-4 mb-8">
                            {/* Simple placeholders or avatars if available in matchDetails */}
                            <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-white animate-pulse" />
                            <div className="w-24 h-24 rounded-full bg-pink-600 border-4 border-white animate-pulse delay-75" />
                        </div>
                        <button
                            onClick={() => setMatchDetails(null)}
                            className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Keep Swiping
                        </button>
                    </div>
                )
            }

// BottomNav removed (handled by MainLayout)
        </div >
    );
}
