const nodemailer = require('nodemailer');

// Test email configuration
const emailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'limkokwing.portal.sl@gmail.com',
        pass: 'fhqq fzni lmts gjzm'
    }
};

async function testEmail() {
    console.log('Testing email configuration...');
    
    try {
        // Create transporter
        const transporter = nodemailer.createTransport(emailConfig);
        
        // Verify connection
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified successfully!');
        
        // Send test email
        console.log('Sending test email...');
        const mailOptions = {
            from: '"Limkokwing University" <limkokwing.portal.sl@gmail.com>',
            to: 'limkokwing.portal.sl@gmail.com', // Send to self for testing
            subject: '📧 Test Email - Limkokwing Registration System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                        <h1>Limkokwing University</h1>
                        <p>Online Registration System</p>
                    </div>
                    <div style="padding: 20px; background: #fff; border: 1px solid #ddd;">
                        <h2>🎉 Email Service Test Successful!</h2>
                        <p>This is a test email to verify that the email notification system is working correctly.</p>
                        <div style="background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #000;">
                            <h3>Test Details:</h3>
                            <p><strong>From:</strong> Limkokwing Registration System</p>
                            <p><strong>To:</strong> limkokwing.portal.sl@gmail.com</p>
                            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p>If you receive this email, the email service is working perfectly!</p>
                    </div>
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px;">
                        <p>This is an automated test message from Limkokwing University Online Registration System.</p>
                    </div>
                </div>
            `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        if (error.code === 'EAUTH') {
            console.log('\n🔧 Troubleshooting tips:');
            console.log('1. Ensure 2-Step Verification is enabled on your Gmail account');
            console.log('2. Verify the App Password is correct (16 characters including spaces)');
            console.log('3. Check that you are using an App Password, not your regular password');
        }
    }
}

// Run the test
testEmail();
