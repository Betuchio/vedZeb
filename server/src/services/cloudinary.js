import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.js';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary config:', {
  cloud_name: cloudName,
  api_key: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET',
  api_secret: apiSecret ? `${apiSecret.substring(0, 4)}...` : 'NOT SET'
});

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Detect MIME type from buffer magic bytes
const detectMimeType = (buffer) => {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }
  // Default to jpeg if unknown
  return 'image/jpeg';
};

export const uploadImage = async (fileBuffer, options = {}) => {
  const defaultOptions = {
    folder: 'vedzeb/profiles',
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]
  };

  try {
    // Detect MIME type from buffer and convert to base64 data URI
    const mimeType = detectMimeType(fileBuffer);
    const base64String = fileBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      ...defaultOptions,
      ...options
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message || error);
    console.error('Cloudinary error details:', JSON.stringify(error, null, 2));
    throw new AppError(`Failed to upload image: ${error.message || 'Unknown error'}`, 500);
  }
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
