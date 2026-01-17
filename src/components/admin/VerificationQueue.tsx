import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logAction } from '../../lib/audit';
import { CheckCircle, XCircle, Phone, User } from 'lucide-react';

interface Request {
    id: string; // uid
    nicFrontUrl: string;
    nicBackUrl: string;
    selfieUrl: string;
    nicNumber: string;
    status: string;
    submittedAt: any;
    userPhone?: string; // Fetched from user doc
    displayName?: string;
    fullName?: string;
    location?: string;
    address?: string;
    age?: string | number;
}

export default function VerificationQueue() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState<Request | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "verification_requests"), where("status", "==", "pending"));
            const snapshot = await getDocs(q);

            const reqList: Request[] = [];
            for (const d of snapshot.docs) {
                const data = d.data();
                // Fetch user phone for context
                const userDoc = await getDoc(doc(db, "users", data.uid));
                const userPhone = userDoc.exists() ? userDoc.data().phone : "N/A";

                // Fetch profile for additional details
                const profileDoc = await getDoc(doc(db, "profiles", data.uid));
                const profileData = profileDoc.exists() ? profileDoc.data() : {};

                reqList.push({
                    id: d.id,
                    ...data,
                    userPhone,
                    displayName: profileData.displayName || "Unknown",
                    fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || "Unknown Name",
                    location: profileData.location ? `${profileData.location.city}, ${profileData.location.district}` : "Unknown Location",
                    address: profileData.location?.address || "No Address Provided",
                    age: profileData.age || "N/A"
                } as Request);
            }
            setRequests(reqList);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (action: 'approve' | 'reject', note: string) => {
        if (!selectedReq) return;

        try {
            const batch = writeBatch(db);

            // Update Request Status
            const reqRef = doc(db, "verification_requests", selectedReq.id);

            if (action === 'approve') {
                // Approve: Verified True, NIC Verified
                const userRef = doc(db, "users", selectedReq.id);
                batch.update(userRef, {
                    isVerified: true,
                    nicStatus: 'verified'
                });

                batch.update(reqRef, {
                    status: 'reviewed',
                    adminNotes: note
                });
            } else {
                // Reject
                const userRef = doc(db, "users", selectedReq.id);
                batch.update(userRef, {
                    nicStatus: 'rejected'
                }); // Keep isVerified false
                batch.update(reqRef, {
                    status: 'rejected', // Changed from 'reviewed' to 'rejected' so user knows
                    adminNotes: note
                });
            }

            await batch.commit();

            // Log Admin Action
            await logAction(
                action === 'approve' ? 'ADMIN_VERIFY_APPROVE' : 'ADMIN_VERIFY_REJECT',
                {
                    requestId: selectedReq.id,
                    nicNumber: selectedReq.nicNumber,
                    note: note
                },
                selectedReq.id // Target User ID
            );

            // Refresh
            setSelectedReq(null);
            fetchRequests();

        } catch (err) {
            console.error("Action failed", err);
            alert("Action failed");
        }
    };

    if (loading) return <div>Loading Requests...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Verification Queue</h2>

            {requests.length === 0 ? (
                <p className="text-gray-500">No pending verification requests.</p>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                                    {req.displayName ? req.displayName[0] : 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{req.displayName || "Unknown User"}</h3>
                                    <p className="text-sm text-gray-500 font-mono">{req.nicNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right text-xs text-gray-400">
                                    <p>{new Date(req.submittedAt?.seconds * 1000).toLocaleDateString()}</p>
                                    <p>{req.status}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedReq(req)}
                                    className="bg-pink-600 text-white px-4 py-2 text-sm font-bold rounded-lg hover:bg-pink-700 transition"
                                >
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {selectedReq && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Reviewing: {selectedReq.displayName}</h2>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border"><User size={14} /> {selectedReq.fullName}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border"><Phone size={14} /> {selectedReq.userPhone}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border">📍 {selectedReq.location}</span>
                                    <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-200 font-mono font-bold">NIC: {selectedReq.nicNumber}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <XCircle size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Selfie */}
                            <div className="flex flex-col gap-2">
                                <div className="bg-white p-3 rounded-xl shadow-sm border text-center font-bold text-gray-700">Selfie</div>
                                <div className="flex-1 bg-black rounded-xl overflow-hidden border-2 border-gray-200 relative group">
                                    <img src={selectedReq.selfieUrl} className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* NIC Front */}
                            <div className="flex flex-col gap-2">
                                <div className="bg-white p-3 rounded-xl shadow-sm border text-center font-bold text-gray-700">NIC Front</div>
                                <div className="flex-1 bg-black rounded-xl overflow-hidden border-2 border-gray-200 relative group">
                                    <img src={selectedReq.nicFrontUrl} className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* NIC Back */}
                            <div className="flex flex-col gap-2">
                                <div className="bg-white p-3 rounded-xl shadow-sm border text-center font-bold text-gray-700">NIC Back</div>
                                <div className="flex-1 bg-black rounded-xl overflow-hidden border-2 border-gray-200 relative group">
                                    <img src={selectedReq.nicBackUrl} className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t bg-white flex flex-col gap-4">
                            <textarea
                                id="admin-note"
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="Admin Notes (Required for Rejection)..."
                                rows={2}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        const note = (document.getElementById('admin-note') as HTMLTextAreaElement).value;
                                        if (!note) return alert("Please provide a rejection reason.");
                                        handleAction('reject', note);
                                    }}
                                    className="px-6 py-3 border border-red-200 text-red-600 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition flex items-center gap-2"
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                                <button
                                    onClick={() => {
                                        const note = (document.getElementById('admin-note') as HTMLTextAreaElement).value;
                                        handleAction('approve', note || 'Verified by Admin');
                                    }}
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-200"
                                >
                                    <CheckCircle size={18} /> Approve & Verify
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
