const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Admin = require('../models/Admin');

// ──────────────────────────────────────────────────────────────
// Mark Attendance for a Student
// Sub-admins can only mark for their assigned students
// ──────────────────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  const {
    studentId, course, date, status, notes, startTime, endTime, learningPlace,
    teacherSuggestion, absenceReason, permissionStatus, permissionNote,
  } = req.body;

  try {
    if (req.admin.role === 'main_admin') {
      return res.status(403).json({ msg: 'Access denied. Main admin cannot mark attendance.' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (student.isTeachingActive === false) {
      return res.status(400).json({ msg: 'Cannot mark attendance. Teaching status is disabled for this student.' });
    }

    // Sub-admin restriction: only mark attendance for their own students
    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      const isAssigned = adminDoc.assignedStudents
        .map((id) => id.toString())
        .includes(studentId);
      if (!isAssigned) {
        return res.status(403).json({ msg: 'Access denied. Not your assigned student.' });
      }
      if (!adminDoc.assignedCourses.includes(course)) {
        return res.status(403).json({ msg: 'Access denied. This course is not assigned to you.' });
      }
    }

    let attendance = await Attendance.findOne({
      student: studentId,
      course,
      date: new Date(date),
    });

    if (attendance) {
      attendance.status = status;
      attendance.notes = notes;
      attendance.startTime = startTime;
      attendance.endTime = endTime;
      attendance.learningPlace = learningPlace;
      attendance.teacherSuggestion = teacherSuggestion;
      attendance.absenceReason = absenceReason;
      attendance.permissionStatus = permissionStatus;
      attendance.permissionNote = permissionNote;
      attendance.recordedBy = req.admin.id;
      attendance.markedAt = new Date();
    } else {
      attendance = new Attendance({
        student: studentId,
        course,
        date: new Date(date),
        status,
        notes,
        startTime,
        endTime,
        learningPlace,
        teacherSuggestion,
        absenceReason,
        permissionStatus,
        permissionNote,
        recordedBy: req.admin.id,
      });
    }

    await attendance.save();
    res.json({ msg: 'Attendance marked successfully', attendance });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────
// Get Student Attendance Record
// ──────────────────────────────────────────────────────────────
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId, course, startDate, endDate } = req.query;

    // Sub-admin: ensure this student is assigned to them
    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      const isAssigned = adminDoc.assignedStudents
        .map((id) => id.toString())
        .includes(studentId);
      if (!isAssigned) {
        return res.status(403).json({ msg: 'Access denied. Not your assigned student.' });
      }
    }

    const filter = { student: studentId };
    if (course) filter.course = course;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'fullName email course')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1 });

    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const excused = attendance.filter((a) => a.status === 'excused').length;
    const percentage =
      total > 0 ? (((present + late + excused) / total) * 100).toFixed(2) : 0;

    res.json({
      attendance,
      stats: { total, present, absent, late, excused, percentage },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// Get All Attendance Records
// Main admin: all records; Sub-admin: only their students
// ──────────────────────────────────────────────────────────────
exports.getAllAttendance = async (req, res) => {
  try {
    const { course, startDate, endDate, status, recordedBy } = req.query;

    const filter = {};
    if (course) filter.course = course;
    if (status) filter.status = status;
    if (recordedBy) filter.recordedBy = recordedBy;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Sub-admin filter by assigned students
    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      filter.student = { $in: adminDoc ? adminDoc.assignedStudents : [] };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'fullName email course')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// Get Attendance by Course
// ──────────────────────────────────────────────────────────────
exports.getAttendanceByCourse = async (req, res) => {
  try {
    const { course, date } = req.query;

    const filter = { course };
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      filter.date = { $gte: startOfDay, $lt: endOfDay };
    }

    // Sub-admin: only their students
    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      filter.student = { $in: adminDoc ? adminDoc.assignedStudents : [] };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'fullName email')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// Bulk Mark Attendance
// ──────────────────────────────────────────────────────────────
exports.bulkMarkAttendance = async (req, res) => {
  const { course, date, records } = req.body;

  try {
    if (req.admin.role === 'main_admin') {
      return res.status(403).json({ msg: 'Access denied. Main admin cannot mark attendance.' });
    }

    // Sub-admin: validate all students are assigned
    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      const assignedIds = adminDoc.assignedStudents.map((id) => id.toString());
      const unauthorized = records.filter(
        (r) => !assignedIds.includes(r.studentId)
      );
      if (unauthorized.length > 0) {
        return res.status(403).json({ msg: 'Some students are not assigned to you.' });
      }
    }

    // Verify all selected students have active teaching status
    const studentIds = records.map(r => r.studentId);
    const studentsList = await User.find({ _id: { $in: studentIds } });
    const inactiveStudents = studentsList.filter(s => s.isTeachingActive === false);
    if (inactiveStudents.length > 0) {
      return res.status(400).json({ msg: 'Some students do not have active teaching status.' });
    }

    const results = [];
    for (const record of records) {
      let attendance = await Attendance.findOne({
        student: record.studentId,
        course,
        date: new Date(date),
      });

      if (attendance) {
        attendance.status = record.status;
        attendance.notes = record.notes || '';
      } else {
        attendance = new Attendance({
          student: record.studentId,
          course,
          date: new Date(date),
          status: record.status,
          notes: record.notes || '',
          recordedBy: req.admin.id,
        });
      }

      await attendance.save();
      results.push(attendance);
    }

    res.json({ msg: 'Bulk attendance marked successfully', count: results.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────
// Get Attendance Report
// ──────────────────────────────────────────────────────────────
exports.getAttendanceReport = async (req, res) => {
  try {
    const { course, startDate, endDate } = req.query;

    const filter = {};
    if (course) filter.course = course;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (req.admin.role === 'sub_admin') {
      const adminDoc = await Admin.findById(req.admin.id);
      filter.student = { $in: adminDoc ? adminDoc.assignedStudents : [] };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'fullName email course')
      .sort({ date: -1 });

    const report = {};
    attendance.forEach((record) => {
      const sid = record.student._id;
      if (!report[sid]) {
        report[sid] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      report[sid].total++;
      report[sid][record.status]++;
    });

    const reportArray = Object.values(report).map((r) => ({
      ...r,
      percentage:
        r.total > 0
          ? (((r.present + r.late + r.excused) / r.total) * 100).toFixed(2)
          : 0,
    }));

    res.json(reportArray);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// Delete Attendance Record
// ──────────────────────────────────────────────────────────────
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance record not found' });
    }
    res.json({ msg: 'Attendance record deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
