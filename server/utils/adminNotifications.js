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

module.exports = {
  sendRegistrationNotification,
  sendAssignmentNotification,
};