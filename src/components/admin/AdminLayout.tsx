import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, LogOut, LayoutDashboard, Settings, Users, Package, Menu, X } from 'lucide-react';
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
        { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
        { label: "Verifications", path: "/admin/verifications", icon: <ShieldCheck size={20} /> },
        { label: "Transactions", path: "/admin/transactions", icon: <CreditCard size={20} /> },
        { label: "Packages", path: "/admin/packages", icon: <Package size={20} /> },
        { label: "Config", path: "/admin/config", icon: <Settings size={20} /> },
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row dark:bg-gray-900 transition-colors duration-300">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-pink-500">CupidFlow Admin</h1>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                w-64 bg-slate-900 text-white flex flex-col fixed md:relative h-full z-40 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-800 hidden md:block">
                    <h1 className="text-2xl font-bold text-pink-500">CupidFlow</h1>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-14 md:mt-0">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
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
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                <Outlet />
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
