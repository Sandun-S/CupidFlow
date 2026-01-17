import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { Send, ArrowLeft } from 'lucide-react';

export default function ChatWindow() {
    const { matchId } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!matchId || !user) return;

        // 1. Fetch Chat Partner Info
        const fetchPartner = async () => {
            const matchDoc = await getDoc(doc(db, "matches", matchId));
            if (matchDoc.exists()) {
                const userIds = matchDoc.data().users;
                const partnerId = userIds.find((uid: string) => uid !== user.uid);
                if (partnerId) {
                    const pDoc = await getDoc(doc(db, "profiles", partnerId));
                    if (pDoc.exists()) setOtherUser(pDoc.data());
                }
            }
        };
        fetchPartner();

        // 2. Real-time Messages Listener
        const q = query(
            collection(db, "matches", matchId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(msgs);
            // Scroll to bottom
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        return () => unsubscribe();

    }, [matchId, user]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !matchId) return;

        try {
            await addDoc(collection(db, "matches", matchId, "messages"), {
                text: newMessage,
                senderId: user.uid,
                createdAt: serverTimestamp()
            });

            // Update "Last Message" on the match doc (Optional, could be a Cloud Function, but we are client-side only)
            // await updateDoc(doc(db, "matches", matchId), { lastMessage: newMessage, lastMessageTime: serverTimestamp() });

            setNewMessage('');
        } catch (error) {
            console.error("Send failed", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 z-10">
                <button onClick={() => navigate(-1)} className="text-gray-600">
                    <ArrowLeft />
                </button>
                {otherUser && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {otherUser.photos?.[0] && <img src={otherUser.photos[0]} className="w-full h-full object-cover" />}
                        </div>
                        <h2 className="font-bold text-gray-800">{otherUser.displayName}</h2>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine
                                    ? 'bg-pink-500 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="bg-white p-4 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
