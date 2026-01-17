import { useState } from 'react';
import NICUploader from '../../verification/NICUploader';
import { useUserStore } from '../../../store/userStore';
import { useAuthStore } from '../../../store/authStore';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import SHA256 from 'crypto-js/sha256';
import { useNavigate } from 'react-router-dom';
import { logAction } from '../../../lib/audit';

// Duplicate imports removed

export default function PhotoUpload() {
    const { draft, updateDraft } = useUserStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [nicFront, setNicFront] = useState(draft.nicFront || '');
    const [nicBack, setNicBack] = useState(draft.nicBack || '');
    const [selfie, setSelfie] = useState(draft.selfie || '');
    const [nicNumber, setNicNumber] = useState(draft.nicNumber || '');

    // Manage profile photos (up to 6)
    // We initialize with what's in draft.photos or empty array
    const [profilePhotos, setProfilePhotos] = useState<string[]>(draft.photos || []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Check for previous rejection
    useState(() => {
        const checkStatus = async () => {
            if (!user) return;
            const reqRef = doc(db, "verification_requests", user.uid);
            const reqSnap = await getDoc(reqRef);
            if (reqSnap.exists()) {
                const data = reqSnap.data();
                if (data.status === 'rejected' && data.adminNotes) {
                    setRejectionReason(data.adminNotes);
                    setError("Your previous application was rejected. Please review the reason below and re-submit.");
                }
            }
        };
        checkStatus();
    });

    const handleNicFront = (url: string) => { setNicFront(url); updateDraft({ nicFront: url }); };
    const handleNicBack = (url: string) => { setNicBack(url); updateDraft({ nicBack: url }); };
    const handleSelfie = (url: string) => { setSelfie(url); updateDraft({ selfie: url }); };
    const handleNicNumber = (val: string) => { setNicNumber(val); updateDraft({ nicNumber: val }); };

    const handleProfilePhoto = (url: string, index: number) => {
        const newPhotos = [...profilePhotos];
        newPhotos[index] = url;
        // Filter out empty slots if we want to be clean, but for UI grid we might keep indexed positions.
        // Actually, let's just keep the array simple. If we upload to index 0, it sets newPhotos[0].
        setProfilePhotos(newPhotos);
        updateDraft({ photos: newPhotos });
    };

    const handleSubmit = async () => {
        // Validate: Need NIC stuff AND at least 1 profile photo
        const validPhotos = profilePhotos.filter(p => !!p);

        if (!nicFront || !nicBack || !selfie || !nicNumber || validPhotos.length === 0) {
            setError("Please upload all verification documents and at least 1 profile photo.");
            return;
        }

        if (!user) return;

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Check for Duplicate NIC
            const nicHash = SHA256(nicNumber).toString();
            const hashDocRef = doc(db, "nic_hashes", nicHash);
            const hashDoc = await getDoc(hashDocRef);

            if (hashDoc.exists() && hashDoc.data().uid !== user.uid) {
                setError("An account with this NIC number already exists.");
                setIsSubmitting(false);
                return;
            }

            // 2. Create User Profile (Private Data)
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                phone: user.phoneNumber || "",
                firstName: draft.firstName, // New
                lastName: draft.lastName,   // New
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
                },
                privateAddress: draft.location.address || "" // New
            });

            // 3. Create Public Profile
            const birthDate = new Date(draft.birthDate);
            const ageDiffMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDiffMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            await setDoc(doc(db, "profiles", user.uid), {
                uid: user.uid,
                displayName: draft.displayName || draft.firstName, // Fallback
                gender: draft.gender,
                birthDate: draft.birthDate,
                age: age,
                location: {
                    district: draft.location.district,
                    city: draft.location.city,
                    province: draft.location.province
                },
                avatar: validPhotos[0], // First photo is avatar
                photos: validPhotos,    // All photos
                ethnicity: draft.ethnicity,
                religion: draft.religion,
                height: draft.height || "",
                civilStatus: draft.civilStatus || "",
                profession: draft.profession,
                education: draft.education || "",
                family: draft.family,
                habits: draft.habits,
                interests: draft.interests || [], // New
                lookingFor: draft.lookingFor || "",
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

            // 5. Save NIC Hash
            if (!hashDoc.exists()) {
                await setDoc(doc(db, "nic_hashes", nicHash), {
                    uid: user.uid,
                    createdAt: serverTimestamp()
                });
            }

            // Log detailed signup action
            await logAction('USER_SIGNUP', {
                timestamp: serverTimestamp(),
                nicNumber,
                photosCount: validPhotos.length,
                profession: draft.profession,
                district: draft.location.district
            });

            navigate('/verify-status');

        } catch (err: any) {
            console.error(err);
            setError("Registration failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Section 1: Verification */}
            <div className="bg-white p-4 rounded-lg border border-pink-100">
                <h3 className="text-lg font-medium text-gray-900">Identity Verification</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Strict Verification Required. These photos are private and for admin review only.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">NIC Number</label>
                        <input
                            type="text"
                            value={nicNumber}
                            onChange={(e) => handleNicNumber(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md uppercase"
                            placeholder="e.g. 199512345678"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <NICUploader label="NIC Front" type="verification" onUpload={handleNicFront} initialUrl={nicFront} />
                        <NICUploader label="NIC Back" type="verification" onUpload={handleNicBack} initialUrl={nicBack} />
                        <NICUploader label="Selfie with NIC" type="verification" onUpload={handleSelfie} initialUrl={selfie} />
                    </div>
                </div>
            </div>

            {/* Section 2: Public Photos */}
            <div>
                <h3 className="text-lg font-medium text-gray-900">Your Photos</h3>
                <p className="text-sm text-gray-500 mb-2">
                    Add up to 6 photos. The first one will be your main profile picture.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Photo Guidelines:</strong> Please use clear, recent photos of yourself.
                                <br />• Do not use fake or AI-generated images.
                                <br />• Group photos should be avoided for the main picture.
                                <br />• Nudity or inappropriate content will result in an immediate ban.
                            </p>
                        </div>
                    </div>
                </div>

                {rejectionReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <h4 className="text-red-800 font-bold mb-1">Previous Rejection Reason:</h4>
                        <p className="text-red-700 bg-white p-2 rounded border border-red-100">{rejectionReason}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <NICUploader
                            key={index}
                            label={`Photo ${index + 1}`}
                            type="public"
                            onUpload={(url) => handleProfilePhoto(url, index)}
                            initialUrl={profilePhotos[index] || ''}
                        />
                    ))}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Creating Profile..." : "Submit Profile"}
                </button>
            </div>
        </div>
    );
}
