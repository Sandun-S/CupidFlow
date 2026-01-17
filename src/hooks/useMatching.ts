import { useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export function useMatching() {
    const { user } = useAuthStore();
    const [matchDetails, setMatchDetails] = useState<any>(null);

    const swipeOptimized = async (targetUserId: string, direction: 'left' | 'right') => {
        if (!user) return;

        try {
            // 0. Check Daily Limit
            // We need to fetch the user's current usage and limit
            // Ideally this should be in a store, but for accuracy we fetch fresh or assume passed via args.
            // For now, let's fetch the user doc to get accurate count and limit.
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) return;

            const userData = userDocSnap.data();
            const today = new Date().toISOString().split('T')[0];
            let dailySwipeCount = userData.dailySwipeCount || 0;
            let lastSwipeDate = userData.lastSwipeDate || "";

            // Reset if new day
            if (lastSwipeDate !== today) {
                dailySwipeCount = 0;
            }

            // Get Limit (Default to 10 if not set)
            // Ideally we should look up the package limit here, but for now let's rely on what's stored in user doc
            // OR fetch the package details. To match the plan, we should store `currentPackageLimit` on user,
            // or we assume a default limit for free users.
            // Let's assume the user document has `packageId`. We can fetch the package limit if needed,
            // OR better: Update the user doc with `dailySwipeLimit` when they upgrade.
            // FALLBACK: If `dailySwipeLimit` is missing in user doc, use 10 (Free).
            // NOTE: In `TransactionManager`, we should update this limit.
            // For now, let's assume we map packageId to limit? No, that requires another read.
            // Let's use a hardcoded map for safety if not in DB, but prefer DB.
            const limit = userData.dailySwipeLimit || 10;

            if (dailySwipeCount >= limit && limit < 1000) { // 1000+ is practically unlimited
                alert(`Daily swipe limit reached! (${limit}/${limit}) Upgrade for more.`);
                return false;
            }

            // 1. Write my swipe
            const swipeId = `${user.uid}_${targetUserId}`;
            await setDoc(doc(db, "swipes", swipeId), {
                fromUid: user.uid,
                toUid: targetUserId,
                direction,
                timestamp: serverTimestamp()
            });

            // Update User Swipe Count
            await setDoc(userDocRef, {
                dailySwipeCount: dailySwipeCount + 1,
                lastSwipeDate: today
            }, { merge: true });

            if (direction === 'right') {
                // 2. Check if they liked me
                const reverseSwipeId = `${targetUserId}_${user.uid}`;
                const reverseDoc = await getDoc(doc(db, "swipes", reverseSwipeId));

                if (reverseDoc.exists() && reverseDoc.data().direction === 'right') {
                    // IT'S A MATCH!
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
                    return true;
                }
            }
        } catch (e) {
            console.error("Swipe error", e);
        }
        return false;
    };

    return { swipe: swipeOptimized, matchDetails, setMatchDetails };
}
