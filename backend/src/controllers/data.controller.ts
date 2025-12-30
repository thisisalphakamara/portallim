import { Request, Response } from 'express';
import { prisma } from '../index';

const ALLOWED_FACULTIES = [
    'Faculty of Information & Communication Technology (FICT)',
    'Faculty of Architecture & The Built Environment (FABE)',
    'Faculty of Communication, Media & Broadcasting (FCMB)'
];

export const getFaculties = async (req: Request, res: Response) => {
    try {
        const faculties = await prisma.faculty.findMany({
            where: {
                name: { in: ALLOWED_FACULTIES }
            }
        });
        res.json({ success: true, faculties });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPrograms = async (req: Request, res: Response) => {
    const { facultyId } = req.params;
    try {
        const programs = await prisma.program.findMany({
            where: { facultyId }
        });
        res.json({ success: true, programs });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get modules for a given semester and year level.
 * 
 * IMPORTANT (MVP behaviour):
 * - Modules are shared across all faculties/programs.
 * - We therefore DO NOT filter by faculty – only by semester/yearLevel.
 * - This ensures every student sees the same module set per semester.
 */
export const getModules = async (req: Request, res: Response) => {
    const { semester, yearLevel } = req.query;

    try {
        const whereClause: any = {};

        if (semester) {
            const semesterNum = parseInt(semester as string, 10);
            if (!isNaN(semesterNum)) {
                whereClause.semester = semesterNum;
            }
        }

        if (yearLevel) {
            const yearLevelNum = parseInt(yearLevel as string, 10);
            if (!isNaN(yearLevelNum)) {
                whereClause.yearLevel = yearLevelNum;
            }
        }

        const modules = await prisma.module.findMany({
            where: whereClause,
            orderBy: [
                { semester: 'asc' },
                { name: 'asc' }
            ]
        });

        res.json({ success: true, modules });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
