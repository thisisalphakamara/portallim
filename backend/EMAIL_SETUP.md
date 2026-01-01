# Email Service Setup Guide - Gmail App Password

This guide will help you configure the email notification system using Gmail App Password.

## Prerequisites

1. A Gmail account
2. 2-Step Verification enabled on your Google Account

## Step 1: Enable 2-Step Verification

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Click on "Security" in the left navigation
3. Scroll down to "Signing in to Google" section
4. Click on "2-Step Verification"
5. Follow the setup process if not already enabled

## Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to the Security page
2. Click on "App passwords" (you may need to sign in again)
3. Under "Select app", choose "Mail"
4. Under "Select device", choose "Other (Custom name)"
5. Enter a name like "Limkokwing Registration System"
6. Click "Generate"
7. Copy the 16-character password (this is your App Password)

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration (Gmail App Password)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-gmail-address@gmail.com"
EMAIL_APP_PASSWORD="your-16-character-app-password"
EMAIL_FROM="Limkokwing University <your-gmail-address@gmail.com>"
```

**Important:**
- Replace `your-gmail-address@gmail.com` with your actual Gmail address
- Replace `your-16-character-app-password` with the password generated in Step 2
- The App Password is exactly 16 characters (including spaces)
- Do NOT use your regular Gmail password

## Step 4: Test the Email Service

Start the backend server and test the email functionality:

```bash
# Start the server
npm run dev

# Test email (using curl or Postman)
curl -X POST http://localhost:5000/api/email/test \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email from the registration system."
  }'
```

## Step 5: Verify Email Templates

You can test different email templates:

1. **Registration Submission**: `/api/email/test-registration`
2. **Approval Notification**: `/api/email/test-approval`
3. **Final Approval**: `/api/email/test-final-approval`
4. **Rejection**: `/api/email/test-rejection`

## Security Notes

- **Never commit your App Password to version control**
- **App Passwords are specific to each application**
- **You can revoke App Passwords anytime from Google Account settings**
- **Keep your `.env` file secure and never share it**

## Troubleshooting

### "Invalid username or password" Error
- Ensure you're using the App Password, not your regular Gmail password
- Check that 2-Step Verification is enabled
- Verify the Gmail address is correct

### "Could not connect to SMTP server" Error
- Check your internet connection
- Verify the SMTP settings (host: smtp.gmail.com, port: 587)
- Ensure firewall isn't blocking the connection

### "Email not sending but no error" Error
- Check the recipient email address
- Verify the email isn't going to spam
- Check Gmail sending limits (100 emails/day for regular accounts)

## Production Considerations

For production use, consider:

1. **Using a dedicated email service** like SendGrid, Mailgun, or AWS SES
2. **Setting up proper domain authentication** (SPF, DKIM, DMARC)
3. **Monitoring email deliverability** and bounce rates
4. **Implementing email queueing** for high volume sending
5. **Using a business Gmail account** for higher sending limits

## Email Templates Overview

The system includes professional email templates for:

1. **Registration Submission** - Confirms receipt and explains the approval process
2. **Approval Notifications** - Updates students at each approval stage
3. **Final Approval** - Congratulates students and provides next steps
4. **Rejection Notifications** - Informs students of required actions

All templates follow the black-and-white theme and include:
- Professional Limkokwing University branding
- Clear subject lines
- Detailed registration information
- Actionable next steps
- Contact information for support
