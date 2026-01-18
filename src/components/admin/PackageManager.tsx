import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Edit, Plus, Save, RotateCcw } from 'lucide-react';

interface Package {
    id: string;
    name: string;
    price: number;
    displayPrice: string;
    duration: string;
    features: string[];
    color: string;
    popular?: boolean;
    order: number;
    dailySwipeLimit: number; // Added limit
    isActive?: boolean;
}

const DEFAULT_PACKAGES: Package[] = [
    {
        id: 'silver',
        name: 'Silver',
        price: 1500,
        displayPrice: 'LKR 1,500',
        duration: '1 Month',
        color: 'bg-gray-100 border-gray-300',
        features: ['10 Swipes/Day', 'See who likes you', 'Standard Support'],
        order: 1,
        dailySwipeLimit: 10,
        isActive: true
    },
    {
        id: 'gold',
        name: 'Gold',
        price: 3500,
        displayPrice: 'LKR 3,500',
        duration: '3 Months',
        popular: true,
        color: 'bg-yellow-50 border-yellow-400',
        features: ['Unlimited Swipes', 'See who likes you', 'Priority Support', 'Profile Badge'],
        order: 2,
        dailySwipeLimit: 1000,
        isActive: true
    },
    {
        id: 'platinum',
        name: 'Platinum',
        price: 9000,
        displayPrice: 'LKR 9,000',
        duration: '12 Months',
        color: 'bg-purple-50 border-purple-400',
        features: ['Everything in Gold', 'Profile Boost (1/mo)', 'Read Receipts'],
        order: 3,
        dailySwipeLimit: 1000,
        isActive: true
    }
];

export default function PackageManager() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPkg, setEditingPkg] = useState<Package | null>(null);

    // ... (fetch logic same) ...
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'packages'));
            if (snap.empty) {
                setPackages([]);
            } else {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Package));
                setPackages(data.sort((a, b) => a.order - b.order));
            }
        } catch (error) {
            console.error("Error fetching packages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!window.confirm("This will overwrite existing packages with defaults. Continue?")) return;
        setLoading(true);
        try {
            for (const pkg of DEFAULT_PACKAGES) {
                await setDoc(doc(db, 'packages', pkg.id), pkg);
            }
            await fetchPackages();
        } catch (error) {
            console.error("Error seeding packages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPkg) return;

        try {
            await setDoc(doc(db, 'packages', editingPkg.id), editingPkg);
            setEditingPkg(null);
            fetchPackages();
        } catch (error) {
            console.error("Error saving package", error);
            alert("Failed to save");
        }
    };

    if (loading) return <div>Loading Packages...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Package Manager</h2>
                <div className="flex gap-2">
                    <button onClick={handleSeed} className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        <RotateCcw size={16} /> Reset Defaults
                    </button>
                    <button
                        onClick={() => setEditingPkg({
                            id: 'new_pkg_' + Date.now(),
                            name: 'New Package',
                            price: 0,
                            displayPrice: 'LKR 0',
                            duration: '1 Month',
                            color: 'bg-white border-gray-200',
                            features: ['Unlimted Swipes'],
                            order: packages.length + 1,
                            dailySwipeLimit: 10,
                            isActive: true
                        })}
                        className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm"
                    >
                        <Plus size={16} /> Add Package
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Limits</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {packages.map((pkg) => (
                            <tr key={pkg.id} className={pkg.isActive === false ? 'opacity-50 bg-gray-50 dark:bg-gray-900/50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {pkg.isActive !== false ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold dark:text-white">{pkg.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{pkg.duration}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                                    {pkg.displayPrice}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{pkg.dailySwipeLimit} Swipes/Day</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setEditingPkg(pkg)} className="text-indigo-600 hover:text-indigo-900 mr-4 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        <Edit size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingPkg && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Edit Package: {editingPkg.name}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Package ID (Unique)</label>
                                <input
                                    value={editingPkg.id}
                                    disabled
                                    className="mt-1 w-full bg-gray-100 border border-gray-300 rounded p-2 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <input
                                        value={editingPkg.name}
                                        onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Price</label>
                                    <input
                                        value={editingPkg.displayPrice}
                                        onChange={e => setEditingPkg({ ...editingPkg, displayPrice: e.target.value })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                                    <input
                                        value={editingPkg.duration}
                                        onChange={e => setEditingPkg({ ...editingPkg, duration: e.target.value })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</label>
                                    <input
                                        type="number"
                                        value={editingPkg.order}
                                        onChange={e => setEditingPkg({ ...editingPkg, order: Number(e.target.value) })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Limits Section */}
                            <div className="p-3 bg-blue-50 rounded border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                                <h4 className="font-semibold text-blue-900 text-sm mb-2 dark:text-blue-300">Technical Limits</h4>
                                <div>
                                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-400">Daily Swipe Limit</label>
                                    <input
                                        type="number"
                                        value={editingPkg.dailySwipeLimit}
                                        onChange={e => setEditingPkg({ ...editingPkg, dailySwipeLimit: Number(e.target.value) })}
                                        className="mt-1 w-full border border-blue-200 rounded p-2 dark:bg-gray-800 dark:border-blue-800 dark:text-white"
                                        placeholder="e.g. 10 or 1000"
                                    />
                                    <p className="text-xs text-blue-600 mt-1 dark:text-blue-400">Set to 1000 or more for 'Unlimited'</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Features (Bullet points)</label>
                                <p className="text-xs text-gray-500 mb-1 dark:text-gray-400">These are just text displayed to the user (e.g., "Unlimited Swipes"). They do not control actual app logic.</p>
                                <textarea
                                    value={editingPkg.features.join(', ')}
                                    onChange={e => setEditingPkg({ ...editingPkg, features: e.target.value.split(',').map(s => s.trim()) })}
                                    className="mt-1 w-full border border-gray-300 rounded p-2 h-24 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                            </div>


                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingPkg.isActive !== false}
                                    onChange={e => setEditingPkg({ ...editingPkg, isActive: e.target.checked })}
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Package enabled
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingPkg(null)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
