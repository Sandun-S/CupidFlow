import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Users, Globe, Award } from 'lucide-react';

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="font-sans text-gray-800 bg-white min-h-screen">
            <nav className="p-6 max-w-7xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Home
                </button>
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                        CupidFlow
                    </span>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
                    Connecting Sri Lankans, <br />
                    <span className="text-pink-600">One Heart at a Time.</span>
                </h1>

                <p className="text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    CupidFlow was born out of a simple mission: to create a safe, modern, and verified platform for Sri Lankans to find meaningful connections. We believe love knows no boundaries, but it deserves a safe space to bloom.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-pink-50 p-6 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
                        <p className="text-gray-600">We prioritize building a respectful community of genuine people.</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                            <Award size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Profiles</h3>
                        <p className="text-gray-600">Our strict NIC verification ensures you're talking to real people.</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Sri Lankan Spirit</h3>
                        <p className="text-gray-600">Designed with our unique culture and values in mind.</p>
                    </div>
                </div>

                <div className="prose prose-lg mx-auto text-gray-600">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                    <p className="mb-6">
                        Launched in 2024, CupidFlow started as a response to the growing need for a reliable dating platform in Sri Lanka. Traditional matchmaking can be restrictive, and international apps often lack local context or safety measures. CupidFlow bridges this gap.
                    </p>
                    <p>
                        Whether you are looking for marriage, a serious relationship, or simply to meet new people, CupidFlow provides the tools and environment to do so with confidence.
                    </p>
                </div>
            </div>

            <footer className="bg-gray-50 py-8 text-center text-gray-500 text-sm">
                © 2024 CupidFlow. Made with ❤️ in Sri Lanka.
            </footer>
        </div>
    );
}
