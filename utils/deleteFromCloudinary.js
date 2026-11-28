
import cloudinary from "../config/cloudinary.js";

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error("Image public_id is required");
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== "ok") {
            throw new Error(
                `Failed to delete image: ${result.result}`
            );
        }

        return result;
    } catch (error) {
        throw new Error(`Cloudinary deletion error: ${error.message}`);
    }
};

export default deleteFromCloudinary;
