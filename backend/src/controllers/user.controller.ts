import { Response } from 'express';
import { prisma } from '../index';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { uploadFileToSupabase, getFileUrl } from '../services/supabase.service';
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

export const uploadPhotoMiddleware = upload.single('photo');

export const uploadProfilePhoto = asyncHandler(async (req: any, res: Response) => {
    if (!req.file) {
        throw new AppError('No photo file provided', 400);
    }

    const userId = req.user.id;

    // Use a dedicated bucket for profile photos. 
    // Ensure 'profile-photos' bucket exists and is set to Public in Supabase dashboard for getFileUrl to work easily.
    const BUCKET_NAME = 'profile-photos';
    const filename = `user-${userId}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
    const filePath = `${filename}`;

    try {
        await uploadFileToSupabase(BUCKET_NAME, filePath, req.file.buffer, req.file.mimetype);
    } catch (error: any) {
        console.error('Supabase Upload Failed:', error);
        throw new AppError('Failed to upload profile photo. Please ensure "profile-photos" bucket exists.', 500);
    }

    // Get public URL
    const publicUrl = getFileUrl(BUCKET_NAME, filePath);

    // Update user profile
    await prisma.user.update({
        where: { id: userId },
        data: { profilePhoto: publicUrl }
    });

    res.json({
        success: true,
        message: 'Profile photo uploaded successfully',
        profilePhoto: publicUrl
    });
});
