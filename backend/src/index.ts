import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { errorHandler, notFound } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import registrarRoutes from './routes/registrar.routes';
import registrationRoutes from './routes/registration.routes';
import dataRoutes from './routes/data.routes';
import emailRoutes from './routes/email.routes';
import documentRoutes from './routes/document.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';

import settingsRoutes from './routes/settings.routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://portallim.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow all origins for development
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/registrar', registrarRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/registrations', documentRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { prisma };
