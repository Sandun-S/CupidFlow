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
        // We always operate on the *first* displayed profile.
        // But since displayProfiles is derived, we need to find which ID we just swiped 
        // and remove it from the main 'profiles' state.
        
        if (displayProfiles.length === 0) return;
        const swipedProfile = displayProfiles[0];
        
        // Remove from main state
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
import { Filter, X } from 'lucide-react';
import { DISTRICTS } from '../../lib/constants';

// ... inside component ...
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minAge: 18,
        maxAge: 50,
        district: '',
        expandSearch: true
    });

    // ... existing fetchProfiles ...
    // Note: We need to modify fetchProfiles or the rendering logic to apply filters.
    // Let's modify the RENDER/Processing logic.

    const filteredProfiles = profiles.filter(p => {
        // 1. Basic Filters
        const matchesAge = p.age >= filters.minAge && p.age <= filters.maxAge;
        const matchesDistrict = filters.district ? p.location?.district === filters.district : true;
        
        return matchesAge && matchesDistrict;
    });

    // Elastic Match Logic: If filtered count < 5 and expandSearch is TRUE, show ALL profiles (relaxed).
    // Or simpler: Just use 'profiles' (which is the full fetched list) if filtered is too low.
    const displayProfiles = (filters.expandSearch && filteredProfiles.length < 5) 
        ? profiles 
        : filteredProfiles;

    const isElasticActive = filters.expandSearch && filteredProfiles.length < 5 && profiles.length >= 5;

// ... UI ...

            {/* Header / Actions */}
            <div className="w-full max-w-sm flex justify-between items-center mb-6 relative z-30">
                <h1 className="text-2xl font-bold text-pink-600">CupidFlow</h1>

                <div className="flex gap-3">
                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full shadow-sm transition-all ${showFilters ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-500'}`}
                    >
                        <Filter size={20} />
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

            {/* Filter Panel */}
            {showFilters && (
                <div className="w-full max-w-sm bg-white p-4 rounded-2xl shadow-xl mb-4 border border-pink-100 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Filters</h3>
                        <button onClick={() => setShowFilters(false)}><X size={16} /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Age Range</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input 
                                    type="number" 
                                    value={filters.minAge} 
                                    onChange={e => setFilters({...filters, minAge: parseInt(e.target.value)})}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="number" 
                                    value={filters.maxAge} 
                                    onChange={e => setFilters({...filters, maxAge: parseInt(e.target.value)})}
                                    className="w-full p-2 border rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">District</label>
                            <select 
                                value={filters.district}
                                onChange={e => setFilters({...filters, district: e.target.value})}
                                className="w-full p-2 border rounded-lg bg-gray-50 mt-1"
                            >
                                <option value="">Anywhere</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                            <input 
                                type="checkbox" 
                                id="expand"
                                checked={filters.expandSearch}
                                onChange={e => setFilters({...filters, expandSearch: e.target.checked})}
                                className="w-4 h-4 text-pink-600 rounded"
                            />
                            <label htmlFor="expand" className="text-sm text-gray-700">
                                <strong>Elastic Search</strong> (Show verified users outside preference if matches run out)
                            </label>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Elastic Indicator */}
            {isElasticActive && (
                <div className="w-full max-w-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm mb-4 flex items-center gap-2 border border-blue-100">
                    <Rocket size={14} />
                    <span>Expanded search to find you more matches!</span>
                </div>
            )}

            {/* Card Stack */}
            <div className="w-full max-w-sm relative h-[600px]">
                {/* We only render the top card for interaction, maybe one below for visual depth */}
                {displayProfiles.length > 1 && (
                    <div className="absolute top-4 left-0 right-0 scale-95 opacity-50 pointer-events-none transform translate-y-4">
                        <ProfileCard profile={displayProfiles[1]} onSwipe={() => { }} />
                    </div>
                )}

                {displayProfiles.length > 0 ? (
                <div className="absolute inset-0 z-10 transition-transform">
                    <ProfileCard
                        key={displayProfiles[0].id}
                        profile={displayProfiles[0]}
                        onSwipe={handleSwipe}
                    />
                </div>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
                        <Filter size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-600">No matches found</h3>
                        <p className="text-gray-500 mb-4">Try relaxing your filters to see more people.</p>
                        <button 
                            onClick={() => setFilters({ minAge: 18, maxAge: 60, district: '', expandSearch: true })}
                            className="text-pink-600 font-bold hover:underline"
                        >
                            Reset Filters
                        </button>
                   </div>
                )}
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
