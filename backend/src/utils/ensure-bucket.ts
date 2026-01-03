
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureBucket() {
    const bucketName = 'registration-documents';
    console.log(`Checking for bucket: ${bucketName}...`);

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        process.exit(1);
    }

    const bucketExists = buckets.some(b => b.name === bucketName);

    if (!bucketExists) {
        console.log(`Bucket ${bucketName} does not exist. Creating...`);
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: false,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB
        });

        if (createError) {
            console.error('Error creating bucket:', createError);
            process.exit(1);
        }
        console.log(`Bucket ${bucketName} created successfully.`);
    } else {
        console.log(`Bucket ${bucketName} already exists.`);
    }
}

ensureBucket().catch(console.error);
