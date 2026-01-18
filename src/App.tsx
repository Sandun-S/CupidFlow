import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/authStore';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import EmailVerificationPending from './components/auth/EmailVerificationPending';
import AuthAction from './components/auth/AuthAction';
import ProfileWizard from './components/onboarding/ProfileWizard';
import ExploreFeed from './components/app/ExploreFeed';
import ChatLayout from './components/chat/ChatLayout';
import ChatWindow from './components/chat/ChatWindow';
import UpgradePlan from './components/subscription/UpgradePlan';
import PackageManager from './components/admin/PackageManager';
import UserManagement from './components/admin/UserManagement';
import SystemConfig from './components/admin/SystemConfig';
import LikesYou from './components/app/LikesYou';
import LandingPage from './components/marketing/LandingPage';
import Terms from './components/legal/Terms';
import Privacy from './components/legal/Privacy';
import AboutUs from './components/marketing/AboutUs';
import SafetyTips from './components/marketing/SafetyTips';
import EditProfile from './components/app/EditProfile';
import PublicProfileView from './components/app/PublicProfileView';
import Preferences from './components/app/Preferences';
import Settings from './components/app/Settings';
import VerificationQueue from './components/admin/VerificationQueue';
import TransactionManager from './components/admin/TransactionManager';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';

function AppContent() {
    const { setUser, setUserData, setLoading, loading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Dark Mode Initialization
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);

                // Fetch User & Profile Data
                try {
                    const [userSnap, profileSnap] = await Promise.all([
                        getDoc(doc(db, "users", currentUser.uid)),
                        getDoc(doc(db, "profiles", currentUser.uid))
                    ]);

                    if (userSnap.exists()) {
                        const data = userSnap.data();

                        if (currentUser.emailVerified && !data.emailVerified) {
                            await updateDoc(doc(db, "users", currentUser.uid), {
                                emailVerified: true
                            });
                            data.emailVerified = true;
                        }

                        // Merge Profile Data if exists
                        const profileData = profileSnap.exists() ? profileSnap.data() : {};
                        setUserData({ ...data, ...profileData });

                        const profileExists = profileSnap.exists();
                        const status = data.nicStatus || 'pending';
                        const path = location.pathname;

                        // Allow basic access to public/auth pages
                        if (['/login', '/signup', '/forgot-password', '/', '/terms', '/privacy', '/about', '/safety'].includes(path)) {
                            // Do nothing
                        }
                        // 1. Admin Bypass
                        else if (data.role === 'admin') {
                            // Admins can go anywhere
                        }
                        // 2. Email Verification Guard
                        else if (!currentUser.emailVerified && !data.emailVerified) {
                            if (path !== '/verify-email') {
                                navigate('/verify-email');
                            }
                        }
                        // 3. Force Onboarding if Profile Missing
                        else if (!profileExists) {
                            if (!path.startsWith('/onboarding')) {
                                navigate('/onboarding');
                            }
                        }
                        // 4. Verification Status Check (Pending)
                        else if (status === 'pending') {
                            if (path !== '/verify-status') navigate('/verify-status');
                        }
                        // 5. Unverified/Rejected -> Onboarding (Fallback)
                        else if (['unverified', 'rejected'].includes(status)) {
                            if (!path.startsWith('/onboarding')) {
                                navigate('/onboarding');
                            }
                        }
                        // 6. Verified -> App (Redirect from login/onboarding if verified)
                        else if (status === 'verified') {
                            if (['/', '/login', '/signup', '/verify-status'].includes(path) || path.startsWith('/onboarding')) {
                                navigate('/app/profile/view');
                            }
                        }

                    } else {
                        // User exists in Auth but not Firestore
                    }
                } catch (error) {
                    console.error("Error fetching user data", error);
                }
            } else {
                setUser(null);
                setUserData(null);
                const path = location.pathname;
                if (!['/login', '/signup', '/forgot-password', '/', '/terms', '/privacy', '/about', '/safety'].includes(path)) {
                    navigate('/login');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setUserData, setLoading, navigate, location.pathname]);

    if (loading) return <div className="h-screen flex items-center justify-center text-pink-600">Loading...</div>;

    return (
        <Routes>
            {/* Marketing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/safety" element={<SafetyTips />} />

            {/* Verification Staging */}
            <Route path="/auth/action" element={<AuthAction />} />
            <Route path="/verify-email" element={<EmailVerificationPending />} />
            <Route path="/verify-status" element={
                <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Verification Pending</h2>
                        <p className="text-gray-600 mb-6">Your profile is currently under review by our team. This usually takes 24-48 hours. You will be notified once complete.</p>
                        <div className="animate-pulse bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full inline-block text-sm font-medium">Status: Pending Review</div>
                        <button onClick={() => auth.signOut()} className="text-pink-600 font-bold hover:underline mt-4 block mx-auto">Sign Out</button>
                    </div>
                </div>
            } />

            {/* App Routes */}
            <Route path="/onboarding/*" element={<div className="min-h-screen bg-pink-50 pt-10"><ProfileWizard /></div>} />

            {/* Protected App Routes with Layout */}
            <Route path="/app/*" element={
                <MainLayout>
                    <Routes>
                        <Route path="explore" element={<ExploreFeed />} />
                        <Route path="likes" element={<LikesYou />} />

                        {/* Chat Split View Layout */}
                        <Route path="chat" element={<ChatLayout />}>
                            {/* Inner route for specific chat */}
                            <Route path=":matchId" element={<ChatWindow />} />
                        </Route>

                        <Route path="upgrade" element={<UpgradePlan />} />
                        <Route path="profile/edit" element={<EditProfile />} />
                        <Route path="preferences" element={<Preferences />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="profile/view" element={<PublicProfileView />} />
                    </Routes>
                </MainLayout>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<div className="text-center p-10 dark:text-gray-200">Welcome to Admin Dashboard. Select an item from the sidebar.</div>} />
                    <Route path="verifications" element={<VerificationQueue />} />
                    <Route path="transactions" element={<TransactionManager />} />
                    <Route path="packages" element={<PackageManager />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="config" element={<SystemConfig />} />
                </Route>
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
