import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, writeBatch, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle, XCircle, CreditCard, ExternalLink } from 'lucide-react';

interface Transaction {
    id: string;
    uid: string;
    amount: number;
    packageId: string; // 'gold' | 'platinum'
    slipUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: any;
    userPhone?: string;
    userName?: string;
}



export default function TransactionManager() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "transactions"), where("status", "==", "pending"));
            const snapshot = await getDocs(q);

            // Fetch all user/profile data in parallel
            const items = await Promise.all(snapshot.docs.map(async (d) => {
                const data = d.data();
                let userPhone = "N/A";
                let userName = "Unknown User";

                try {
                    // Parallel fetch user and profile
                    const [userSnap, profileSnap] = await Promise.all([
                        getDoc(doc(db, "users", data.uid)),
                        getDoc(doc(db, "profiles", data.uid))
                    ]);

                    if (userSnap.exists()) {
                        const uData = userSnap.data();
                        userPhone = uData.phone || uData.email || "N/A";
                    }

                    if (profileSnap.exists()) {
                        userName = profileSnap.data().displayName || "Unnamed Profile";
                    } else {
                        // Fallback if profile missing (maybe just registered)
                        userName = `User (${data.uid.slice(0, 5)})`;
                    }
                } catch (e) {
                    console.error("Error fetching details for txn", d.id, e);
                }

                return {
                    id: d.id,
                    ...data,
                    userPhone,
                    userName
                } as Transaction;
            }));

            setTransactions(items);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedTxn) return;

        try {
            const batch = writeBatch(db);
            const txnRef = doc(db, "transactions", selectedTxn.id);
            const userRef = doc(db, "users", selectedTxn.uid);

            if (action === 'approve') {
                // 1. Fetch Dynamic Package Details to get latest Limit & Duration
                let daysToAdd = 30; // Fallback
                let newSwipeLimit = 10; // Fallback

                try {
                    const pkgSnap = await getDoc(doc(db, "packages", selectedTxn.packageId));
                    if (pkgSnap.exists()) {
                        const pkgData = pkgSnap.data();
                        // Parse duration string "1 Month" -> 30 days (Simple logic)
                        if (pkgData.duration?.includes('12 Month')) daysToAdd = 365;
                        else if (pkgData.duration?.includes('3 Month')) daysToAdd = 90;
                        else if (pkgData.duration?.includes('1 Month')) daysToAdd = 30;

                        newSwipeLimit = pkgData.dailySwipeLimit || 10;
                    }
                } catch (e) {
                    console.error("Could not fetch package details, using defaults", e);
                }

                // 2. Calculate New Expiry
                const now = new Date();
                const expiryDate = new Date();
                expiryDate.setDate(now.getDate() + daysToAdd);

                // 3. Update User (Private) with NEW LIMIT
                batch.update(userRef, {
                    packageId: selectedTxn.packageId,
                    subscriptionExpiry: Timestamp.fromDate(expiryDate),
                    isPremium: true,
                    dailySwipeLimit: newSwipeLimit // <--- CRITICAL FIX: Update limit based on package
                });

                // 4. Update Profile (Public)
                const profileRef = doc(db, "profiles", selectedTxn.uid);
                batch.update(profileRef, {
                    packageId: selectedTxn.packageId,
                    isPremium: true
                    // We don't need to expose swipe limit publicly
                });

                // 5. Update Transaction
                batch.update(txnRef, {
                    status: 'approved',
                    approvedAt: Timestamp.now(),
                    adminNotes: `Approved. Limit set to ${newSwipeLimit}`
                });
            } else {
                // Reject
                batch.update(txnRef, {
                    status: 'rejected',
                    adminNotes: 'Rejected: Invalid Slip'
                });
            }

            await batch.commit();

            setSelectedTxn(null);
            fetchTransactions();

        } catch (err) {
            console.error("Action failed", err);
            alert("Action failed");
        }
    };

    if (loading) return <div>Loading Transactions...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction Manager</h2>

            {transactions.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No pending bank transfers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {transactions.map(txn => (
                        <div key={txn.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{txn.userName}</h3>
                                    <p className="text-sm text-gray-500">{txn.userPhone}</p>
                                </div>
                                <span className="bg-pink-100 text-pink-700 px-2 py-1 text-xs rounded-lg font-bold uppercase">
                                    {txn.packageId}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-2xl font-bold text-gray-800">LKR {txn.amount}</p>
                                <p className="text-xs text-gray-400">
                                    {txn.submittedAt?.seconds ? new Date(txn.submittedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </p>
                            </div>

                            <div className="h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden relative group">
                                <img src={txn.slipUrl} alt="Slip" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setSelectedTxn(txn)} className="text-white text-sm font-bold flex items-center gap-2">
                                        <ExternalLink size={16} /> Review
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedTxn(txn)}
                                className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
                            >
                                Review details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {selectedTxn && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row">
                        {/* Image Side */}
                        <div className="w-full md:w-1/2 bg-gray-900 flex items-center justify-center p-4">
                            <img src={selectedTxn.slipUrl} className="max-w-full max-h-full rounded shadow-lg" />
                        </div>

                        {/* Details Side */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Payment</h2>
                                <p className="text-gray-500 mb-6">Verify the bank slip details match the request.</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">User</span>
                                        <span className="font-medium">{selectedTxn.userName}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="font-medium">LKR {selectedTxn.amount}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Package</span>
                                        <span className="font-medium uppercase text-pink-600">{selectedTxn.packageId}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Date</span>
                                        <span className="font-medium">
                                            {selectedTxn.submittedAt?.seconds ? new Date(selectedTxn.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => handleAction('reject')}
                                    className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                                <button
                                    onClick={() => handleAction('approve')}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => setSelectedTxn(null)}
                                    className="px-4 text-gray-400 hover:text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
