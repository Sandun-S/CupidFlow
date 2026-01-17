import { useNavigate, Link } from 'react-router-dom';
import { Heart, Shield, CheckCircle, ArrowRight, Smartphone, Globe } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="font-sans text-gray-800 bg-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                        CupidFlow
                    </span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-pink-600 font-bold hover:bg-pink-50 rounded-full transition-colors"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="px-6 py-2 bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 hover:shadow-lg transition-all"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden py-16 sm:py-24 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left z-10">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-pink-100 text-pink-700 text-sm font-bold tracking-wide uppercase">
                            #1 Dating App in Sri Lanka
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                            Find Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                                Perfect Match
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            Join thousands of verified Sri Lankans finding meaningful connections every day. Safe, secure, and designed for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                Start Matching Now <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-bold rounded-full hover:bg-gray-50 transition-all"
                            >
                                I have an account
                            </button>
                        </div>
                        <div className="mt-8 flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                            <CheckCircle size={16} className="text-green-500" /> No credit card required to join
                            <span className="mx-2">•</span>
                            <CheckCircle size={16} className="text-green-500" /> 100% Verified Profiles
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        {/* Abstract blobs background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                        {/* Placeholder for App Screen Image - Using a CSS mockup for now */}
                        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                                {/* Simulated App UI */}
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1621784563330-caee0b138a00?q=80&w=1887&auto=format&fit=crop)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                                    <div className="absolute bottom-6 left-4 right-4 text-white">
                                        <h3 className="text-2xl font-bold">Shenaya, 24</h3>
                                        <p className="text-sm opacity-90 mb-4">Colombo, Sri Lanka</p>
                                        <div className="flex justify-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-lg">
                                                <span className="text-2xl font-bold">✕</span>
                                            </div>
                                            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <Heart fill="white" size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats/Trust Section */}
            <section className="bg-gray-50 py-12 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-pink-600 mb-1">10k+</div>
                        <div className="text-gray-600 font-medium">Active Users</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">5k+</div>
                        <div className="text-gray-600 font-medium">Matches Made</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
                        <div className="text-gray-600 font-medium">Verified Profiles</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-green-600 mb-1">4.8/5</div>
                        <div className="text-gray-600 font-medium">User Rating</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose CupidFlow?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">We're not just another dating app. We're building a community based on trust, respect, and real connections.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow border border-pink-50">
                        <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Safe & Secure</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Every profile is manually verified via NIC. Say goodbye to catfishes and fake profiles. Your safety is our #1 priority.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow border border-purple-50">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Modern Experience</h3>
                        <p className="text-gray-600 leading-relaxed">
                            A smooth, premium app experience designed for 2024. Swipe, match, and chat with an intuitive interface.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow border border-blue-50">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Local Focus</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Built specifically for Sri Lanka. Filter by district, religion, and cultural preferences that matter to you.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gray-900 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-gray-400">Finding love shouldn't be complicated.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-700 -z-0"></div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-pink-500 shadow-xl">1</div>
                            <h3 className="text-xl font-bold mb-2">Create Profile</h3>
                            <p className="text-gray-400 px-4">Sign up and verify your identity with your NIC for a trusted badge.</p>
                        </div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-purple-500 shadow-xl">2</div>
                            <h3 className="text-xl font-bold mb-2">Swipe & Match</h3>
                            <p className="text-gray-400 px-4">Browse profiles in your area. Swipe right to like, left to pass.</p>
                        </div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-blue-500 shadow-xl">3</div>
                            <h3 className="text-xl font-bold mb-2">Start Chatting</h3>
                            <p className="text-gray-400 px-4">It's a match! Start a conversation and see where it goes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-pink-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to find love?</h2>
                        <p className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto">
                            Don't wait another day. Join the fastest growing dating community in Sri Lanka today.
                        </p>
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="bg-white text-pink-600 text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            Create Free Account
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-100 py-12 px-6 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-pink-600 p-1.5 rounded-lg">
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">CupidFlow</span>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-gray-600">
                        <Link to="/about" className="hover:text-pink-600 transition-colors">About Us</Link>
                        <Link to="/safety" className="hover:text-pink-600 transition-colors">Safety Tips</Link>
                        <Link to="/terms" className="hover:text-pink-600 transition-colors">Terms</Link>
                        <Link to="/privacy" className="hover:text-pink-600 transition-colors">Privacy</Link>
                    </div>

                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} CupidFlow. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
