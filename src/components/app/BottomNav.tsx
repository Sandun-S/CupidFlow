import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, MessageCircle, Heart, User } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/app/explore', icon: Flame, label: 'Explore' },
        { path: '/app/likes', icon: Heart, label: 'Likes' },
        { path: '/app/chat', icon: MessageCircle, label: 'Chat' },
        { path: '/app/profile/view', icon: User, label: 'Profile' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white border-t border-gray-100 py-3 px-6 flex justify-between items-center max-w-md mx-auto shadow-lg-up">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <item.icon size={24} fill={isActive ? "currentColor" : "none"} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
