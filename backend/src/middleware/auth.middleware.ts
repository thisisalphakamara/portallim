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

    console.log('Auth header:', authHeader ? 'present' : 'missing');
    console.log('Token extracted:', token ? 'present' : 'missing');
    console.log('Token length:', token?.length || 0);

    if (!token) return res.status(401).json({ error: 'Access token missing' });

    try {
        const secret = process.env.JWT_SECRET || 'your-secret';
        console.log('JWT secret exists:', !!secret);
        
        const decoded: any = jwt.verify(token, secret);
        console.log('Token decoded successfully, user ID:', decoded.id);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                faculty: true,
                program: true
            }
        });

        if (!user) {
            console.log('User not found for ID:', decoded.id);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User authenticated:', user.fullName);
        req.user = user;
        next();
    } catch (err) {
        console.log('Token verification failed:', err);
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
