import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const menuItems = [
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
        { label: "Verifications", path: "/admin/verifications", icon: <ShieldCheck size={20} /> },
        { label: "Transactions", path: "/admin/transactions", icon: <CreditCard size={20} /> },
        { label: "Packages", path: "/admin/packages", icon: <CreditCard size={20} /> },
        { label: "Config", path: "/admin/config", icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-pink-500">CupidFlow</h1>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-pink-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
