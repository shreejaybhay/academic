import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import { getCurrentUser } from '@/lib/auth';

// GET all attendance records
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const studentId = searchParams.get('studentId');

    let query = {};

    if (sessionId) {
      query.sessionId = sessionId;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    // Find attendance records
    let attendance = await Attendance.find(query)
      .populate('studentId', 'name email')
      .populate('sessionId', 'subject date');

    // Log any records with missing references
    const recordsWithMissingRefs = attendance.filter(record =>
      !record.studentId || !record.sessionId
    );

    if (recordsWithMissingRefs.length > 0) {
      console.warn(`Found ${recordsWithMissingRefs.length} attendance records with missing references:`,
        recordsWithMissingRefs.map(r => ({ id: r._id, studentId: r.studentId, sessionId: r.sessionId }))
      );
    }

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get attendance records' },
      { status: 500 }
    );
  }
}

// POST mark attendance
export async function POST(request) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { qrCodeData } = await request.json();

    // Find session by QR code data
    const session = await Session.findOne({ qrCodeData });

    if (!session) {
      console.log('Invalid QR code:', qrCodeData);
      return NextResponse.json(
        { success: false, message: 'Invalid QR code - Session not found' },
        { status: 400 }
      );
    }

    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      console.log('Session expired:', {
        sessionId: session._id,
        subject: session.subject,
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      });

      return NextResponse.json(
        {
          success: false,
          message: `Session has expired at ${expiresAt.toLocaleString()}. Current time: ${now.toLocaleString()}`
        },
        { status: 400 }
      );
    }

    // Check if student has already marked attendance for this session
    const existingAttendance = await Attendance.findOne({
      studentId: currentUser.id,
      sessionId: session._id,
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance already marked for this session' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await Attendance.create({
      studentId: currentUser.id,
      sessionId: session._id,
    });

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        message: 'Attendance marked successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
