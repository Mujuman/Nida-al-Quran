/**
 * Email Configuration Test Script
 * Run with: node test-email-config.js
 * 
 * This script tests if your Gmail SMTP configuration is working correctly
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const nodemailer = require('nodemailer');

console.log('🧪 Testing Email Configuration...\n');

// ============================================================
// Step 1: Check environment variables
// ============================================================
console.log('📋 Step 1: Checking Environment Variables');
console.log('─'.repeat(50));

const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET',
  from: process.env.EMAIL_FROM,
};

console.log(`📧 EMAIL_HOST: ${emailConfig.host || '❌ NOT SET'}`);
console.log(`📮 EMAIL_PORT: ${emailConfig.port || '❌ NOT SET'}`);
console.log(`👤 EMAIL_USER: ${emailConfig.user || '❌ NOT SET'}`);
console.log(`🔐 EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET'}`);
console.log(`📝 EMAIL_FROM: ${emailConfig.from || '❌ NOT SET'}\n`);

if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Missing required environment variables!');
  console.error('Please check your .env file and set all EMAIL_* variables.');
  process.exit(1);
}

// ============================================================
// Step 2: Test SMTP Connection
// ============================================================
console.log('📋 Step 2: Testing SMTP Connection');
console.log('─'.repeat(50));

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // Remove spaces
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify(async (error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed!');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error('\n🔍 Troubleshooting tips:');
    console.error('1. Are you using an Gmail app-specific password (not regular password)?');
    console.error('2. Is 2-Factor Authentication enabled on your Google Account?');
    console.error('3. Is the email address correct?');
    console.error('4. Are there spaces in the app password? Remove them from .env file.');
    process.exit(1);
  }

  console.log('✅ SMTP Connection Successful!\n');

  // ============================================================
  // Step 3: Send Test Email
  // ============================================================
  console.log('📋 Step 3: Sending Test Email');
  console.log('─'.repeat(50));

  const testEmail = 'test@nida-al-quran.example.com';

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Nida Al-Quran Support" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to yourself for testing
    subject: '✅ Nida Al-Quran Email Configuration Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #17473c;">✅ Email Configuration Working!</h2>
        <p>Your Nida Al-Quran email system is configured correctly.</p>
        
        <div style="background: #f0f9f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #17473c; margin-top: 0;">Configuration Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</li>
            <li><strong>SMTP Port:</strong> ${process.env.EMAIL_PORT}</li>
            <li><strong>Email User:</strong> ${process.env.EMAIL_USER}</li>
            <li><strong>From Address:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</li>
            <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>

        <p style="color: #666; font-size: 14px;">
          If you received this email, your email configuration is working correctly!
        </p>

        <p style="color: #c69a4b; font-weight: bold;">
          You can now use this email system for:
        </p>
        <ul style="color: #666;">
          <li>OTP Verification Emails</li>
          <li>Student Approval Notifications</li>
          <li>Contact Form Replies</li>
          <li>Teacher Assignment Notifications</li>
        </ul>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Nida Al-Quran Support Team
        </p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Failed to Send Test Email!');
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }

    console.log('✅ Test Email Sent Successfully!');
    console.log(`📧 To: ${process.env.EMAIL_USER}`);
    console.log(`📮 Message ID: ${info.messageId}\n`);

    // ============================================================
    // Summary
    // ============================================================
    console.log('📋 Summary');
    console.log('─'.repeat(50));
    console.log('✅ Environment variables loaded');
    console.log('✅ SMTP connection successful');
    console.log('✅ Test email sent\n');

    console.log('🎉 Email Configuration is Working Correctly!\n');

    console.log('Next steps:');
    console.log('1. Check your email inbox for the test message');
    console.log('2. Register a new student to test OTP email');
    console.log('3. Verify email to test admin notification');
    console.log('4. Approve student to test approval email\n');

    process.exit(0);
  });
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Email test timed out after 30 seconds');
  console.error('Please check your SMTP configuration and try again.');
  process.exit(1);
}, 30000);
