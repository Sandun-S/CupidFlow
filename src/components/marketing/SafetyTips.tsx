import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, AlertTriangle, MessageCircle, UserX } from 'lucide-react';

export default function SafetyTips() {
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
                    <Shield className="w-6 h-6 text-green-600 fill-green-600" />
                    <span className="text-xl font-bold text-gray-900">
                        Safety Centre
                    </span>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">dating safely on CupidFlow</h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Your safety is our top priority. While we verify identities, it's important to stay vigilant. Here are some meaningful tips to keep your experience safe and enjoyable.
                </p>

                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Never Send Money</h3>
                            <p className="text-gray-600">
                                Never send money or financial information to anyone you meet on the app, regardless of the reason they give. Scammers often create convincing stories. If someone asks for money, report them immediately.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Keep it on the App</h3>
                            <p className="text-gray-600">
                                Keep your conversations on CupidFlow for as long as possible. Our chat has built-in safety features. Be cautious about moving to WhatsApp or other messengers too quickly.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                            <UserX size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Report Suspicious Behavior</h3>
                            <p className="text-gray-600">
                                If someone makes you uncomfortable, is abusive, or violates our guidelines, don't hesitate to use the Report button. Your reports are anonymous and help keep the community safe.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-6 rounded-xl mt-8">
                        <h3 className="font-bold text-gray-900 mb-2">Meeting in Person?</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>Meet in a public place.</li>
                            <li>Tell a friend or family member where you are going.</li>
                            <li>Arrange your own transportation.</li>
                            <li>Trust your instincts. If something feels off, leave.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
