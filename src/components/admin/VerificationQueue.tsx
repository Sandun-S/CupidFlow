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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{req.nicNumber}</h3>
                                    <p className="text-sm text-gray-500">{new Date(req.submittedAt?.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedReq(req)}
                                    className="bg-pink-100 text-pink-700 px-3 py-1 text-sm rounded-full hover:bg-pink-200"
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
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold">Reviewing: {selectedReq.displayName} ({selectedReq.age})</h2>
                                <p className="text-sm text-gray-500 flex flex-col gap-1 mt-1">
                                    <span className="flex items-center gap-2 font-medium text-gray-900"><User size={14} /> {selectedReq.fullName}</span>
                                    <span className="flex items-center gap-2"><Phone size={14} /> {selectedReq.userPhone}</span>
                                    <span className="flex items-center gap-2">📍 {selectedReq.address} ({selectedReq.location})</span>
                                    <span className="text-xs text-gray-400">NIC: {selectedReq.nicNumber}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedReq(null)} className="text-gray-500 hover:text-gray-800">Close</button>
                        </div>

                        {/* Split View */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <p className="text-white text-center font-bold">Selfie</p>
                                <img src={selectedReq.selfieUrl} className="w-full rounded-lg border border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-white text-center font-bold">NIC Front</p>
                                <img src={selectedReq.nicFrontUrl} className="w-full rounded-lg border border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-white text-center font-bold">NIC Back</p>
                                <img src={selectedReq.nicBackUrl} className="w-full rounded-lg border border-gray-700" />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t bg-white">
                            {/* Rejection Note Input - Only relevant if we are considering rejection, 
                                but to keep UI simple, let's just show it or toggle it. 
                                Actually, prompt or show input always? Let's show a small input. */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Required for Rejection)</label>
                                <textarea
                                    id="admin-note"
                                    className="w-full border rounded-md p-2 text-sm"
                                    placeholder="Reason for rejection or approval notes..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        const note = (document.getElementById('admin-note') as HTMLTextAreaElement).value;
                                        if (!note) {
                                            alert("Please provide a reason for rejection.");
                                            return;
                                        }
                                        handleAction('reject', note);
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-bold"
                                >
                                    <XCircle /> Reject
                                </button>
                                <button
                                    onClick={() => {
                                        const note = (document.getElementById('admin-note') as HTMLTextAreaElement).value;
                                        handleAction('approve', note || 'Approved by Admin');
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                                >
                                    <CheckCircle /> Approve & Verify
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
