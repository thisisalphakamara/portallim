import { Request, Response } from 'express';
import { prisma } from '../index';

export const getFaculties = async (req: Request, res: Response) => {
    try {
        const faculties = await prisma.faculty.findMany();
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
export const getModules = async (req: Request, res: Response) => {
    const { facultyId } = req.params;
    try {
        const modules = await prisma.module.findMany({
            where: { facultyId }
        });
        res.json({ success: true, modules });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
