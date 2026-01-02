const nodemailer = require('nodemailer');
import * as nodemailerTypes from 'nodemailer';
import { AppError } from '../middleware/error.middleware';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailerTypes.Transporter | null;
  private fromEmail: string;

  constructor() {
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_APP_PASSWORD || ''
      }
    };
    this.fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || '';
    this.transporter = null;
    this.initializeTransporter();
  }

  private config: EmailConfig;

  private initializeTransporter() {
    if (!this.config.auth.user || !this.config.auth.pass) {
      console.warn('Email credentials not configured. Email service will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport(this.config);
  }

  private async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false;

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const isConnected = await this.verifyConnection();
      if (!isConnected) {
        throw new AppError('Email service connection failed', 500);
      }

      const mailOptions = {
        from: `"Limkokwing University" <${this.fromEmail}>`,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendRegistrationSubmissionNotification(
    studentEmail: string,
    studentName: string,
    faculty: string,
    program: string,
    semester: string,
    academicYear: string
  ): Promise<boolean> {
    const subject = 'Registration Submitted - Limkokwing University';
    const html = this.generateRegistrationSubmissionTemplate(
      studentName,
      faculty,
      program,
      semester,
      academicYear
    );

    return this.sendEmail(studentEmail, subject, html);
  }

  async sendApprovalNotification(
    studentEmail: string,
    studentName: string,
    approverName: string,
    approverRole: string,
    currentStage: string,
    nextStage?: string
  ): Promise<boolean> {
    const subject = `Registration Update - ${currentStage} Approved`;
    const html = this.generateApprovalNotificationTemplate(
      studentName,
      approverName,
      approverRole,
      currentStage,
      nextStage
    );

    return this.sendEmail(studentEmail, subject, html);
  }

  async sendFinalApprovalNotification(
    studentEmail: string,
    studentName: string,
    faculty: string,
    program: string,
    semester: string,
    academicYear: string
  ): Promise<boolean> {
    const subject = 'Registration Fully Approved - Limkokwing University';
    const html = this.generateFinalApprovalTemplate(
      studentName,
      faculty,
      program,
      semester,
      academicYear
    );

    return this.sendEmail(studentEmail, subject, html);
  }

  async sendStudentAccountCredentials(
    studentEmail: string,
    studentName: string,
    studentId: string,
    temporaryPassword: string,
    faculty: string,
    program: string
  ): Promise<boolean> {
    const subject = 'Your Limkokwing University Account - Login Credentials';
    const html = this.generateStudentCredentialsTemplate(
      studentName,
      studentEmail,
      studentId,
      temporaryPassword,
      faculty,
      program
    );

    return this.sendEmail(studentEmail, subject, html);
  }

  async sendRejectionNotification(
    studentEmail: string,
    studentName: string,
    rejecterName: string,
    rejecterRole: string,
    comments?: string
  ): Promise<boolean> {
    const subject = 'Registration Update - Action Required';
    const html = this.generateRejectionTemplate(
      studentName,
      rejecterName,
      rejecterRole,
      comments
    );

    return this.sendEmail(studentEmail, subject, html);
  }

  private generateRegistrationSubmissionTemplate(
    studentName: string,
    faculty: string,
    program: string,
    semester: string,
    academicYear: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Submitted</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        .details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Limkokwing University</h1>
            <p>Online Registration System</p>
        </div>
        
        <div class="content">
            <h2>Registration Submitted Successfully</h2>
            <p>Dear ${studentName},</p>
            <p>Your registration for <strong>${semester} ${academicYear}</strong> has been successfully submitted and is now pending approval.</p>
            
            <div class="details">
                <h3>Registration Details:</h3>
                <p><strong>Faculty:</strong> ${faculty}</p>
                <p><strong>Program:</strong> ${program}</p>
                <p><strong>Semester:</strong> ${semester}</p>
                <p><strong>Academic Year:</strong> ${academicYear}</p>
            </div>
            
            <h3>Approval Process:</h3>
            <p>Your registration will go through the following approval stages:</p>
            <ol>
                <li>Year Leader Approval</li>
                <li>Finance Department Approval</li>
                <li>Registrar Final Approval</li>
            </ol>
            
            <p>You will receive email notifications at each stage of the approval process.</p>
            
            <p>You can check your registration status anytime by logging into the student portal.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Limkokwing University Online Registration System.</p>
            <p>For inquiries, please contact the Registrar's Office.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateApprovalNotificationTemplate(
    studentName: string,
    approverName: string,
    approverRole: string,
    currentStage: string,
    nextStage?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        .approval { background: #e8f5e8; padding: 15px; margin: 15px 0; border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Limkokwing University</h1>
            <p>Online Registration System</p>
        </div>
        
        <div class="content">
            <h2>Registration Update - Approval Received</h2>
            <p>Dear ${studentName},</p>
            
            <div class="approval">
                <h3>✓ ${currentStage} Approved</h3>
                <p>Your registration has been approved by <strong>${approverName}</strong> (${approverRole}).</p>
            </div>
            
            ${nextStage ? `
            <h3>Next Stage:</h3>
            <p>Your registration is now pending <strong>${nextStage}</strong> approval.</p>
            <p>You will receive another email notification when this stage is completed.</p>
            ` : ''}
            
            <p>You can check your registration status anytime by logging into the student portal.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Limkokwing University Online Registration System.</p>
            <p>For inquiries, please contact the Registrar's Office.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateFinalApprovalTemplate(
    studentName: string,
    faculty: string,
    program: string,
    semester: string,
    academicYear: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Fully Approved</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        .approved { background: #e8f5e8; padding: 15px; margin: 15px 0; border-left: 4px solid #4caf50; }
        .details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Limkokwing University</h1>
            <p>Online Registration System</p>
        </div>
        
        <div class="content">
            <h2>🎉 Registration Fully Approved!</h2>
            <p>Dear ${studentName},</p>
            
            <div class="approved">
                <h3>Congratulations!</h3>
                <p>Your registration for <strong>${semester} ${academicYear}</strong> has been fully approved by all departments.</p>
                <p>You are now officially registered for the upcoming semester.</p>
            </div>
            
            <div class="details">
                <h3>Registration Details:</h3>
                <p><strong>Faculty:</strong> ${faculty}</p>
                <p><strong>Program:</strong> ${program}</p>
                <p><strong>Semester:</strong> ${semester}</p>
                <p><strong>Academic Year:</strong> ${academicYear}</p>
            </div>
            
            <p>We wish you a successful academic semester!</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Limkokwing University Online Registration System.</p>
            <p>For inquiries, please contact the Registrar's Office.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateRejectionTemplate(
    studentName: string,
    rejecterName: string,
    rejecterRole: string,
    comments?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Update - Action Required</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        .rejection { background: #ffeaea; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
        .comments { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Limkokwing University</h1>
            <p>Online Registration System</p>
        </div>
        
        <div class="content">
            <h2>Registration Update - Action Required</h2>
            <p>Dear ${studentName},</p>
            
            <div class="rejection">
                <h3>❌ Registration Requires Attention</h3>
                <p>Your registration has been reviewed by <strong>${rejecterName}</strong> (${rejecterRole}) and requires action.</p>
            </div>
            
            ${comments ? `
            <div class="comments">
                <h3>Comments:</h3>
                <p>${comments}</p>
            </div>
            ` : ''}
            
            <h3>Next Steps:</h3>
            <p>Please contact the relevant department to address the issues with your registration:</p>
            <ul>
                <li>Visit the Registrar's Office for assistance</li>
                <li>Call the student helpline for guidance</li>
                <li>Log into the student portal to review your registration details</li>
            </ul>
            
            <p>It's important to resolve these issues promptly to ensure your registration is processed correctly.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Limkokwing University Online Registration System.</p>
            <p>For inquiries, please contact the Registrar's Office.</p>
        </div>
    </div>
</body>
</html>`;
  }

  async sendDocumentWithAttachment(
    to: string,
    documentName: string,
    filePath: string,
    studentName?: string
  ): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const isConnected = await this.verifyConnection();
      if (!isConnected) {
        throw new AppError('Email service connection failed', 500);
      }

      const subject = `Registration Confirmation Slip - ${documentName}`;
      const html = this.generateDocumentEmailTemplate(studentName || 'Student', documentName);

      const mailOptions = {
        from: `"Limkokwing University" <${this.fromEmail}>`,
        to,
        subject,
        html,
        attachments: [
          {
            filename: documentName,
            path: filePath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Document email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send document email:', error);
      return false;
    }
  }

  private generateDocumentEmailTemplate(studentName: string, documentName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Confirmation Slip</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        .document-info { background: #e8f5e8; padding: 15px; margin: 15px 0; border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Limkokwing University</h1>
            <p>Online Registration System</p>
        </div>
        
        <div class="content">
            <h2>Registration Confirmation Slip</h2>
            <p>Dear ${studentName},</p>
            
            <div class="document-info">
                <h3>📄 Your Registration Document</h3>
                <p>Please find your registration confirmation slip attached to this email.</p>
                <p><strong>Document:</strong> ${documentName}</p>
            </div>
            
            <h3>Important Information:</h3>
            <ul>
                <li>This document confirms your successful registration for the current semester</li>
                <li>Please keep this document for your records</li>
                <li>You may be required to present this document for various university services</li>
                <li>If you have any questions, please contact the Registrar's Office</li>
            </ul>
            
            <p>You can also download this document anytime from the student portal.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Limkokwing University Online Registration System.</p>
            <p>For inquiries, please contact the Registrar's Office.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateStudentCredentialsTemplate(
    studentName: string,
    studentEmail: string,
    studentId: string,
    temporaryPassword: string,
    faculty: string,
    program: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Limkokwing University Account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        .credentials { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
        .credentials table { width: 100%; border-collapse: collapse; }
        .credentials td { padding: 8px; border-bottom: 1px solid #ddd; }
        .credentials td:first-child { font-weight: bold; width: 40%; }
        .login-btn { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; margin: 15px 0; }
        .important { background: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Limkokwing University</h1>
            <p>Online Registration System</p>
        </div>
        
        <div class="content">
            <h2>Welcome to Limkokwing University!</h2>
            <p>Dear ${studentName},</p>
            <p>Your student account has been successfully created by the Registrar's Office. You can now access the Limkokwing University Online Registration System.</p>
            
            <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <table>
                    <tr>
                        <td>Email Address:</td>
                        <td>${studentEmail}</td>
                    </tr>
                    <tr>
                        <td>Student ID:</td>
                        <td>${studentId}</td>
                    </tr>
                    <tr>
                        <td>Temporary Password:</td>
                        <td><strong>${temporaryPassword}</strong></td>
                    </tr>
                    <tr>
                        <td>Faculty:</td>
                        <td>${faculty}</td>
                    </tr>
                    <tr>
                        <td>Program:</td>
                        <td>${program}</td>
                    </tr>
                </table>
            </div>
            
            <div class="important">
                <h3>⚠️ Important Security Notice</h3>
                <p><strong>You will be required to change your password on your first login.</strong></p>
                <p>Please choose a strong password that includes:</p>
                <ul>
                    <li>At least 8 characters</li>
                    <li>Both uppercase and lowercase letters</li>
                    <li>At least one number</li>
                    <li>At least one special character (!@#$%^&*)</li>
                </ul>
            </div>
            
            <h3>🚀 Getting Started</h3>
            <p>Follow these steps to access your account:</p>
            <ol>
                <li>Visit the Limkokwing University Registration Portal</li>
                <li>Enter your email address and temporary password</li>
                <li>Set your new permanent password</li>
                <li>Complete your profile information</li>
                <li>Submit your semester registration</li>
            </ol>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="#" class="login-btn">Access Student Portal</a>
            </div>
            
            <h3>📚 What You Can Do</h3>
            <p>Once logged in, you can:</p>
            <ul>
                <li>Register for your courses each semester</li>
                <li>Track your registration approval status</li>
                <li>View your academic profile</li>
                <li>Receive important notifications</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact the Registrar's Office.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Limkokwing University Online Registration System.</p>
            <p>For inquiries, please contact the Registrar's Office or IT Support.</p>
            <p><strong>Keep your login credentials secure and never share them with anyone.</strong></p>
        </div>
    </div>
</body>
</html>`;
  }
}

export const emailService = new EmailService();
