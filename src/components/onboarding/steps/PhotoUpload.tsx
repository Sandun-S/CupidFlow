import { useState } from 'react';
import NICUploader from '../../verification/NICUploader';
import { useUserStore } from '../../../store/userStore';
import { useAuthStore } from '../../../store/authStore';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import SHA256 from 'crypto-js/sha256';
import { useNavigate } from 'react-router-dom';

export default function PhotoUpload() {
    const { draft } = useUserStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [nicFront, setNicFront] = useState('');
    const [nicBack, setNicBack] = useState('');
    const [selfie, setSelfie] = useState('');
    const [nicNumber, setNicNumber] = useState('');
    const [avatar, setAvatar] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!nicFront || !nicBack || !selfie || !nicNumber || !avatar) {
            setError("Please complete all fields and uploads");
            return;
        }

        if (!user) return;

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Check for Duplicate NIC
            const nicHash = SHA256(nicNumber).toString();
            const q = query(collection(db, "users"), where("nicHash", "==", nicHash));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setError("An account with this NIC number already exists.");
                setIsSubmitting(false);
                return;
            }

            // 2. Create User Profile (Private Data)
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                phone: user.phoneNumber || "",
                role: "user",
                isVerified: false,
                nicStatus: "pending",
                nicHash: nicHash,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp(),
                packageId: "free",
                subscriptionExpiry: null,
                dailySwipeCount: 0,
                lastSwipeDate: new Date().toISOString().split('T')[0],
                settings: {
                    showAge: true,
                    showLastName: false,
                    blurPhotos: true
                }
            });

            // 3. Create Public Profile
            // Calculate age from DOB
            const birthDate = new Date(draft.birthDate);
            const ageDiffMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDiffMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            await setDoc(doc(db, "profiles", user.uid), {
                uid: user.uid,
                displayName: draft.displayName,
                gender: draft.gender,
                birthDate: draft.birthDate,
                age: age,
                location: draft.location,
                avatar: avatar,
                gallery: [],
                ethnicity: draft.ethnicity,
                religion: draft.religion,
                caste: null,
                height: draft.height,
                civilStatus: draft.civilStatus,
                profession: draft.profession,
                education: draft.education,
                family: draft.family,
                habits: draft.habits,
                lookingFor: draft.lookingFor,
                bio: draft.bio,
                score: 0
            });

            // 4. Create Verification Request
            await setDoc(doc(db, "verification_requests", user.uid), {
                uid: user.uid,
                nicFrontUrl: nicFront,
                nicBackUrl: nicBack,
                selfieUrl: selfie,
                nicNumber: nicNumber,
                submittedAt: serverTimestamp(),
                status: "pending",
                adminNotes: ""
            });

            // Success!
            navigate('/verify-status');

        } catch (err: any) {
            console.error(err);
            setError("Registration failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Identity Verification</h3>
            <p className="text-sm text-gray-500 mb-4">
                Strict Verification Required. Upload clear photos of your NIC and a Selfie holding the NIC.
                Your data is encrypted and only visible to Admins.
            </p>

            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <div>
                <label className="block text-sm font-medium text-gray-700">NIC Number</label>
                <input
                    type="text"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md uppercase"
                    placeholder="e.g. 199512345678"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NICUploader label="NIC Front Side" type="verification" onUpload={setNicFront} />
                <NICUploader label="NIC Back Side" type="verification" onUpload={setNicBack} />
                <NICUploader label="Selfie with NIC" type="verification" onUpload={setSelfie} />
                <NICUploader label="Profile Photo (Public)" type="public" onUpload={setAvatar} />
            </div>

            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Creating Profile..." : "Submit for Verification"}
                </button>
            </div>
        </div>
    );
}
