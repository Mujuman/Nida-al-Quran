const Admin = require('../models/Admin');
const sendEmail = require('./sendEmail');

const sendRegistrationNotification = async (student) => {
  try {
    const mainAdmins = await Admin.find({
      role: 'main_admin',
      isActive: true,
    }).select('email fullName');

    const subject = `New student registration: ${student.fullName}`;
    const text = [
      `A new student has registered with Nida Al-Quran.`,
      '',
      `Name: ${student.fullName}`,
      `Email: ${student.email}`,
      `Phone: ${student.phone || '-'}`,
      `Course: ${student.course || '-'}`,
      `Level: ${student.level || '-'}`,
      `Registration status: ${student.registrationStatus}`,
    ].join('\n');

    return await Promise.allSettled(mainAdmins.map((admin) => sendEmail({
      to: admin.email,
      subject,
      text: `Hello ${admin.fullName || 'Admin'},\n\n${text}`,
    })));
  } catch (error) {
    console.error('Registration notification error:', error.message);
    return [];
  }
};

const sendAssignmentNotification = async (student, subAdmin) => {
  if (!subAdmin?.email || subAdmin.isActive === false) return null;

  try {
    const text = [
      `A new student has been assigned to you in Nida Al-Quran.`,
      '',
      `Student: ${student.fullName}`,
      `Student email: ${student.email}`,
      `Phone: ${student.phone || '-'}`,
      `Course: ${student.course || '-'}`,
      `Level: ${student.level || '-'}`,
    ].join('\n');

    return await sendEmail({
      to: subAdmin.email,
      subject: `New student assigned: ${student.fullName}`,
      text: `Hello ${subAdmin.fullName || 'Sub-admin'},\n\n${text}`,
    });
  } catch (error) {
    console.error('Assignment notification error:', error.message);
    return null;
  }
};

const sendVerificationEmail = async (student, verifyUrl) => {
  if (!student?.email) return null;
  try {
    const subject = `Verify Your Email Address - Nida Al-Quran Registration`;
    const text = [
      `As-salamu alaykum ${student.fullName},`,
      '',
      `Thank you for registering with Nida Al-Quran.`,
      `Please verify your email address by clicking the link below:`,
      `${verifyUrl}`,
      '',
      `Once your email address is verified, your registration will be sent to the main administrator for final approval.`,
      '',
      `If you did not create this account, please ignore this email.`,
      '',
      `Warm regards,`,
      `Nida Al-Quran Team`,
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">Nida Al-Quran Student Registration</h2>
        <p style="font-size: 16px; color: #334155;">As-salamu alaykum <strong>${student.fullName}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Thank you for registering for Nida Al-Quran courses. Please verify your email address to complete your registration request:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #d4af37, #b8941f); color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(212,175,55,0.3);">Verify Email Address</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:<br><a href="${verifyUrl}" style="color: #1e3a8a; word-break: break-all;">${verifyUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 13px; color: #94a3b8; text-align: center;">Once your email is verified, your application will be reviewed by the main admin. You will receive an email confirmation once approved.</p>
      </div>
    `;

    return await sendEmail({
      to: student.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Verification email error:', error.message);
    return null;
  }
};

const sendApprovalNotification = async (student) => {
  if (!student?.email) return null;
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const loginUrl = `${clientUrl}/student/login`;
    const subject = `Your Nida Al-Quran Account has been Approved! 🎉`;
    const text = [
      `As-salamu alaykum ${student.fullName},`,
      '',
      `Alhamdulillah! Your student registration with Nida Al-Quran has been officially approved by the main administrator.`,
      '',
      `You can now log in to your Student Portal using your registered email and password:`,
      `Login URL: ${loginUrl}`,
      `Email: ${student.email}`,
      '',
      `Jazakum Allahu Khairan,`,
      `Nida Al-Quran Administration Team`,
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #10b981; text-align: center; margin-bottom: 20px;">Account Approved! 🎉</h2>
        <p style="font-size: 16px; color: #334155;">As-salamu alaykum <strong>${student.fullName}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Alhamdulillah! Your student registration with <strong>Nida Al-Quran</strong> has been officially approved by the main administrator.</p>
        <p style="font-size: 15px; color: #475569;">You can now log in to your Student Portal to access your performance metrics, attendance records, and assigned classes:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(30,58,138,0.25);">Log In to Student Portal</a>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #334155;">
          <strong>Registered Email:</strong> ${student.email}<br />
          <strong>Course:</strong> ${student.course || 'Quran Studies'}
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 13px; color: #94a3b8; text-align: center;">Jazakum Allahu Khairan,<br />Nida Al-Quran Administration Team</p>
      </div>
    `;

    return await sendEmail({
      to: student.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Approval notification error:', error.message);
    return null;
  }
};

module.exports = {
  sendRegistrationNotification,
  sendAssignmentNotification,
  sendVerificationEmail,
  sendApprovalNotification,
};