
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "product",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export default uploadToCloudinary;
 