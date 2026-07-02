const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    let transporter;

    // Check if real SMTP config exists in environment
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log('Using configured SMTP transporter for:', process.env.EMAIL_USER);
    } else {
      // Fallback: create ethereal test account
      console.log('No SMTP credentials in environment. Creating ethereal test account...');
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
      console.log('Ethereal Test account user:', testAccount.user);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Nida Al-Quran Support" <support@nidaalquran.com>',
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully! Message ID:', info.messageId);

    // If using ethereal test service, print URL to view the message in browser
    if (!process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL to inspect the sent email in browser:', previewUrl);
      return { success: true, messageId: info.messageId, previewUrl };
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
