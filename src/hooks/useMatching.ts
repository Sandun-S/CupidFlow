import { useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export function useMatching() {
    const { user } = useAuthStore();
    const [matchDetails, setMatchDetails] = useState<any>(null);

    const swipeOptimized = async (targetUserId: string, direction: 'left' | 'right') => {
        if (!user) return;

        const swipeId = `${user.uid}_${targetUserId}`;

        try {
            // 1. Write my swipe
            await setDoc(doc(db, "swipes", swipeId), {
                fromUid: user.uid,
                toUid: targetUserId,
                direction,
                timestamp: serverTimestamp()
            });

            if (direction === 'right') {
                // 2. Check if they liked me
                const reverseSwipeId = `${targetUserId}_${user.uid}`;
                const reverseDoc = await getDoc(doc(db, "swipes", reverseSwipeId));

                if (reverseDoc.exists() && reverseDoc.data().direction === 'right') {
                    // IT'S A MATCH!
                    // 3. Create Match Document
                    // We use a deterministic match ID to avoid duplicates: sort(uid1, uid2)
                    const sortedIds = [user.uid, targetUserId].sort();
                    const matchId = `${sortedIds[0]}_${sortedIds[1]}`;

                    await setDoc(doc(db, "matches", matchId), {
                        users: [user.uid, targetUserId],
                        user1: sortedIds[0],
                        user2: sortedIds[1],
                        createdAt: serverTimestamp(),
                        lastMessage: "It's a match!",
                        lastMessageTime: serverTimestamp()
                    });

                    setMatchDetails({ matchId, targetUserId });
                    return true; // Match found
                }
            }
        } catch (e) {
            console.error("Swipe error", e);
        }
        return false;
    };

    return { swipe: swipeOptimized, matchDetails, setMatchDetails };
}
