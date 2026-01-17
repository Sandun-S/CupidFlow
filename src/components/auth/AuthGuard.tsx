import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, userData, loading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (loading) return;

        // 1. Check if user is logged in
        if (!user) {
            navigate('/login');
            return;
        }

        // 2. Check Expiry
        if (userData?.accountExpiry) {
            const expiry = userData.accountExpiry.seconds * 1000;
            if (Date.now() > expiry) {
                // If on payment page, allow access
                if (location.pathname !== '/app/upgrade') {
                    // Redirect to upgrade with a generic "expired" reason if needed
                    // For now, assume upgrade page handles "Renewal" logic
                    navigate('/app/upgrade?reason=expired');
                    return;
                }
            }
        }

        // 3. Check Access Status (for > 1000 limit pending payment)
        if (userData?.accessStatus === 'pending_payment') {
            if (location.pathname !== '/app/upgrade') {
                navigate('/app/upgrade?reason=limit_reached');
                return;
            }
        }

        setChecking(false);

    }, [user, userData, loading, navigate, location.pathname]);

    if (loading || checking) {
        return (
            <div className="h-screen flex items-center justify-center bg-pink-50">
                <Loader className="animate-spin text-pink-500" />
            </div>
        );
    }

    return <>{children}</>;
}
