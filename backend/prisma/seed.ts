import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Clean up legacy faculty data that should no longer be used
    const legacyFacultyNames = ['Faculty of Information Technology', 'Faculty of Business Management'];
    const legacyFaculties = await prisma.faculty.findMany({
        where: {
            name: {
                in: legacyFacultyNames
            }
        }
    });
    const legacyFacultyIds = legacyFaculties.map(f => f.id);

    if (legacyFacultyIds.length > 0) {
        await prisma.module.deleteMany({ where: { facultyId: { in: legacyFacultyIds } } });
        await prisma.program.deleteMany({ where: { facultyId: { in: legacyFacultyIds } } });
        await prisma.faculty.deleteMany({ where: { id: { in: legacyFacultyIds } } });
    }

    // 2. Create Faculties
    const faculties = [
        { name: 'Faculty of Design Innovation' },
        { name: 'Faculty of Information & Communication Technology' },
        { name: 'Faculty of Business Management & Globalisation' },
        { name: 'Faculty of Communication, Media & Broadcasting' },
        { name: 'Faculty of Architecture & The Built Environment' },
        { name: 'Faculty of Multimedia Creativity' },
        { name: 'Faculty of Fashion & Lifestyle Creativity' }
    ];

    for (const f of faculties) {
        await prisma.faculty.upsert({
            where: { name: f.name },
            update: {},
            create: f
        });
    }

    const facultyRecords = await prisma.faculty.findMany({
        where: {
            name: {
                in: faculties.map(f => f.name)
            }
        }
    });

    const facultyIdMap: Record<string, string> = {};
    facultyRecords.forEach(f => {
        facultyIdMap[f.name] = f.id;
    });

    const programsByFaculty: Record<string, string[]> = {
        'Faculty of Design Innovation': [
            'Professional Design (Visual Communication)',
            'Industrial Design',
            'Brand Packaging Design',
            'Product Design & Innovation',
            'Graphic Design',
            'Product Design',
            'Packaging Design & Technology'
        ],
        'Faculty of Information & Communication Technology': [
            'Information Technology (BIT)',
            'Software Engineering with Multimedia (BSEM)',
            'Business Information Technology (BBIT)',
            'Information and Communication Technology (BICT)',
            'Mobile Computing',
            'Cloud Computing Technology'
        ],
        'Faculty of Business Management & Globalisation': [
            'Business Administration',
            'International Business',
            'Accounting',
            'Marketing',
            'Human Resource Management',
            'Entrepreneurship'
        ],
        'Faculty of Communication, Media & Broadcasting': [
            'Broadcasting and Journalism',
            'Professional Communication',
            'Digital Film and Television',
            'Event Management',
            'Public Relations',
            'Journalism and Media',
            'Broadcasting (Radio & TV)'
        ],
        'Faculty of Architecture & The Built Environment': [
            'Architectural Studies',
            'Interior Architecture',
            'Landscape Architecture',
            'Construction Management',
            'Architectural Technology',
            'Interior Design'
        ],
        'Faculty of Multimedia Creativity': [
            'Creative Multimedia',
            'Games Design',
            'Animation',
            'Games Art Development',
            'Animation & Multimedia Design',
            'Games Art'
        ],
        'Faculty of Fashion & Lifestyle Creativity': [
            'Fashion and Retailing',
            'Fashion Design',
            'Fashion and Apparel Design',
            'Hair Design',
            'Batik Design'
        ]
    };

    for (const [facultyName, programs] of Object.entries(programsByFaculty)) {
        const facultyId = facultyIdMap[facultyName];
        if (!facultyId) continue;

        await prisma.program.deleteMany({ where: { facultyId } });

        await prisma.program.createMany({
            data: programs.map((programName) => ({
                name: programName,
                facultyId
            })),
            skipDuplicates: true
        });
    }

    const modulesToSeed = [
        { name: 'Software Engineering', code: 'ICT201', credits: 4, facultyName: 'Faculty of Information & Communication Technology' },
        { name: 'Database Systems', code: 'ICT202', credits: 4, facultyName: 'Faculty of Information & Communication Technology' },
        { name: 'Web Development', code: 'ICT203', credits: 3, facultyName: 'Faculty of Information & Communication Technology' },
        { name: 'Marketing Strategy', code: 'BBMG401', credits: 4, facultyName: 'Faculty of Business Management & Globalisation' },
        { name: 'Corporate Finance', code: 'BBMG402', credits: 4, facultyName: 'Faculty of Business Management & Globalisation' },
        { name: 'Business Ethics', code: 'BBMG403', credits: 3, facultyName: 'Faculty of Business Management & Globalisation' }
    ];

    for (const module of modulesToSeed) {
        const facultyId = facultyIdMap[module.facultyName];
        if (!facultyId) continue;

        await prisma.module.upsert({
            where: { code: module.code },
            update: {},
            create: {
                name: module.name,
                code: module.code,
                credits: module.credits,
                facultyId
            }
        });
    }

    // 3. Create System Admin in Supabase Auth and DB
    const adminEmail = 'system.admin@limkokwing.edu.sl';
    const adminPassword = 'Project26';

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Ensuring System Admin exists in Auth...');

    // Check if user exists in Auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    let supabaseUser = users?.users?.find((u: any) => u.email === adminEmail);

    if (!supabaseUser) {
        console.log('Creating System Admin in Supabase Auth...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { fullName: 'System Administrator', role: Role.SYSTEM_ADMIN }
        });

        if (createError) {
            console.error('Error creating admin in Auth:', createError.message);
        } else {
            supabaseUser = newUser.user;
        }
    }

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            supabaseId: supabaseUser?.id
        },
        create: {
            email: adminEmail,
            fullName: 'System Administrator',
            role: Role.SYSTEM_ADMIN,
            isFirstLogin: false,
            supabaseId: supabaseUser?.id
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
