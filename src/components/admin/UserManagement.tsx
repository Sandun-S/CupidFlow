import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, limit, orderBy } from 'firebase/firestore';
import { Search, Shield, UserX, Eye } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Packages
            const packagesSnap = await getDocs(collection(db, "packages"));
            const packagesList = packagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPackages(packagesList);

            // 2. Fetch Users
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
            const snapshot = await getDocs(q);
            const userDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // 3. Fetch Profiles for these users (to get names)
            // We'll do individual fetches or batches. For 50, Promise.all is acceptable.
            const usersWithProfiles = await Promise.all(userDocs.map(async (user: any) => {
                const profileRef = doc(db, "profiles", user.id);
                // We don't want to fail if one profile fails, so we catch
                try {
                    const profileSnap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
                    if (profileSnap.exists()) {
                        return { ...user, ...profileSnap.data(), email: user.email, role: user.role }; // Merge, preferring profile data for display but keeping user auth data
                    }
                } catch (e) {
                    console.warn("Failed to fetch profile for", user.id);
                }
                return user;
            }));

            setUsers(usersWithProfiles);

        } catch (error) {
            console.error("Error fetching admin data", error);
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

    const handleSubscription = async (userId: string, packageId: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                packageId: packageId,
                // accessStatus: 'active' // Optional: reactivate if they upgrade?
            });
            setUsers(users.map(u => u.id === userId ? { ...u, packageId: packageId } : u));
        } catch (error) {
            console.error(error);
            alert("Failed to update subscription");
        }
    }

    const filteredUsers = users.filter(u =>
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone && u.phone.includes(searchTerm))
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
                                <th className="p-4 font-bold">Package</th>
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
                                            <div className="font-bold text-gray-900">{user.displayName || "No Name (Onboarding)"}</div>
                                            <div className="text-xs text-gray-400">{user.gender} • {user.id.slice(0, 6)}</div>
                                            {user.nicStatus && <div className={`text-[10px] uppercase font-bold ${user.nicStatus === 'verified' ? 'text-green-500' : 'text-yellow-500'}`}>{user.nicStatus}</div>}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-600">{user.email}</div>
                                            <div className="text-xs text-gray-400">{user.phone || "No Phone"}</div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.packageId || 'free'}
                                                onChange={(e) => handleSubscription(user.id, e.target.value)}
                                                className="p-2 rounded-lg border border-gray-200 text-sm focus:border-pink-500 outline-none bg-white"
                                            >
                                                <option value="free">Free</option>
                                                {packages.map(pkg => (
                                                    <option key={pkg.id} value={pkg.id}>
                                                        {pkg.name} (${pkg.price})
                                                    </option>
                                                ))}
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
                                                    title="View Public Profile"
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                    onClick={() => alert("Navigate to public profile view? (Needs valid profile)")}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    title={user.role === 'admin' ? "Remove Admin" : "Make Admin"}
                                                    onClick={() => handleUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                    className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}
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
