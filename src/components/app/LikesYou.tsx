import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { Heart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

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

                const senderIds = querySnapshot.docs.map(d => d.data().fromUid);

                if (senderIds.length === 0) {
                    setLikers([]);
                    setLoading(false);
                    return;
                }

                // 2. Filter out matches (people I also swiped right on)
                const mySwipesQ = query(
                    collection(db, "swipes"),
                    where("fromUid", "==", user.uid)
                );
                const mySwipesSnap = await getDocs(mySwipesQ);
                const mySwipedIds = new Set(mySwipesSnap.docs.map(d => d.data().toUid));

                const pendingLikers = senderIds.filter(id => !mySwipedIds.has(id));

                if (pendingLikers.length === 0) {
                    setLikers([]);
                    setLoading(false);
                    return;
                }

                const profiles: LikerProfile[] = [];
                // Firestore 'in' has limit of 10. We loop/slice for now.
                for (const uid of pendingLikers.slice(0, 10)) {
                    const docSnap = await getDoc(doc(db, "profiles", uid));
                    if (docSnap.exists()) {
                        const d = docSnap.data();
                        profiles.push({
                            uid: d.uid,
                            displayName: d.displayName,
                            age: d.age,
                            avatar: d.avatar,
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
    }, [user, userData]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your admirers...</div>;

    return (
        <div className="min-h-screen bg-pink-50 pb-20 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative dark:bg-gray-900 dark:shadow-none transition-colors duration-300">
                {/* Header */}
                <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3 dark:bg-gray-900 dark:border-b dark:border-gray-800 transition-colors duration-300">
                    <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300">
                        &larr; Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Likes You</h1>
                    <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-pink-900/30 dark:text-pink-300">
                        {likers.length}
                    </span>
                </div>

                <div className="p-4">
                    {likers.length === 0 ? (
                        <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
                            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4 dark:text-gray-700" />
                            <p>No new likes yet. Keep swiping to get noticed!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {likers.map((profile) => (
                                <div key={profile.uid} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800">
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
                                                <div className="bg-white/90 p-3 rounded-full mb-2 dark:bg-gray-900/90">
                                                    <Lock className="w-6 h-6 text-pink-600 dark:text-pink-500" />
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
                </div>

                {!isPremium && likers.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-20 max-w-md mx-auto dark:bg-gray-900 dark:border-gray-800">
                        <button
                            onClick={() => navigate('/app/upgrade')}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg animate-pulse"
                        >
                            Upgrade to See Who Likes You
                        </button>
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}
