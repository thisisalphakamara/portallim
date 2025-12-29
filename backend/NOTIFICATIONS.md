## Notification Configuration

- **Email (Resend)**: Set `RESEND_API_KEY` in `backend/.env` to enable email notifications. The code uses the Resend Node SDK, sending from `notify@limkokwing.edu.sl`; ensure the domain is verified in the Resend dashboard. If the key is missing, email tasks are skipped gracefully.
- **SMS (optional)**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are still recognized. If Twilio credentials are absent, SMS notifications are ignored without blocking the workflow.

The Resend client is created once (`new Resend(process.env.RESEND_API_KEY)`), and emails are triggered at submission, each approval transition, and on rejection. SMS uses Twilio only when configured, ensuring the Registrar can keep notifications in a single system if Twilio is unavailable.
