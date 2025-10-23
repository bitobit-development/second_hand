import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Testing email to registered address...');
    console.log('To: haim@bit2bit.co.za');
    console.log('From:', process.env.EMAIL_FROM);
    console.log('');

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: 'haim@bit2bit.co.za',
      subject: 'Test Email - Second-Hand Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Test Email SUCCESS!</h1>
            <p>Hi Haim,</p>
            <p>This email was sent successfully to your registered Resend email (haim@bit2bit.co.za).</p>
            <p>To send to haim.derazon@gmail.com, you need to verify a domain in Resend.</p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('Email sent successfully!');
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
