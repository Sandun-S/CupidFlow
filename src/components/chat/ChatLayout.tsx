import { Outlet, useLocation } from 'react-router-dom';
import ChatList from './ChatList';

export default function ChatLayout() {
    // Check if we are on the base /app/chat route (no specific chat selected)
    const location = useLocation();
    const isRoot = location.pathname === '/app/chat' || location.pathname === '/app/chat/';

    return (
        <div className="flex h-[calc(100vh-80px)] md:h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
            {/* Left Pane: Chat List */}
            {/* On Mobile: Show if isRoot. Hide if chatting. */}
            {/* On Desktop: Always Show (w-1/3 or w-80) */}
            <div className={`
                flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                w-full md:w-80 lg:w-96
                ${!isRoot ? 'hidden md:flex' : 'flex'}
                flex-col
            `}>
                <ChatList />
            </div>

            {/* Right Pane: Chat Window (Outlet) */}
            {/* On Mobile: Show if NOT isRoot. */}
            {/* On Desktop: Always Show. If Root, show placeholder. */}
            <div className={`
                flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 relative
                ${isRoot ? 'hidden md:flex' : 'flex'}
            `}>
                {isRoot ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mb-6 dark:bg-pink-900/20">
                            <img src="/logo-icon.png" className="w-16 h-16 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                            {/* Fallback icon if image fails or generic */}
                            <span className="text-4xl">💌</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-white">Your Messages</h2>
                        <p className="text-gray-500 max-w-xs dark:text-gray-400">
                            Select a match from the left to start chatting.
                            Don't forget to break the ice!
                        </p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
}
