import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logAction } from '../../lib/audit';
import { Mail, Lock, Chrome } from 'lucide-react';
import { handleUserAuthSuccess } from './authUtils';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Send Verification Email
            try {
                await import('firebase/auth').then(mod => mod.sendEmailVerification(result.user));
                alert("Verification email sent! Please check your inbox.");
            } catch (emailErr) {
                console.warn("Failed to send verification email", emailErr);
            }

            setUser(result.user);
            // handleUserAuthSuccess will handle the Firestore creation AND navigation
            await handleUserAuthSuccess(result.user, navigate, 'email_signup');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Email is already registered. Please login.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else {
                setError("Registration failed. Please try again.");
            }
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
            await handleUserAuthSuccess(result.user, navigate, 'google');
        } catch (err: any) {
            console.error(err);
            setError("Google sign-in failed.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-pink-600 mb-2">Create Account</h1>
                    <p className="text-gray-500">Join CupidFlow to find your perfect match.</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
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
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center w-full p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    >
                        <Chrome className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-medium text-gray-700">Google</span>
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-pink-600 font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
