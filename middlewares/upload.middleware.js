
import multer from "multer";

// Store uploaded files in memory as Buffers
const storage = multer.memoryStorage();

// Allow only supported image formats
const fileFilter = (req, file, callback) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(
            new Error("Only JPEG, JPG, PNG, and WEBP images are allowed"),
            false
        );
    }
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
});

// Accept up to 5 images from the "images" field
const uploadImages = upload.array("images", 5);

export default uploadImages;
