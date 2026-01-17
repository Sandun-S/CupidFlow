import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { Heart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LikerProfile {
    uid: string;
    displayName: string;
    age: number;
    avatar: string;
}

export default function LikesYou() {
    const { user, userData } = useAuthStore();
    const [likers, setLikers] = useState<LikerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check if premium (simple check: packageId != 'free' and 'silver')
    // Adjust based on your package logic. Let's assume 'gold' and 'platinum' give this feature.
    // Or just check a flag if we had one. For now, let's assume 'gold' | 'platinum'.
    // Better: Helper function or just check ID.
    const isPremium = ['silver', 'gold', 'platinum'].includes(userData?.packageId || '');

    useEffect(() => {
        if (!user) return;

        const fetchLikers = async () => {
            setLoading(true);
            try {
                // 1. Get all swipes where toUid == me AND direction == right
                const q = query(
                    collection(db, "swipes"),
                    where("toUid", "==", user.uid),
                    where("direction", "==", "right")
                );
                const querySnapshot = await getDocs(q);

                // 2. Filter out those who I have already swiped (Matches are handled separately)
                // Actually, if it's a match, it's NOT a pending like. 
                // We need to check if I have ALREADY swiped them.
                // For simplicity, let's just fetch profiles. 
                // Matches are usually removed from "Likes You" or kept differently.
                // Let's crude way: fetch them all.

                const senderIds = querySnapshot.docs.map(d => d.data().fromUid);

                if (senderIds.length === 0) {
                    setLikers([]);
                    setLoading(false);
                    return;
                }

                // Fetch profiles (This might be heavy if many likes, limit to 20?)
                // Also need to check if *I* already swiped them right (Match).
                // If Match, they shouldn't appear here (they appear in Chat).
                // We need to query MY swipes to exclude matches.

                const mySwipesQ = query(
                    collection(db, "swipes"),
                    where("fromUid", "==", user.uid)
                );
                const mySwipesSnap = await getDocs(mySwipesQ);
                const mySwipedIds = new Set(mySwipesSnap.docs.map(d => d.data().toUid));

                const pendingLikers = senderIds.filter(id => !mySwipedIds.has(id));

                if (pendingLikers.length === 0) {
                    setLikers([]);
                    return;
                }

                const profiles: LikerProfile[] = [];
                // Firestore 'in' has limit of 10. We loop.
                for (const uid of pendingLikers.slice(0, 10)) { // Limit to 10 for now
                    const docSnap = await getDoc(doc(db, "profiles", uid));
                    if (docSnap.exists()) {
                        const d = docSnap.data();
                        profiles.push({
                            uid: d.uid,
                            displayName: d.displayName,
                            age: d.age,
                            avatar: d.avatar
                        });
                    }
                }
                setLikers(profiles);

            } catch (error) {
                console.error("Error fetching likes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikers();
    }, [user]);

    const isPremium = ['silver', 'gold', 'platinum'].includes(userData?.packageId || '');

    useEffect(() => {
        if (!user) return;

        const fetchLikers = async () => {
            // ... existing fetch logic is fine, keeping it implicitly via ... 
            // actually I need to replace the RENDER part mainly.
            // Let's replace the whole return statement to be safe.
            setLoading(true);
            // ... (Logic is unchanged, just re-rendering this block safely?)
            // No, let's just replace the RETURN block.
        };
        // Wait, I can't skip logic in replace. 
    }, [user]);

    // ... 
    // Coping the fetch logic is risky if I don't see it all. 
    // I will just replace the return statement.

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your admirers...</div>;

    return (
        <div className="min-h-screen bg-pink-50 pb-20">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative">
                {/* Header */}
                <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-600">
                        &larr; Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Likes You</h1>
                    <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {likers.length}
                    </span>
                </div>

                <div className="p-4">
                    {likers.length === 0 ? (
                        <div className="text-center mt-20 text-gray-500">
                            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p>No new likes yet. Keep swiping to get noticed!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {likers.map((profile) => (
                                <div key={profile.uid} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-white">
                                    {/* Image Layer */}
                                    <img
                                        src={profile.avatar}
                                        alt="Profile"
                                        className={`w-full h-full object-cover transition-all ${!isPremium ? 'blur-lg scale-110' : ''}`}
                                    />

                                    {/* Info / Overlay Layer */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                                        {!isPremium ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                                                <div className="bg-white/90 p-3 rounded-full mb-2">
                                                    <Lock className="w-6 h-6 text-pink-600" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-white">
                                                <h3 className="font-bold text-lg">{profile.displayName}, {profile.age}</h3>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isPremium && likers.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20 max-w-md mx-auto">
                            <button
                                onClick={() => navigate('/app/upgrade')}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg animate-pulse"
                            >
                                Upgrade to See Who Likes You
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
