import React, { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Chrome } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const checkUserStatus = async (user: User) => {
        // 1. Check if user doc exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New User Initialization Logic
            try {
                // 1. Fetch Config
                const configRef = doc(db, "system", "config");
                const configSnap = await getDoc(configRef);
                const config = configSnap.data() || { freeUserLimit: 1000, defaultFreePackageId: 'free', defaultExpiryMonths: 6, currentCount: 0 };

                // 2. Determine Status
                const newCount = (config.currentCount || 0) + 1;
                const isFree = newCount <= config.freeUserLimit;

                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + (config.defaultExpiryMonths || 6));

                // 3. Create User Doc directly here
                await runTransaction(db, async (transaction) => {
                    // Re-read config in transaction for safety?
                    // For simplicity in this iteration, we just update.
                    // A real robust system would do a transaction read of config.
                    transaction.update(configRef, { currentCount: newCount });
                    transaction.set(userDocRef, {
                        uid: user.uid,
                        email: user.email,
                        isPremium: false,
                        packageId: isFree ? (config.defaultFreePackageId || 'free') : 'free', // If paid needed, maybe 'free' until they pay?
                        accessStatus: isFree ? 'active' : 'pending_payment',
                        accountExpiry: expiryDate,
                        createdAt: new Date(),
                        isVerified: false
                    });
                });

                // 4. Navigate
                // If pending payment, AuthGuard might block accessing /onboarding?
                // We should allow Onboarding even if pending payment?
                // Actually if they are pending payment, they shouldn't see sensitive data.
                // But they need to fill profile?
                // For now, let's send them to onboarding. AuthGuard logic might need tweaking if onboarding is guarded.
                // ProfileWizard is at /onboarding. AuthGuard is checking userData.
                // If status is pending_payment, AuthGuard REDIRECTS to /app/upgrade.
                // We probably want them to fill profile first? 
                // Let's assume standard flow: Signup -> Onboarding -> Upgrade(if needed).

                navigate('/onboarding');

            } catch (e) {
                console.error("Error initializing user", e);
                // Fallback?
                navigate('/onboarding');
            }

        } else {
            const userData = userDoc.data();
            if (!userData.isVerified) {
                navigate('/verify-status');
            } else {
                navigate('/app/explore');
            }
        }
    };

    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            setUser(userCredential.user);
            await checkUserStatus(userCredential.user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-pink-600 mb-2">CupidFlow</h1>
                    <p className="text-gray-500">Find your verified soulmate</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-lg transition-colors"
                    >
                        {isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            const provider = new GoogleAuthProvider();
                            try {
                                const result = await signInWithPopup(auth, provider);
                                setUser(result.user);
                                await checkUserStatus(result.user);
                            } catch (err: any) {
                                setError(err.message);
                            }
                        }}
                        className="mt-6 w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
                    >
                        <Chrome className="h-5 w-5 text-blue-500" />
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}
