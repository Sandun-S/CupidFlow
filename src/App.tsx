import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import VerificationQueue from './components/admin/VerificationQueue';
import TransactionManager from './components/admin/TransactionManager';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/authStore';
import ProfileWizard from './components/onboarding/ProfileWizard';
import ExploreFeed from './components/app/ExploreFeed';
import ChatList from './components/chat/ChatList';
import ChatWindow from './components/chat/ChatWindow';
import UpgradePlan from './components/subscription/UpgradePlan';
import PackageManager from './components/admin/PackageManager';
import SystemConfig from './components/admin/SystemConfig';
import LikesYou from './components/app/LikesYou';
import LandingPage from './components/marketing/LandingPage';
import Terms from './components/legal/Terms';
import Privacy from './components/legal/Privacy';
import AboutUs from './components/marketing/AboutUs';
import SafetyTips from './components/marketing/SafetyTips';
import EditProfile from './components/app/EditProfile';
import PublicProfileView from './components/app/PublicProfileView';

function App() {
    const { setUser, setUserData, setLoading, loading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch extra user data (like isPremium)
                try {
                    const docSnap = await getDoc(doc(db, "users", currentUser.uid));
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setUserData(null);
                    }
                } catch (e) {
                    console.error("Error fetching user data", e);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [setUser, setUserData, setLoading]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-pink-600">Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/safety" element={<SafetyTips />} />
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
                <Route path="/app/likes" element={<LikesYou />} />
                <Route path="/app/chat/:matchId" element={<ChatWindow />} />
                <Route path="/app/upgrade" element={<UpgradePlan />} />
                <Route path="/app/profile/edit" element={<EditProfile />} />
                <Route path="/app/profile/view" element={<PublicProfileView />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route index element={<div className="text-center p-10">Welcome to Admin Dashboard. Select an item from the sidebar.</div>} />
                        <Route path="verifications" element={<VerificationQueue />} />
                        <Route path="transactions" element={<TransactionManager />} />
                        <Route path="packages" element={<PackageManager />} />
                        <Route path="config" element={<SystemConfig />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
