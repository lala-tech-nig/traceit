import dotenv from 'dotenv';
dotenv.config();

/**
 * Normalizes any image URL or media path stored in MongoDB or returned by API endpoints.
 * Ensures that if the backend URL or host changes in the future, Cloudinary images
 * and media files remain 100% accessible and displayable.
 */
export const normalizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return url;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dzsa8l49w';

    // 1. If it contains Cloudinary folder 'traceit_uploads/' or public ID reference
    if (url.includes('traceit_uploads/')) {
        const match = url.match(/traceit_uploads\/([^?#]+)/);
        if (match) {
            const publicIdWithExt = match[1];
            return `https://res.cloudinary.com/${cloudName}/image/upload/traceit_uploads/${publicIdWithExt}`;
        }
    }

    // 2. If it's already a full valid Cloudinary CDN URL, return directly
    if (url.startsWith('https://res.cloudinary.com/')) {
        return url;
    }

    // 3. If it's a relative path starting with /upload/ or upload/
    if (url.startsWith('/upload/') || url.startsWith('upload/')) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
        return appUrl ? `${appUrl}${cleanPath}` : cleanPath;
    }

    // 4. If it contains an old backend host domain but points to /upload/<filename>
    if (url.includes('/upload/')) {
        const filename = url.split('/upload/')[1];
        const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
        return appUrl ? `${appUrl}/upload/${filename}` : `/upload/${filename}`;
    }

    return url;
};
