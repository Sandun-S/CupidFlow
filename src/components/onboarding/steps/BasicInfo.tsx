import { useState, useEffect } from 'react';
import { useUserStore } from '../../../store/userStore';
import { DISTRICTS } from '../../../lib/constants'; // Import shared constants
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { CheckCircle } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ethnicities = ["Sinhalese", "Tamil", "Muslim", "Burgher", "Other"];
const religions = ["Buddhist", "Christian", "Hindu", "Islam", "Other"];

export default function BasicInfo() {
    const { draft, updateDraft } = useUserStore();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState<any>(null); // confirmationResult object
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    useEffect(() => {
        // Check if user already has a phone saved
        const checkPhone = async () => {
            if (auth.currentUser) {
                const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (docSnap.exists() && docSnap.data().phone) {
                    setPhoneNumber(docSnap.data().phone);
                    setIsPhoneVerified(true); // Assume saved = verified for simplicity/legacy, or check explicit flag
                }
            }
        };
        checkPhone();
    }, []);

    const sendOtp = async () => {
        if (!phoneNumber) return;
        setLoading(true);
        setMessage('');

        try {
            // Cleanup existing verifier if happens to exist
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-onboard', {
                'size': 'invisible',
            });

            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await linkWithPhoneNumber(auth.currentUser!, phoneNumber, appVerifier);
            setVerificationId(confirmationResult);
            setMessage("OTP Sent! Check your phone.");
        } catch (err: any) {
            console.error("Link Phone Error", err);
            if (err.code === 'auth/credential-already-in-use') {
                setMessage("Error: Number already linked to another account.");
            } else if (err.code === 'auth/invalid-phone-number') {
                setMessage("Invalid Phone Number");
            } else {
                setMessage("Failed to send OTP: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!verificationId || !otp) return;
        setLoading(true);
        try {
            await verificationId.confirm(otp);
            setMessage("Phone Verified Successfully!");
            setIsPhoneVerified(true);
            setVerificationId(null);

            // Save to Firestore Immediate
            if (auth.currentUser) {
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    phone: phoneNumber
                });
            }
        } catch (err) {
            console.error(err);
            setMessage("Invalid OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div id="recaptcha-container-onboard"></div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name <span className="text-xs text-gray-500">(Private)</span></label>
                    <input
                        type="text"
                        value={draft.firstName}
                        onChange={(e) => updateDraft({ firstName: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-xs text-gray-500">(Private)</span></label>
                    <input
                        type="text"
                        value={draft.lastName}
                        onChange={(e) => updateDraft({ lastName: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Display Name <span className="text-xs text-gray-500">(Visible to others)</span></label>
                <input
                    type="text"
                    value={draft.displayName}
                    onChange={(e) => updateDraft({ displayName: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="e.g. JD"
                />
            </div>

            {/* Phone Verification Section */}
            <div className={`p-4 rounded-xl border ${isPhoneVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <label className="block text-sm font-medium text-gray-800 mb-2">Mobile Number (For Notifications & Login)</label>

                {isPhoneVerified ? (
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle size={20} />
                        <span>{phoneNumber} (Verified)</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="flex-1 p-2 border rounded-md"
                                placeholder="+94 7X XXX XXXX"
                                disabled={!!verificationId}
                            />
                            {!verificationId && (
                                <button
                                    onClick={sendOtp}
                                    disabled={loading || !phoneNumber}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Verify'}
                                </button>
                            )}
                        </div>

                        {verificationId && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="flex-1 p-2 border rounded-md"
                                    placeholder="Enter OTP Code"
                                />
                                <button
                                    onClick={verifyOtp}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => { setVerificationId(null); setMessage(''); }}
                                    className="text-xs text-gray-500 underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {message && (
                            <p className={`text-xs ${message.includes('Error') || message.includes('Failed') || message.includes('Invalid') ? 'text-red-500' : 'text-blue-600'}`}>
                                {message}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        value={draft.gender}
                        onChange={(e) => updateDraft({ gender: e.target.value as any })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                        type="date"
                        value={draft.birthDate}
                        onChange={(e) => updateDraft({ birthDate: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <select
                            value={draft.location.district}
                            onChange={(e) => updateDraft({ location: { ...draft.location, district: e.target.value } })}
                            className="mt-1 w-full p-2 border rounded-md"
                        >
                            <option value="">Select District</option>
                            {DISTRICTS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                            type="text"
                            value={draft.location.city}
                            onChange={(e) => updateDraft({ location: { ...draft.location, city: e.target.value } })}
                            className="mt-1 w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Address <span className="text-xs text-gray-500">(Private - Visible to Admin)</span></label>
                    <textarea
                        value={draft.location.address || ''}
                        onChange={(e) => updateDraft({ location: { ...draft.location, address: e.target.value } })}
                        className="mt-1 w-full p-2 border rounded-md"
                        rows={2}
                        placeholder="Detailed address for verification..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ethnicity</label>
                    <select
                        value={draft.ethnicity}
                        onChange={(e) => updateDraft({ ethnicity: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        {ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Religion</label>
                    <select
                        value={draft.religion}
                        onChange={(e) => updateDraft({ religion: e.target.value })}
                        className="mt-1 w-full p-2 border rounded-md"
                    >
                        <option value="">Select</option>
                        {religions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Profession</label>
                <input
                    type="text"
                    value={draft.profession}
                    onChange={(e) => updateDraft({ profession: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="Software Engineer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <select
                    value={draft.education}
                    onChange={(e) => updateDraft({ education: e.target.value })}
                    className="mt-1 w-full p-2 border rounded-md"
                >
                    <option value="">Select Education</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelors">Bachelor's Degree</option>
                    <option value="Masters">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
    );
}
