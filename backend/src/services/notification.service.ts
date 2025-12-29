import { Resend } from 'resend';
import Twilio from 'twilio';

export interface NotificationRecipient {
    email?: string;
    phoneNumber?: string;
    fullName?: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

const createTwilioClient = () => {
    if (!twilioSid || !twilioAuthToken) {
        return null;
    }

    return Twilio(twilioSid, twilioAuthToken);
};

const twilioClient = createTwilioClient();

export const sendEmailNotification = async (recipientEmail: string, subject: string, body: string) => {
    if (!resend) return;

    await resend.emails.send({
        from: 'notify@limkokwing.edu.sl',
        to: recipientEmail,
        subject,
        html: `<p>${body}</p>`
    });
};

export const sendSmsNotification = async (to: string, message: string) => {
    if (!twilioClient || !twilioFromNumber) return;

    await twilioClient.messages.create({
        body: message,
        from: twilioFromNumber,
        to
    });
};

export const notifyStudent = async (recipient: NotificationRecipient, subject: string, message: string) => {
    const tasks = [];
    if (recipient.email) {
        tasks.push(sendEmailNotification(recipient.email, subject, message));
    }

    if (recipient.phoneNumber) {
        tasks.push(sendSmsNotification(recipient.phoneNumber, message));
    }

    if (tasks.length === 0) return;

    await Promise.allSettled(tasks);
};
