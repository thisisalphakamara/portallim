import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { ALL_MODULES } from '../src/constants/modules';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    const ALLOWED_FACULTIES = [
        'Faculty of Information & Communication Technology (FICT)',
        'Faculty of Architecture & The Built Environment (FABE)',
        'Faculty of Communication, Media & Broadcasting (FCMB)'
    ];

    // 1. Clean up faculty data that should no longer be used
    const unwantedFaculties = await prisma.faculty.findMany({
        where: {
            name: {
                notIn: ALLOWED_FACULTIES
            }
        }
    });
    const unwantedIds = unwantedFaculties.map(f => f.id);

    if (unwantedIds.length > 0) {
        const programsToDelete = await prisma.program.findMany({
            where: { facultyId: { in: unwantedIds } },
            select: { id: true }
        });
        const programIds = programsToDelete.map(p => p.id);

        const submissionsToDelete = await prisma.submission.findMany({
            where: { facultyId: { in: unwantedIds } },
            select: { id: true }
        });
        const submissionIds = submissionsToDelete.map(s => s.id);

        if (submissionIds.length > 0) {
            await prisma.approvalLog.deleteMany({ where: { submissionId: { in: submissionIds } } });
            await prisma.submission.deleteMany({ where: { id: { in: submissionIds } } });
        }

        if (programIds.length > 0) {
            await prisma.user.updateMany({
                where: { programId: { in: programIds } },
                data: { programId: null }
            });
        }

        await prisma.user.updateMany({
            where: { facultyId: { in: unwantedIds } },
            data: { facultyId: null }
        });

        await prisma.module.deleteMany({ where: { facultyId: { in: unwantedIds } } });
        await prisma.program.deleteMany({ where: { id: { in: programIds } } });
        await prisma.faculty.deleteMany({ where: { id: { in: unwantedIds } } });
    }

    // 2. Create Faculties
    const faculties = ALLOWED_FACULTIES.map(name => ({ name }));

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
        'Faculty of Information & Communication Technology (FICT)': [
            'Information Technology (BIT)',
            'Software Engineering with Multimedia (BSEM)',
            'Business Information Technology (BBIT)',
            'Information and Communication Technology (BICT)',
            'Mobile Computing',
            'Cloud Computing Technology'
        ],
        'Faculty of Architecture & The Built Environment (FABE)': [
            'Architectural Studies',
            'Interior Architecture',
            'Landscape Architecture',
            'Construction Management',
            'Architectural Technology',
            'Interior Design'
        ],
        'Faculty of Communication, Media & Broadcasting (FCMB)': [
            'Broadcasting and Journalism',
            'Professional Communication',
            'Digital Film and Television',
            'Event Management',
            'Public Relations',
            'Journalism and Media',
            'Broadcasting (Radio & TV)'
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

    // Seed modules for all faculties (MVP: same modules for all faculties)
    // Since this is an MVP, we'll use the same modules for all faculties
    console.log('Seeding modules for all faculties...');
    
    for (const facultyName of ALLOWED_FACULTIES) {
        const facultyId = facultyIdMap[facultyName];
        if (!facultyId) continue;

        // Delete existing modules for this faculty
        await prisma.module.deleteMany({ where: { facultyId } });

        // Create all modules for this faculty
        for (const moduleData of ALL_MODULES) {
            await prisma.module.upsert({
                where: { code: moduleData.code },
                update: {
                    name: moduleData.name,
                    credits: moduleData.credits,
                    semester: moduleData.semester,
                    yearLevel: moduleData.yearLevel,
                    facultyId
                },
                create: {
                    name: moduleData.name,
                    code: moduleData.code,
                    credits: moduleData.credits,
                    semester: moduleData.semester,
                    yearLevel: moduleData.yearLevel,
                    facultyId
                }
            });
        }
    }
    
    console.log(`Seeded ${ALL_MODULES.length} modules for each faculty.`);

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

    const existingUser = await prisma.user.findFirst({
        where: { email: adminEmail }
    });

    if (existingUser) {
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                supabaseId: supabaseUser?.id
            }
        });
    } else {
        await prisma.user.create({
            data: {
                email: adminEmail,
                fullName: 'System Administrator',
                role: Role.SYSTEM_ADMIN,
                isFirstLogin: false,
                supabaseId: supabaseUser?.id
            }
        });
    }

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
