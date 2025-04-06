import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Student from '@/models/Student';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET all sessions
export async function GET(request) {
  try {
    await dbConnect();

    const sessions = await Session.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

// POST create a new session
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

    const { subject, date, expiresAt } = await request.json();

    // Generate unique QR code data
    const qrCodeData = uuidv4();

    const session = await Session.create({
      subject,
      date: new Date(date),
      qrCodeData,
      expiresAt: new Date(expiresAt),
      createdBy: currentUser.id,
    });

    // Send notifications to all students
    try {
      // Find all students (non-admin users)
      const students = await Student.find({ role: { $ne: 'admin' } });

      // Format date for notification
      const formattedDate = new Date(date).toLocaleDateString();
      const formattedTime = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Create notifications for each student
      const notifications = students.map(student => ({
        recipient: student._id,
        title: 'New Attendance Session',
        message: `A new attendance session for "${subject}" has been created for ${formattedDate} at ${formattedTime}.`,
        type: 'session',
        relatedId: session._id,
        relatedModel: 'Session',
      }));

      // Insert all notifications
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} notifications for new session`);
      }
    } catch (notificationError) {
      // Log error but don't fail the session creation
      console.error('Error creating notifications:', notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}
