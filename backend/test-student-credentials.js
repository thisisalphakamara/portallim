const nodemailer = require('nodemailer');

// Test student credentials email template
const emailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'limkokwing.portal.sl@gmail.com',
        pass: 'fhqq fzni lmts gjzm'
    }
};

const generateStudentCredentialsTemplate = (
    studentName,
    studentEmail,
    studentId,
    temporaryPassword,
    faculty,
    program
) => {
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
};

async function testStudentCredentialsEmail() {
    console.log('Testing student credentials email...');
    
    try {
        const transporter = nodemailer.createTransport(emailConfig);
        
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');
        
        console.log('Sending student credentials test email...');
        const mailOptions = {
            from: '"Limkokwing University" <limkokwing.portal.sl@gmail.com>',
            to: 'limkokwing.portal.sl@gmail.com',
            subject: '🎓 Your Limkokwing University Account - Login Credentials',
            html: generateStudentCredentialsTemplate(
                'John Doe',
                'john.doe@limkokwing.edu',
                'STU2024001',
                'TempPass123!',
                'Faculty of Design',
                'Bachelor of Design in Graphic Design'
            )
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Student credentials email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('📧 Check your inbox for the student credentials email!');
        
    } catch (error) {
        console.error('❌ Student credentials email test failed:', error.message);
    }
}

testStudentCredentialsEmail();
