import cloudinary from '../../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { Request } from 'express';

export const uploadImage = async (file?: Request['file']): Promise<string> => {
    if (!file) {
        throw new Error('No file uploaded');
    }

    try {
        const result: UploadApiResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'profile_pictures',
                    allowed_formats: ['jpg', 'png', 'jpeg'],
                    transformation: [
                        { width: 500, height: 500, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                },
                (error: any, result:any) => {
                    if (error) reject(error);
                    else resolve(result!);
                }
            ).end(file.buffer);
        });

        return result.secure_url;
    } catch (error) {
        throw new Error('Failed to upload image to Cloudinary');
    }
};
