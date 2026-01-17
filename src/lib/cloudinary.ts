const CLOUD_NAME = "dfchtnulo";
const UPLOAD_PRESET_PUBLIC = "cupidflow_public";
const UPLOAD_PRESET_VERIFICATION = "cupidflow_verification";

export const uploadImage = async (file: File, type: "public" | "verification"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", type === "public" ? UPLOAD_PRESET_PUBLIC : UPLOAD_PRESET_VERIFICATION);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Image upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};
