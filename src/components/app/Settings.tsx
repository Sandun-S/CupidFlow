import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Bell, Shield, HelpCircle, ChevronRight, User, Sliders } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

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

    const settingItems = [
        { icon: User, label: 'Edit Profile', action: () => navigate('/app/profile/edit') },
        { icon: Sliders, label: 'Preferences', action: () => navigate('/app/preferences') },
        { icon: Bell, label: 'Notifications', action: () => alert('Notifications coming soon') },
        { icon: Shield, label: 'Privacy & Security', action: () => navigate('/privacy') },
        { icon: HelpCircle, label: 'Help & Support', action: () => navigate('/about') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold">Settings</h1>
            </div>

            <div className="p-4 flex-1">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</h2>
                    </div>
                    {settingItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className="text-gray-500" />
                                <span className="font-medium text-gray-700 text-sm">{item.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-white text-red-500 font-bold py-4 rounded-xl shadow-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                    <LogOut size={20} />
                    Log Out
                </button>

                <p className="text-center text-xs text-gray-400 mt-8">
                    CupidFlow v1.0.0
                </p>
            </div>
        </div >
    );
}
