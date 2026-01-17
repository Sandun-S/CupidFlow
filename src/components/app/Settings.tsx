import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, User, Sliders, Crown, Moon } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export default function Settings() {
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleResetSwipes = async () => {
        if (!confirm("Are you sure? This will clear all your likes/dislikes and you will see everyone again.")) return;
        try {
            // Delete swipes where fromUid == me
            const q = query(collection(db, "swipes"), where("fromUid", "==", auth.currentUser?.uid));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);
            alert("Swipes reset! Go back to Explore to see profiles again.");
        } catch (error) {
            console.error("Reset failed", error);
            alert("Failed to reset swipes.");
        }
    };

    const settingItems = [
        { icon: Crown, label: 'Upgrade to Premium', action: () => navigate('/app/upgrade') },
        { icon: User, label: 'Edit Profile', action: () => navigate('/app/profile/edit') },
        { icon: Sliders, label: 'Preferences', action: () => navigate('/app/preferences') },
        { icon: Bell, label: 'Notifications', action: () => alert('Notifications coming soon') },
        { icon: Shield, label: 'Privacy & Security', action: () => navigate('/privacy') },
        { icon: HelpCircle, label: 'Help & Support', action: () => navigate('/about') },
    ];

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative dark:bg-gray-900 transition-colors duration-300">
                <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 dark:bg-gray-900 dark:border-b dark:border-gray-800 transition-colors duration-300">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-lg font-bold dark:text-white">Settings</h1>
                </div>

                <div className="p-4 flex-1">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</h2>
                        </div>
                        {settingItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 dark:hover:bg-gray-700 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-50 text-pink-500 rounded-lg dark:bg-pink-900/20">
                                        <item.icon size={18} />
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm dark:text-gray-200">{item.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400" />
                            </button>
                        ))}
                    </div>

                    {/* App Settings Section */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">App Settings</h2>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors dark:hover:bg-gray-700 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg dark:bg-purple-900/20">
                                    <Moon size={18} />
                                </div>
                                <span className="font-medium text-gray-700 text-sm dark:text-gray-200">Dark Mode</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Developer Options (Visible for testing) */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Developer Options</h2>
                        </div>
                        <button
                            onClick={handleResetSwipes}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-red-500 dark:hover:bg-gray-700 dark:bg-gray-800"
                        >
                            <span className="font-medium text-sm">Reset My Swipes</span>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full dark:bg-red-900/40 dark:text-red-300">Debug</span>
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-xl shadow-sm hover:bg-red-100 transition flex items-center justify-center gap-2 mt-8 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-8 mb-8">
                        CupidFlow v1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}
