import { sendEmail, getVerificationEmailHtml } from '@/lib/email';

async function testEmail() {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('📧 To:', 'haim.derazon@gmail.com');
    console.log('📤 From:', process.env.EMAIL_FROM);
    console.log('🔑 API Key:', process.env.RESEND_API_KEY ? 'Set ✓' : 'Missing ✗');
    console.log('');

    const testUrl = 'http://localhost:3000/auth/verify-email?token=test-token-123';
    const html = getVerificationEmailHtml(testUrl, 'Haim');

    console.log('📬 Sending test email...');
    const result = await sendEmail({
      to: 'haim.derazon@gmail.com',
      subject: 'Test Email - Second-Hand Marketplace',
      html,
    });

    console.log('✅ Email sent successfully!');
    console.log('📋 Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error(error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testEmail();
