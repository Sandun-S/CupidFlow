import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Settings } from 'lucide-react';

interface SystemConfigData {
    freeUserLimit: number;
    defaultFreePackageId: string;
    defaultExpiryMonths: number;
}

const DEFAULT_CONFIG: SystemConfigData = {
    freeUserLimit: 1000,
    defaultFreePackageId: 'free',
    defaultExpiryMonths: 6
};

export default function SystemConfig() {
    const [config, setConfig] = useState<SystemConfigData>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentCount, setCurrentCount] = useState<number>(0);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            // Fetch Config
            const docSnap = await getDoc(doc(db, "system", "config"));
            if (docSnap.exists()) {
                setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as SystemConfigData);
                setCurrentCount(docSnap.data().currentCount || 0);
            } else {
                // Determine current user count if config doesn't exist? 
                // For now just 0. The cloud function usually updates this.
                // We'll initialize the doc if safe.
            }
        } catch (error) {
            console.error("Error fetching config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "system", "config"), {
                ...config,
                updatedAt: new Date()
            }, { merge: true });
            alert("System Configuration Saved!");
        } catch (error) {
            console.error("Error saving config", error);
            alert("Failed to save config.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-white">
                <Settings className="text-pink-600" />
                System Configuration
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl space-y-6 dark:bg-gray-800 dark:border dark:border-gray-700">

                {/* Free User Limit */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Free User Limit</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={config.freeUserLimit}
                            onChange={(e) => setConfig({ ...config, freeUserLimit: parseInt(e.target.value) || 0 })}
                            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                            Current Users: <strong className="dark:text-white">{currentCount}</strong>
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        The first X users get free access. After this limit, new signups will require payment.
                    </p>
                </div>

                {/* Default Package */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Default Package for Free Users</label>
                    <select
                        value={config.defaultFreePackageId}
                        onChange={(e) => setConfig({ ...config, defaultFreePackageId: e.target.value })}
                        className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="free">Free (Basic)</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        Users within the limit will be assigned this package automatically.
                    </p>
                </div>

                {/* Account Expiry */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Account Valid Period (Months)</label>
                    <input
                        type="number"
                        value={config.defaultExpiryMonths}
                        onChange={(e) => setConfig({ ...config, defaultExpiryMonths: parseInt(e.target.value) || 0 })}
                        className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        Accounts will expire after this many months, requiring renewal.
                    </p>
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:bg-pink-300 disabled:dark:bg-pink-900/50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

            </div>
        </div>
    );
}
