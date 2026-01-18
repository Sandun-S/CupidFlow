import { ReactNode } from 'react';
// import { useLocation } from 'react-router-dom';
import Sidebar from '../app/Sidebar';
import BottomNav from '../app/BottomNav';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    // const location = useLocation(); // Unused for now

    // Hide nav on specific pages (Login, etc) if needed, but App.tsx handles mostly routing.
    // However, MainLayout is used for /app/* routes usually.

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen sticky top-0 overflow-y-auto z-50">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 relative pb-20 md:pb-0">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav (Hidden on Desktop) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <BottomNav />
            </div>
        </div>
    );
}
