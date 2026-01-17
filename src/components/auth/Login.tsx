import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { logAction } from '../../lib/audit';
import { Mail, Lock, Chrome, Phone } from 'lucide-react';

// Add global window declarations for Firebase Auth
declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Phone Auth State
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('+94');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    // Initialize Recaptcha
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => { }
            });
        }
    }, []);

    const checkUserStatus = async (user: any) => {
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
                let accessStatus = "active"; // Default active for free
                let accountExpiry = null;

                if (sysConfigSnap.exists()) {
                    const config = sysConfigSnap.data();
                    const currentCount = config.userCount || 0;
                    const limit = config.freeUserLimit || 1000;

                    if (currentCount < limit) {
                        packageId = config.defaultPackageId || "gold"; // Gift Gold
                        // Set expiry for gifted package (e.g. 6 months)
                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + (config.defaultExpiryMonths || 6));
                        accountExpiry = expiryDate;
                        accessStatus = "active";
                    } else {
                        // Late user -> Free plan
                        packageId = "free";
                    }

                    // Increment count
                    transaction.update(sysConfigRef, { userCount: currentCount + 1 });
                }

                transaction.set(userRef, {
                    uid: user.uid,
                    email: user.email || '',
                    phone: user.phoneNumber || '', // Capture phone if available
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

            // Log New User
            await logAction('USER_SIGNUP', { method: isPhoneLogin ? 'phone' : 'email/google' });

            navigate('/onboarding/basic-info');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            await logAction('USER_LOGIN', { method: 'email' });
            await checkUserStatus(result.user);
        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password.");
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            await logAction('USER_LOGIN', { method: 'google' });
            await checkUserStatus(result.user);
        } catch (err: any) {
            console.error(err);
            setError("Google sign-in failed.");
            setLoading(false);
        }
    };

    const handleSendCode = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError("Please enter a valid phone number.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            // We store confirmationResult in window to access it in the next step
            window.confirmationResult = confirmationResult;

            setShowOtpInput(true);
            setLoading(false);
        } catch (error: any) {
            console.error(error);
            setError("Failed to send SMS. " + error.message);
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const confirmationResult = window.confirmationResult;
            const result = await confirmationResult.confirm(otp);
            setUser(result.user);
            await logAction('USER_LOGIN', { method: 'phone' });
            await checkUserStatus(result.user);
        } catch (error: any) {
            console.error(error);
            setError("Invalid verification code.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-pink-600 mb-2">CupidFlow</h1>
                    <p className="text-gray-500">Welcome back! Please login to continue.</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                {/* Login Method Toggle */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isPhoneLogin ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}
                        onClick={() => setIsPhoneLogin(false)}
                    >
                        Email
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isPhoneLogin ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}
                        onClick={() => setIsPhoneLogin(true)}
                    >
                        Phone
                    </button>
                </div>

                {isPhoneLogin ? (
                    /* PHONE LOGIN FORM */
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div id="recaptcha-container"></div>
                        {!showOtpInput ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none"
                                        placeholder="+94 7X XXX XXXX"
                                    />
                                </div>
                                <button
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    className="mt-4 w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none text-center tracking-widest text-xl"
                                    placeholder="XXXXXX"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                    className="mt-4 w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                                <button
                                    onClick={() => setShowOtpInput(false)}
                                    className="mt-2 w-full text-gray-500 text-sm py-2 hover:text-gray-700 underline"
                                >
                                    Use a different number
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* EMAIL LOGIN FORM */
                    <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none"
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 outline-none"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                )}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center w-full p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    >
                        <Chrome className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-medium text-gray-700">Google</span>
                    </button>
                    {/* Placeholder for future providers */}
                    <button className="flex items-center justify-center w-full p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition opacity-50 cursor-not-allowed">
                        <span className="font-medium text-gray-500">Facebook</span>
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-pink-600 font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
