import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (fileBuffer, options = {}) => {
  const defaultOptions = {
    folder: 'vedzeb/profiles',
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
      (error, result) => {
        if (error) {
          reject(new AppError('Failed to upload image', 500));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) return { success: false, error: 'No publicId provided' };

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok', result };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMultipleImages = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return { success: false, error: 'No publicIds provided' };

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return { success: true, result };
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};
