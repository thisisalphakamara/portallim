
import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
    console.log('--- Email Configuration Test ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    // Don't show full password, just presence or length
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? `[Present, length: ${process.env.EMAIL_APP_PASSWORD.length}]` : '[Missing]');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '587');
    console.log('-------------------------------');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error('ERROR: EMAIL_USER or EMAIL_APP_PASSWORD variables are missing in .env file.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD.replace(/\s/g, ''), // Sanitize spaces
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully! ✅');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"Limkokwing Portal Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Limkokwing Portal - Diagnostic Test',
            text: 'If you receive this, the email configuration is working correctly.',
            html: '<h3>Email Test Successful</h3><p>Your email configuration is correct.</p>'
        });

        console.log('Email sent successfully! 🚀');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ FAILED to send email:');
        console.error(error);
    }
}

testEmail();
