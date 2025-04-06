import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import { getCurrentUser } from '@/lib/auth';

// GET all students (admin only)
export async function GET(request) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (currentUser.role !== 'admin') {

      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    const students = await Student.find({ role: 'student' })
      .select('name email createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get students' },
      { status: 500 }
    );
  }
}
