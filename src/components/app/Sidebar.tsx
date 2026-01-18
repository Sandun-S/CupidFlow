import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Heart, User, LogOut, Settings, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
    const { userData } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Explore', path: '/app/explore' },
        { icon: MessageCircle, label: 'Messages', path: '/app/chat' },
        { icon: Heart, label: 'Likes You', path: '/app/likes' },
        { icon: User, label: 'Profile', path: '/app/profile/view' },
        { icon: Settings, label: 'Settings', path: '/app/settings' },
    ];

    const isPremium = ['gold', 'platinum'].includes(userData?.packageId || '');

    return (
        <div className="flex flex-col h-full p-6">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">CupidFlow</h1>
            </div>

            {/* User Mini Profile */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl dark:bg-gray-800/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {userData?.photos?.[0] ? (
                        <img src={userData.photos[0]} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-xs flex items-center justify-center h-full font-bold">{userData?.displayName?.[0]}</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate dark:text-white">{userData?.displayName}</p>
                    <p className="text-xs text-gray-500 truncate dark:text-gray-400 capitalize">{userData?.packageId || 'Free'}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'fill-current' : ''} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Upgrade Box */}
            {!isPremium && (
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => navigate('/app/upgrade')}>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center mb-2 backdrop-blur-sm">
                            <Crown size={16} className="text-white" />
                        </div>
                        <h3 className="font-bold text-sm mb-1">Upgrade to Gold</h3>
                        <p className="text-xs text-white/90 mb-2">See who likes you & more!</p>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                </div>
            )}

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors dark:hover:bg-red-900/20"
            >
                <LogOut size={20} />
                Sign Out
            </button>
        </div>
    );
}
