/**
 * This script fixes attendance records with missing references.
 * 
 * Usage:
 * node scripts/fix-attendance-records.js
 * 
 * Make sure to set the MONGODB_URI environment variable or update it in this script.
 */

const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hydrashree26:eAZFnvimBaUIl5Tg@cluster0.vpxcsph.mongodb.net/attendance-system?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define schemas
const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SessionSchema = new mongoose.Schema({
  subject: String,
  date: Date,
  qrCodeData: String,
  expiresAt: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
});

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  createdAt: Date,
});

// Create models
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Session = mongoose.model('Session', SessionSchema);
const Student = mongoose.model('Student', StudentSchema);

// Fix attendance records
async function fixAttendanceRecords() {
  try {
    // Find all attendance records
    const attendanceRecords = await Attendance.find({});
    
    console.log(`Found ${attendanceRecords.length} attendance records`);
    
    // Check each record for missing references
    let invalidRecords = 0;
    let fixedRecords = 0;
    let deletedRecords = 0;
    
    for (const record of attendanceRecords) {
      let hasIssue = false;
      
      // Check if studentId exists
      if (record.studentId) {
        const student = await Student.findById(record.studentId);
        if (!student) {
          console.log(`Record ${record._id}: Student ${record.studentId} not found`);
          hasIssue = true;
        }
      } else {
        console.log(`Record ${record._id}: Missing studentId`);
        hasIssue = true;
      }
      
      // Check if sessionId exists
      if (record.sessionId) {
        const session = await Session.findById(record.sessionId);
        if (!session) {
          console.log(`Record ${record._id}: Session ${record.sessionId} not found`);
          hasIssue = true;
        }
      } else {
        console.log(`Record ${record._id}: Missing sessionId`);
        hasIssue = true;
      }
      
      if (hasIssue) {
        invalidRecords++;
        
        // Ask user what to do with this record
        console.log(`\nInvalid record: ${record._id}`);
        console.log(`  Student ID: ${record.studentId || 'Missing'}`);
        console.log(`  Session ID: ${record.sessionId || 'Missing'}`);
        console.log(`  Timestamp: ${record.timestamp}`);
        
        // For this script, we'll just delete invalid records
        // In a real application, you might want to prompt the user for action
        await Attendance.deleteOne({ _id: record._id });
        console.log(`  Action: Deleted record ${record._id}`);
        deletedRecords++;
      }
    }
    
    console.log('\nSummary:');
    console.log(`  Total records: ${attendanceRecords.length}`);
    console.log(`  Invalid records: ${invalidRecords}`);
    console.log(`  Fixed records: ${fixedRecords}`);
    console.log(`  Deleted records: ${deletedRecords}`);
    
  } catch (error) {
    console.error('Error fixing attendance records:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixAttendanceRecords();
