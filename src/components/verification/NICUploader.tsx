import { useState, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { uploadImage } from '../../lib/cloudinary';

interface NICUploaderProps {
    label: string;
    onUpload: (url: string) => void;
    type: "verification" | "public"; // "verification" for NIC, "public" for profile pics
    initialUrl?: string;
    minimal?: boolean;
}

export default function NICUploader({ label, onUpload, type, initialUrl, minimal = false }: NICUploaderProps) {
    const [image, setImage] = useState<string | null>(initialUrl || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const url = await uploadImage(file, type);
            onUpload(url);
        } catch (error) {
            alert("Upload failed. Please try again.");
            setImage(null);
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`flex flex-col items-center justify-center transition-colors ${minimal ? 'w-full h-full' : 'border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-white'}`}>
            {!minimal && <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>}

            {image ? (
                <div className={`relative w-full ${minimal ? 'h-full' : 'aspect-video'} rounded-md overflow-hidden bg-black`}>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        onClick={clearImage}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                            Uploading...
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-4 w-full h-full items-center justify-center">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 ${minimal ? 'w-full h-full justify-center' : ''}`}
                    >
                        {/* If minimal, maybe Show nothing or just trigger area? EditProfile handles the icon overlay. 
                             But NICUploader handles the click. 
                             Let's make NICUploader invisible trigger in minimal mode if needed, 
                             OR just assume NICUploader controls the trigger.
                             In EditProfile we added an overlay with Camera icon.
                             So here, if minimal, we should make the button fill the area and maybe be invisible opacity?
                             Or just minimal UI.
                          */}
                        {!minimal && <Upload className="h-8 w-8" />}
                        {!minimal && <span className="text-xs">Upload</span>}
                        {minimal && <div className="w-full h-full absolute inset-0" />} {/* Click target */}
                    </button>

                    {/* Camera button only for non-minimal */}
                    {!minimal && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600"
                        >
                            <Camera className="h-8 w-8" />
                            <span className="text-xs">Camera</span>
                        </button>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
