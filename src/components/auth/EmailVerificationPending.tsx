import { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function EmailVerificationPending() {
    const { user, setUserData } = useAuthStore();
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        if (!user) return;
        setSending(true);
        try {
            await sendEmailVerification(user);
            setMessage("Verification email has been resent!");
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/too-many-requests') {
                setMessage("Please wait a moment before trying again.");
            } else {
                setMessage("Failed to resend email.");
            }
        } finally {
            setSending(false);
        }
    };

    const checkStatus = async () => {
        if (!user) return;
        setChecking(true);
        try {
            await user.reload();

            // Check Firestore as well (Admin Override)
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const isFirestoreVerified = userDoc.exists() && userDoc.data().emailVerified === true;

            if (user.emailVerified || isFirestoreVerified) {
                // Ensure Firestore is in sync if Auth is verified
                if (user.emailVerified && !isFirestoreVerified) {
                    await updateDoc(doc(db, "users", user.uid), { emailVerified: true });
                }

                // Update Local State
                if (userDoc.exists()) setUserData(userDoc.data());

                // No alert needed, just redirect
                // alert("Email verified successfully!");
                navigate('/app/profile/view'); // Redirect to App
            } else {
                setMessage("Email still not verified. Check your inbox (and spam).");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setChecking(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-pink-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify your Email</h1>
                <p className="text-gray-600 mb-6">
                    We've sent a verification link to <strong>{user?.email}</strong>.<br />
                    Please verify your email to access CupidFlow.
                </p>

                {message && (
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mb-6 text-sm">
                        {message}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={checkStatus}
                        disabled={checking}
                        className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} className={checking ? "animate-spin" : ""} />
                        I've Verified My Email
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                    >
                        {sending ? 'Sending...' : 'Resend Email'}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-2 mx-auto"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
