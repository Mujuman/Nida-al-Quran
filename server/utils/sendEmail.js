const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  console.log(`📤 Attempting to send email to ${to} with subject: "${subject}"`);

  // 1. Try primary SMTP if configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      console.log(`📧 Using SMTP server: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
      
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // strip spaces if any
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Ensure sender address uses authenticated Gmail user to prevent Gmail 535/SPF block
      const fromHeader = process.env.EMAIL_FROM && process.env.EMAIL_FROM.includes(process.env.EMAIL_USER)
        ? process.env.EMAIL_FROM
        : `"Nida Al-Quran Support" <${process.env.EMAIL_USER}>`;

      const mailOptions = {
        from: fromHeader,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully via SMTP! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpError) {
      console.error(`⚠️ Primary SMTP failed: ${smtpError.message}`);
      console.log('Falling back to Ethereal test account for email delivery...');
    }
  } else {
    console.log('⚠️ Email credentials not configured (EMAIL_USER/EMAIL_PASS missing). Using Ethereal fallback.');
  }

  // 2. Fallback to Ethereal test account if SMTP fails or is unconfigured
  try {
    console.log('📧 Creating Ethereal test account for email delivery...');
    const testAccount = await nodemailer.createTestAccount();
    const fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: '"Nida Al-Quran Support" <noreply@nidaalquran.com>',
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    };

    const info = await fallbackTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✅ Email sent via Ethereal fallback! Message ID: ${info.messageId}`);
    console.log(`📧 Preview URL: ${previewUrl}`);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (fallbackError) {
    console.error(`❌ Error sending email via fallback: ${fallbackError.message}`);
    return { success: false, error: fallbackError.message };
  }
};

module.exports = sendEmail;
