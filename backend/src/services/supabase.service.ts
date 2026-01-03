
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AppError } from '../middleware/error.middleware';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for backend operations

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export const uploadFileToSupabase = async (bucket: string, path: string, fileBuffer: Buffer, contentType: string) => {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(path, fileBuffer, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error('Supabase upload error details:', error);
        throw new AppError(`Failed to upload file to storage: ${error.message}`, 500);
    }

    return data;
};

export const getFileUrl = (bucket: string, path: string) => {
    const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
};

// For private buckets, create a signed URL
export const getSignedUrl = async (bucket: string, path: string, expiresIn = 3600) => {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) {
        throw new AppError(`Failed to generate signed URL: ${error.message}`, 500);
    }

    return data.signedUrl;
};

export const downloadFileFromSupabase = async (bucket: string, path: string) => {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .download(path);

    if (error) {
        throw new AppError(`Failed to download file from storage: ${error.message}`, 500);
    }

    return data; // This is a Blob/File object (in Node.js it might behave differently, check documentation)
};
