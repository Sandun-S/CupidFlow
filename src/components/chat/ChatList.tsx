import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import BottomNav from '../app/BottomNav';

interface ChatMatch {
    id: string; // matchId
    otherUser: {
        uid: string;
        displayName: string;
        photoUrl: string;
    };
    lastMessage: string;
    createdAt: any;
}

export default function ChatList() {
    const { user } = useAuthStore();
    const [matches, setMatches] = useState<ChatMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchMatches();
        }
    }, [user]);

    const fetchMatches = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Query matches where array 'users' contains my uid
            const q = query(
                collection(db, "matches"),
                where("users", "array-contains", user.uid),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const fetchedMatches: ChatMatch[] = [];

            for (const d of snapshot.docs) {
                const data = d.data();
                // Identify the "other" user
                const otherUid = data.users.find((uid: string) => uid !== user.uid);

                // Fetch their profile
                let otherUser = { uid: otherUid, displayName: 'Unknown', photoUrl: '' };
                if (otherUid) {
                    const profileSnap = await getDoc(doc(db, "profiles", otherUid));
                    if (profileSnap.exists()) {
                        const pData = profileSnap.data();
                        otherUser = {
                            uid: otherUid,
                            displayName: pData.displayName || 'Unknown',
                            photoUrl: pData.photos?.[0] || ''
                        };
                    }
                }

                fetchedMatches.push({
                    id: d.id,
                    otherUser,
                    lastMessage: data.lastMessage || 'Start chatting!',
                    createdAt: data.createdAt
                });
            }

            setMatches(fetchedMatches);

        } catch (error) {
            console.error("Error fetching matches", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading chats...</div>;

    return (
        <div className="min-h-screen bg-pink-50 pb-20">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative">
                <div className="p-4 border-b bg-white sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-pink-600">Messages</h1>
                </div>

                {/* Likes You Teaser */}
                <div className="mb-6">
                    <div
                        onClick={() => navigate('/app/likes')}
                        className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow border border-pink-200"
                    >
                        <div className="bg-pink-200 p-3 rounded-full">
                            <MessageCircle className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">Likes Sent to You</h3>
                            <p className="text-xs text-gray-600">See who wants to match with you</p>
                        </div>
                        <div className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            View
                        </div>
                    </div>
                </div>

                {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <MessageCircle size={48} className="mb-2 opacity-50" />
                        <p>No matches yet. Keep swiping!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {matches.map(match => (
                            <div
                                key={match.id}
                                onClick={() => navigate(`/app/chat/${match.id}`)}
                                className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 active:scale-95 transition-transform cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {match.otherUser.photoUrl ? (
                                        <img src={match.otherUser.photoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-300 font-bold text-xl">
                                            {match.otherUser.displayName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 truncate">{match.otherUser.displayName}</h3>
                                    <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <BottomNav />
            </div>
            );
}
