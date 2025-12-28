import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Create Faculties
    const faculties = [
        { name: 'Faculty of Information Technology' },
        { name: 'Faculty of Business Management' },
        { name: 'Faculty of Design Innovation' },
        { name: 'Faculty of Multimedia Creativity' }
    ];

    for (const f of faculties) {
        await prisma.faculty.upsert({
            where: { name: f.name },
            update: {},
            create: f
        });
    }

    const itFaculty = await prisma.faculty.findUnique({ where: { name: 'Faculty of Information Technology' } });
    const bizFaculty = await prisma.faculty.findUnique({ where: { name: 'Faculty of Business Management' } });

    // 2. Create Programs
    if (itFaculty) {
        await prisma.program.createMany({
            data: [
                { name: 'BSc in Software Engineering', facultyId: itFaculty.id },
                { name: 'BSc in Computer Science', facultyId: itFaculty.id }
            ],
            skipDuplicates: true
        });
    }

    if (bizFaculty) {
        await prisma.program.createMany({
            data: [
                { name: 'BA in Business Management', facultyId: bizFaculty.id },
                { name: 'BA in Accounting', facultyId: bizFaculty.id }
            ],
            skipDuplicates: true
        });
    }

    // 2.5 Create Modules
    const itModules = [
        { name: 'Software Engineering', code: 'BIT201', credits: 4, facultyId: itFaculty?.id! },
        { name: 'Database Systems', code: 'BIT202', credits: 4, facultyId: itFaculty?.id! },
        { name: 'Web Development', code: 'BIT203', credits: 3, facultyId: itFaculty?.id! }
    ];

    const bizModules = [
        { name: 'Marketing Strategy', code: 'BBM401', credits: 4, facultyId: bizFaculty?.id! },
        { name: 'Corporate Finance', code: 'BBM402', credits: 4, facultyId: bizFaculty?.id! },
        { name: 'Business Ethics', code: 'BBM403', credits: 3, facultyId: bizFaculty?.id! }
    ];

    for (const m of [...itModules, ...bizModules]) {
        await prisma.module.upsert({
            where: { code: m.code },
            update: {},
            create: m
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
