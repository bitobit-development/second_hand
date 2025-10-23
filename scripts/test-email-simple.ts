import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('To: haim.derazon@gmail.com');
    console.log('From:', process.env.EMAIL_FROM);
    console.log('API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
    console.log('');

    console.log('Sending test email...');
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: 'haim.derazon@gmail.com',
      subject: 'Test Email - Second-Hand Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Test Email</h1>
            <p>Hi Haim,</p>
            <p>This is a test email to verify that Resend is working correctly.</p>
            <p>If you receive this, the email configuration is working!</p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error from Resend:');
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    console.log('Email sent successfully!');
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error sending email:');
    console.error(error);
  }
}

testEmail();
