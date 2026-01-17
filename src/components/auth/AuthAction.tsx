import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AuthAction() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing your request...');

    // Password reset state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const [oobCode, setOobCode] = useState<string | null>(null);

    useEffect(() => {
        const mode = searchParams.get('mode');
        const code = searchParams.get('oobCode');

        if (!mode || !code) {
            setStatus('error');
            setMessage('Invalid link. Please request a new one.');
            return;
        }

        const handleAction = async () => {
            try {
                if (mode === 'verifyEmail') {
                    setMessage('Verifying your email...');
                    await applyActionCode(auth, code);
                    setStatus('success');
                    setMessage('Email verified successfully! You can now access the app.');
                    // Reload user to update emailVerified status
                    if (auth.currentUser) {
                        await auth.currentUser.reload();
                    }
                } else if (mode === 'resetPassword') {
                    // Check if code is valid
                    await verifyPasswordResetCode(auth, code);
                    setOobCode(code);
                    setShowResetForm(true);
                    setStatus('success'); // Ready to show form
                    setMessage('Please enter your new password.');
                } else {
                    setStatus('error');
                    setMessage('Unknown action mode.');
                }
            } catch (error: any) {
                console.error("Auth action error", error);
                setStatus('error');
                setMessage(error.message || 'An error occurred. The link may have expired.');
            }
        };

        handleAction();
    }, [searchParams]);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        if (!oobCode) return;

        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            alert("Password reset successfully! You can now login.");
            navigate('/login');
        } catch (error: any) {
            console.error("Reset error", error);
            alert("Failed to reset password: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const [loading, setLoading] = useState(false);

    if (showResetForm) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-800">Please wait</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                    </div>
                )}
                {status === 'success' && !showResetForm && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-green-500 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-800">Success</h2>
                        <p className="text-gray-600 mt-2 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/app/explore')}
                            className="bg-pink-600 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-700"
                        >
                            Continue to App
                        </button>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="text-red-500 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-800">Error</h2>
                        <p className="text-gray-600 mt-2 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-pink-600 font-bold hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
