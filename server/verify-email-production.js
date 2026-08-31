#!/usr/bin/env node

/**
 * Email Verification Script for Production (Vercel)
 * 
 * Tests if email configuration is working in production
 * 
 * Usage:
 *   node verify-email-production.js <student-email> [test-mode]
 * 
 * Examples:
 *   node verify-email-production.js mujahidhussenm2@gmail.com
 *   node verify-email-production.js mujahidhussenm2@gmail.com test
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const nodemailer = require('nodemailer');

const testEmailInProduction = async () => {
  console.log('\n📧 Email Configuration Verification');
  console.log('=====================================\n');

  // Check environment variables
  console.log('🔍 Checking environment variables...');
  console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || '❌ NOT SET'}`);
  console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || '❌ NOT SET'}`);
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
  console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ SET (hidden)' : '❌ NOT SET'}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ NOT SET'}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);

  // Validate required variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured!');
    console.error('Please set EMAIL_USER and EMAIL_PASS in your Vercel dashboard.');
    process.exit(1);
  }

  // Get recipient email
  const recipientEmail = process.argv[2] || 'test@example.com';
  const isTestMode = process.argv[3] === 'test';

  console.log(`📬 Testing email send to: ${recipientEmail}`);
  if (isTestMode) {
    console.log('🧪 Test mode: Using Ethereal (no real email sent)\n');
  } else {
    console.log('📧 Production mode: Using real Gmail SMTP\n');
  }

  try {
    // Create transporter
    console.log('🔗 Creating email transporter...');
    let transporter;

    if (isTestMode) {
      // Ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('✅ Ethereal transporter created\n');
    } else {
      // Real Gmail SMTP
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      console.log('✅ Gmail SMTP transporter created\n');
    }

    // Test connection
    console.log('🧪 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified\n');

    // Send test email
    console.log('📤 Sending test email...');
    const otp = '123456';
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Nida Al-Quran Support" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Test Email - ${otp} is your Nida Al-Quran Email Verification Code`,
      text: `Test OTP: ${otp}\n\nThis is a test email to verify that email configuration is working correctly.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #17473c; text-align: center;">Nida Al-Quran Email Test</h2>
          <p style="font-size: 16px; color: #1e293b;">Email configuration is working correctly!</p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #f8faf9; border: 2px dashed #17473c; border-radius: 12px; padding: 16px 36px;">
              <span style="font-size: 36px; font-weight: 800; color: #17473c; letter-spacing: 8px; font-family: monospace;">${otp}</span>
            </div>
          </div>
          <p style="font-size: 14px; color: #64748b; text-align: center;">This is a test email to verify configuration.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully!\n`);
    console.log(`📧 Message ID: ${info.messageId}`);

    if (isTestMode) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📍 Preview URL: ${previewUrl}`);
      console.log('\n💡 Click the preview URL to see test email in browser\n');
    } else {
      console.log('\n💡 Check inbox at: ' + recipientEmail);
      console.log('⏱️  Email should arrive within 1-2 minutes\n');
    }

    console.log('✅ Email system is working correctly!');
    console.log('\n🎉 You can now:');
    console.log('   1. Register students at https://nida-al-quran.vercel.app/register');
    console.log('   2. Students will receive OTP verification emails');
    console.log('   3. Upon approval, students receive approval emails');
    console.log('   4. Admins receive registration notifications\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);

    // Provide troubleshooting hints
    if (error.message.includes('535')) {
      console.error('💡 Hint: Gmail authentication failed. Check:');
      console.error('   1. EMAIL_USER is correct');
      console.error('   2. EMAIL_PASS is the app password (not regular password)');
      console.error('   3. 2FA is enabled on Gmail account');
      console.error('   4. App password was generated at https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Hint: Network error. Check:');
      console.error('   1. EMAIL_HOST is set correctly');
      console.error('   2. Internet connection is working');
    } else if (error.message.includes('EHOSTUNREACH')) {
      console.error('💡 Hint: Cannot reach mail server. Check:');
      console.error('   1. EMAIL_HOST is correct');
      console.error('   2. EMAIL_PORT is correct');
      console.error('   3. Firewall is not blocking SMTP');
    }

    console.error('\n📖 Troubleshooting guide: see VERCEL_EMAIL_SETUP.md\n');
    process.exit(1);
  }
};

// Run the test
testEmailInProduction().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
