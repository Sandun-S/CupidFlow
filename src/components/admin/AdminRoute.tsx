import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminRoute() {
    const { user, loading } = useAuthStore();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setIsAdmin(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Admin check failed", error);
                setIsAdmin(false);
            }
        };

        if (!loading) {
            checkAdmin();
        }
    }, [user, loading]);

    if (loading || isAdmin === null) {
        return <div className="h-screen flex items-center justify-center text-pink-600 font-bold">Verifying Access...</div>;
    }

    return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
