import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, limit, orderBy } from 'firebase/firestore';
import { Search, Shield, UserX, Eye } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
            const snapshot = await getDocs(q);
            setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error(error);
            alert("Failed to update role");
        }
    };

    const handleSubscription = async (userId: string, tier: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                subscriptionTier: tier,
                isPremium: tier !== 'free'
            });
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionTier: tier, isPremium: tier !== 'free' } : u));
        } catch (error) {
            console.error(error);
            alert("Failed to update subscription");
        }
    }

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase">
                            <tr>
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Contact</th>
                                <th className="p-4 font-bold">Sub. Tier</th>
                                <th className="p-4 font-bold">Role</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No users found</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{user.displayName || "No Name"}</div>
                                            <div className="text-xs text-gray-400">{user.gender} • {user.id.slice(0, 6)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-600">{user.email}</div>
                                            <div className="text-xs text-gray-400">{user.phone || "No Phone"}</div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.subscriptionTier || 'free'}
                                                onChange={(e) => handleSubscription(user.id, e.target.value)}
                                                className={`p-1 rounded text-xs font-bold border ${user.subscriptionTier === 'platinum' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    user.subscriptionTier === 'gold' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}
                                            >
                                                <option value="free">Free</option>
                                                <option value="gold">Gold</option>
                                                <option value="platinum">Platinum</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                {user.role === 'admin' ? <Shield size={14} className="text-pink-600" /> : <UserX size={14} className="text-gray-400" />}
                                                <span className="capitalize">{user.role || 'User'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    title="View Profile (Coming Soon)"
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                    onClick={() => alert("Public view link construction")}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    title="Make Admin"
                                                    onClick={() => handleUpdateRole(user.id, 'admin')}
                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                >
                                                    <Shield size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
