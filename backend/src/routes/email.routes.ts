import { Router } from 'express';
import { emailService } from '../services/email.service';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Test email endpoint (for development/testing)
router.post('/test', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        if (!to || !subject || !message) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, subject, message' 
            });
        }

        const success = await emailService.sendEmail(
            to,
            subject,
            `<p>${message}</p>`,
            message
        );

        if (success) {
            res.json({ 
                success: true, 
                message: 'Test email sent successfully' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send test email' 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Test registration submission email
router.post('/test-registration', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), async (req, res) => {
    try {
        const { to } = req.body;
        
        if (!to) {
            return res.status(400).json({ 
                error: 'Missing required field: to' 
            });
        }

        const success = await emailService.sendRegistrationSubmissionNotification(
            to,
            'Test Student',
            'Faculty of Design',
            'Bachelor of Design',
            'Semester 1',
            'Year 1'
        );

        if (success) {
            res.json({ 
                success: true, 
                message: 'Registration submission test email sent successfully' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send registration submission test email' 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Test approval email
router.post('/test-approval', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), async (req, res) => {
    try {
        const { to } = req.body;
        
        if (!to) {
            return res.status(400).json({ 
                error: 'Missing required field: to' 
            });
        }

        const success = await emailService.sendApprovalNotification(
            to,
            'Test Student',
            'John Doe',
            'Year Leader',
            'Year Leader',
            'Finance Department'
        );

        if (success) {
            res.json({ 
                success: true, 
                message: 'Approval test email sent successfully' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send approval test email' 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Test final approval email
router.post('/test-final-approval', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), async (req, res) => {
    try {
        const { to } = req.body;
        
        if (!to) {
            return res.status(400).json({ 
                error: 'Missing required field: to' 
            });
        }

        const success = await emailService.sendFinalApprovalNotification(
            to,
            'Test Student',
            'Faculty of Design',
            'Bachelor of Design',
            'Semester 1',
            'Year 1'
        );

        if (success) {
            res.json({ 
                success: true, 
                message: 'Final approval test email sent successfully' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send final approval test email' 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Test rejection email
router.post('/test-rejection', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), async (req, res) => {
    try {
        const { to, comments } = req.body;
        
        if (!to) {
            return res.status(400).json({ 
                error: 'Missing required field: to' 
            });
        }

        const success = await emailService.sendRejectionNotification(
            to,
            'Test Student',
            'Jane Smith',
            'Finance Department',
            comments || 'Please contact the finance office to resolve payment issues.'
        );

        if (success) {
            res.json({ 
                success: true, 
                message: 'Rejection test email sent successfully' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send rejection test email' 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Test student credentials email
router.post('/test-student-credentials', authenticateToken, authorizeRoles(Role.SYSTEM_ADMIN), async (req, res) => {
    try {
        const { to } = req.body;
        
        if (!to) {
            return res.status(400).json({ 
                error: 'Missing required field: to' 
            });
        }

        const success = await emailService.sendStudentAccountCredentials(
            to,
            'Test Student',
            'STU2024001',
            'TempPass123!',
            'Faculty of Design',
            'Bachelor of Design'
        );

        if (success) {
            res.json({ 
                success: true, 
                message: 'Student credentials test email sent successfully' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send student credentials test email' 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

export default router;
