import { useEffect, useState } from 'react';
import { Check, Star, Crown, Zap, X, Copy, Upload } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { uploadImage } from '../../lib/cloudinary';

export default function UpgradePlan() {
    const { user } = useAuthStore();
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [slipImage, setSlipImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            const snap = await getDocs(collection(db, 'packages'));
            if (!snap.empty) {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Allow isActive to be undefined (default true) or explicitly true.
                // Exclude only if false.
                const activePackages = data.filter((p: any) => p.isActive !== false).sort((a: any, b: any) => a.order - b.order);
                setPackages(activePackages);
            } else {
                // Fallback if no packages in DB? Or just show empty.
            }
        };
        fetchPackages();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSlipImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!slipImage || !user || !selectedPackage) return;
        setUploading(true);

        try {
            // 1. Upload Slip
            const imageUrl = await uploadImage(slipImage, 'verification');

            // 2. Create Transaction Record
            await addDoc(collection(db, "transactions"), {
                userId: user.uid,
                userName: user.displayName || 'User',
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                amount: selectedPackage.price,
                slipUrl: imageUrl,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setIsUploadOpen(false);
            setSlipImage(null);
            setPreviewUrl('');
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload slip. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-pink-600 px-6 py-12 text-center text-white rounded-b-[3rem] shadow-xl mb-8">
                <h1 className="text-3xl font-bold mb-2">Upgrade to Premium</h1>
                <p className="opacity-90">Unlock exclusive features & find love faster</p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mx-4 mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">Your payment slip has been submitted. We will verify and upgrade your account within 24 hours.</span>
                    <button onClick={() => setSuccess(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Packages Grid */}
            <div className="px-4 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`relative rounded-3xl p-6 border-2 transition-transform hover:scale-105 ${pkg.color} ${pkg.popular ? 'shadow-2xl scale-105 z-10' : 'shadow-lg'}`}
                    >
                        {pkg.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                                Most Popular
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-2xl font-bold`}>{pkg.name}</h3>
                            {pkg.id === 'gold' && <Zap className="w-6 h-6 text-yellow-500" />}
                            {pkg.id === 'platinum' && <Crown className="w-6 h-6 text-purple-500" />}
                            {pkg.id === 'silver' && <Star className="w-6 h-6 text-gray-500" />}
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-extrabold text-gray-800">{pkg.displayPrice}</span>
                            <span className="text-gray-500 text-sm ml-1">/ {pkg.duration}</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {pkg.features.map((feature: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-gray-700">
                                    <div className="bg-white rounded-full p-1 shadow-sm">
                                        <Check size={14} className="text-green-500" />
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => {
                                setSelectedPackage(pkg);
                                setIsUploadOpen(true);
                            }}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-colors ${pkg.id === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' :
                                pkg.id === 'platinum' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600' :
                                    'bg-gray-800 hover:bg-gray-900'
                                }`}
                        >
                            Select Plan
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {isUploadOpen && selectedPackage && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Bank Transfer Details</h2>
                                <p className="text-sm text-gray-500">Pay for {selectedPackage.name} Plan</p>
                            </div>
                            <button onClick={() => setIsUploadOpen(false)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                                Use your <strong>Name</strong> or <strong>NIC</strong> as the payment reference.
                            </div>

                            {/* Bank 1 */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative group hover:border-pink-300 transition-colors">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sampath Bank PLC</h3>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-800">Wellawattha Super Branch</p>
                                    <p className="text-gray-600">H A K S Siwantha</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="bg-white px-3 py-1 rounded border text-lg font-mono font-bold text-gray-800">103652976334</code>
                                        <button onClick={() => handleCopy('103652976334')} className="text-pink-500 hover:bg-pink-50 p-1.5 rounded-md transition-colors" title="Copy">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bank 2 */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative group hover:border-pink-300 transition-colors">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Peoples Bank</h3>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-800">Battaramulla Branch</p>
                                    <p className="text-gray-600">H A K S Siwantha</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="bg-white px-3 py-1 rounded border text-lg font-mono font-bold text-gray-800">208200140047135</code>
                                        <button onClick={() => handleCopy('208200140047135')} className="text-pink-500 hover:bg-pink-50 p-1.5 rounded-md transition-colors" title="Copy">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Section */}
                            <div className="border-t pt-6">
                                <h3 className="font-bold text-gray-800 mb-4">Upload Payment Slip</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {previewUrl ? (
                                        <div className="relative h-48 w-full">
                                            <img src={previewUrl} alt="Slip" className="h-full w-full object-contain rounded-lg" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                <span className="text-white font-medium">Click to change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Upload className="w-10 h-10 text-gray-400" />
                                            <p><span className="text-pink-600 font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs">JPG, PNG (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <button
                                onClick={handleSubmit}
                                disabled={!slipImage || uploading}
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                            >
                                {uploading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Submit for Verification'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
