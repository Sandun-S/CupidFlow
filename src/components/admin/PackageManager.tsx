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
        order: 1
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
        order: 2
    },
    {
        id: 'platinum',
        name: 'Platinum',
        price: 9000,
        displayPrice: 'LKR 9,000',
        duration: '12 Months',
        color: 'bg-purple-50 border-purple-400',
        features: ['Everything in Gold', 'Profile Boost (1/mo)', 'Read Receipts'],
        order: 3
    }
];

export default function PackageManager() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPkg, setEditingPkg] = useState<Package | null>(null);

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
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Package Manager</h2>
                <div className="flex gap-2">
                    <button onClick={handleSeed} className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">
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
                            features: ['Feature 1'],
                            order: packages.length + 1
                        })}
                        className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm"
                    >
                        <Plus size={16} /> Add Package
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {packages.map((pkg) => (
                            <tr key={pkg.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold">{pkg.name}</div>
                                    <div className="text-xs text-gray-500">{pkg.duration}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {pkg.displayPrice}
                                </td>
                                <td className="px-6 py-4">
                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                        {pkg.features.slice(0, 2).map((f, i) => <li key={i}>{f}</li>)}
                                        {pkg.features.length > 2 && <li>+{pkg.features.length - 2} more</li>}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setEditingPkg(pkg)} className="text-indigo-600 hover:text-indigo-900 mr-4">
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
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Edit Package: {editingPkg.name}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Package ID (Unique)</label>
                                <input
                                    value={editingPkg.id}
                                    disabled
                                    className="mt-1 w-full bg-gray-100 border border-gray-300 rounded p-2 text-gray-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        value={editingPkg.name}
                                        onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Display Price</label>
                                    <input
                                        value={editingPkg.displayPrice}
                                        onChange={e => setEditingPkg({ ...editingPkg, displayPrice: e.target.value })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                                    <input
                                        value={editingPkg.duration}
                                        onChange={e => setEditingPkg({ ...editingPkg, duration: e.target.value })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                    <input
                                        type="number"
                                        value={editingPkg.order}
                                        onChange={e => setEditingPkg({ ...editingPkg, order: Number(e.target.value) })}
                                        className="mt-1 w-full border border-gray-300 rounded p-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Features (Comma separated)</label>
                                <textarea
                                    value={editingPkg.features.join(', ')}
                                    onChange={e => setEditingPkg({ ...editingPkg, features: e.target.value.split(',').map(s => s.trim()) })}
                                    className="mt-1 w-full border border-gray-300 rounded p-2 h-24"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingPkg(null)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
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
