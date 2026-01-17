import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import VerificationQueue from './components/admin/VerificationQueue';
import TransactionManager from './components/admin/TransactionManager';
import Login from './components/auth/Login';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/authStore';
import ProfileWizard from './components/onboarding/ProfileWizard';
import ExploreFeed from './components/app/ExploreFeed';
import ChatList from './components/chat/ChatList';
import ChatWindow from './components/chat/ChatWindow';
import UpgradePlan from './components/subscription/UpgradePlan';
import PackageManager from './components/admin/PackageManager';

function App() {
    const { setUser, setLoading, loading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [setUser, setLoading]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-pink-600">Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />
                {/* Placeholders for future routes */}
                <Route path="/onboarding" element={<div className="min-h-screen bg-pink-50 pt-10"><ProfileWizard /></div>} />
                <Route path="/verify-status" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Pending</h2>
                            <p className="text-gray-600 mb-6">
                                Your profile is currently under review. Our team is verifying your NIC details.
                                This usually takes 24-48 hours.
                            </p>
                            <div className="animate-pulse bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full inline-block text-sm font-medium">
                                Status: Pending Review
                            </div>
                        </div>
                    </div>
                } />
                <Route path="/app/explore" element={<ExploreFeed />} />
                <Route path="/app/chat" element={<ChatList />} />
                <Route path="/app/chat/:matchId" element={<ChatWindow />} />
                <Route path="/app/upgrade" element={<UpgradePlan />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route index element={<div className="text-center p-10">Welcome to Admin Dashboard. Select an item from the sidebar.</div>} />
                        <Route path="verifications" element={<VerificationQueue />} />
                        <Route path="transactions" element={<TransactionManager />} />
                        <Route path="packages" element={<PackageManager />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
