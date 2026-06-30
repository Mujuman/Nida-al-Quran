const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Mark Attendance for a Student
exports.markAttendance = async (req, res) => {
  const { studentId, course, date, status, notes } = req.body;

  try {
    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if attendance record exists for this date
    let attendance = await Attendance.findOne({
      student: studentId,
      course,
      date: new Date(date),
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.notes = notes;
      attendance.recordedBy = req.admin.id;
      attendance.markedAt = new Date();
    } else {
      // Create new record
      attendance = new Attendance({
        student: studentId,
        course,
        date: new Date(date),
        status,
        notes,
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

// Get Student Attendance Record
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId, course, startDate, endDate } = req.query;

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

    // Calculate attendance stats
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const excused = attendance.filter(a => a.status === 'excused').length;

    const percentage = total > 0 ? ((present + late + excused) / total * 100).toFixed(2) : 0;

    res.json({
      attendance,
      stats: {
        total,
        present,
        absent,
        late,
        excused,
        percentage,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get All Attendance Records (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { course, startDate, endDate, status } = req.query;

    const filter = {};
    if (course) filter.course = course;
    if (status) filter.status = status;
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

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get Attendance by Course
exports.getAttendanceByCourse = async (req, res) => {
  try {
    const { course, date } = req.query;

    const filter = { course };
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);

      filter.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
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

// Bulk Mark Attendance
exports.bulkMarkAttendance = async (req, res) => {
  const { course, date, records } = req.body;

  try {
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

// Get Attendance Report
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

    const attendance = await Attendance.find(filter)
      .populate('student', 'fullName email course')
      .sort({ date: -1 });

    // Group by student
    const report = {};
    attendance.forEach(record => {
      if (!report[record.student._id]) {
        report[record.student._id] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      report[record.student._id].total++;
      report[record.student._id][record.status]++;
    });

    // Calculate percentages
    const reportArray = Object.values(report).map(r => ({
      ...r,
      percentage: r.total > 0 ? ((r.present + r.late + r.excused) / r.total * 100).toFixed(2) : 0,
    }));

    res.json(reportArray);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete Attendance Record
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
