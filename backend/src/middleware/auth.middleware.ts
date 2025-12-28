import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token missing' });

    try {
        const secret = process.env.JWT_SECRET || 'your-secret';
        const decoded: any = jwt.verify(token, secret);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                faculty: true,
                program: true
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const authorizeRoles = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        next();
    };
};
