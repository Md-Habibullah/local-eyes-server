// import multer from "multer"
// import path from "path"
// import { v2 as cloudinary } from 'cloudinary';
// import config from "../config";
// import fs from 'fs';

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(process.cwd(), '/uploads'))
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// });

// async function uploadToCloudinary(file: Express.Multer.File) {
//     // Configuration
//     cloudinary.config({
//         cloud_name: config.cloudinary.cloud_name,
//         api_key: config.cloudinary.api_key,
//         api_secret: config.cloudinary.api_secret
//     });

//     // Upload an image
//     const uploadResult = await cloudinary.uploader
//         .upload(
//             file.path, {
//             public_id: `${file.originalname}-${Date.now()}`,
//         }
//         )
//         .catch((error) => {
//             throw error;
//         });
//     fs.unlinkSync(file.path);

//     return uploadResult;

//     // // Optimize delivery by resizing and applying auto-format and auto-quality
//     // const optimizeUrl = cloudinary.url(`${uploadResult?.public_id}`, {
//     //     fetch_format: 'auto',
//     //     quality: 'auto'
//     // });

//     // console.log(optimizeUrl);

//     // // Transform the image: auto-crop to square aspect_ratio
//     // const autoCropUrl = cloudinary.url(`${uploadResult?.public_id}`, {
//     //     crop: 'auto',
//     //     gravity: 'auto',
//     //     width: 500,
//     //     height: 500,
//     // });

//     // console.log(autoCropUrl);
// };

// const upload = multer({ storage: storage });

// export const fileUploader = {
//     upload,
//     uploadToCloudinary
// }

import multer from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "../config";

// Cloudinary config
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload buffer to Cloudinary
const uploadToCloudinary = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: `${file.originalname}-${Date.now()}`,
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result as UploadApiResponse);
            }
        );

        uploadStream.end(file.buffer);
    });
};

export const fileUploader = {
    upload,
    uploadToCloudinary,
};
