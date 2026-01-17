import { db } from '../../lib/firebase';
import { doc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { logAction } from '../../lib/audit';

export const handleUserAuthSuccess = async (user: any, navigate: any, method: string, extraData?: { phone?: string }) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (!data.isVerified && data.nicStatus === 'pending') {
            navigate('/verify-status');
        } else if (!data.isVerified && data.nicStatus === 'rejected') {
            navigate('/onboarding/photos');
        } else {
            navigate('/app/explore');
        }
    } else {
        // New User Logic (First 1000 Free)
        await runTransaction(db, async (transaction) => {
            const sysConfigRef = doc(db, "system", "config");
            const sysConfigSnap = await transaction.get(sysConfigRef);

            let packageId = "free";
            let accessStatus = "active";
            let accountExpiry = null;

            if (sysConfigSnap.exists()) {
                const config = sysConfigSnap.data();
                const currentCount = config.userCount || 0;
                const limit = config.freeUserLimit || 1000;

                if (currentCount < limit) {
                    packageId = config.defaultPackageId || "gold";
                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + (config.defaultExpiryMonths || 6));
                    accountExpiry = expiryDate;
                    accessStatus = "active";
                } else {
                    packageId = "free";
                }

                transaction.update(sysConfigRef, { userCount: currentCount + 1 });
            }

            transaction.set(userRef, {
                uid: user.uid,
                email: user.email || '',
                phone: extraData?.phone || user.phoneNumber || '',
                role: 'user',
                createdAt: serverTimestamp(),
                isVerified: false,
                nicStatus: 'pending',
                packageId: packageId,
                accessStatus: accessStatus,
                accountExpiry: accountExpiry,
                dailySwipeCount: 0,
                lastSwipeDate: new Date().toISOString().split('T')[0]
            });
        });

        await logAction('USER_SIGNUP', { method: method });
        navigate('/onboarding/basic-info');
    }
};
