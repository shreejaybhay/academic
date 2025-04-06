import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import { getCurrentUser } from '@/lib/auth';

// GET a single student by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Users can only access their own data unless they are admin
    if (currentUser.id !== params.id) {
      if (currentUser.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Not authorized' },
          { status: 403 }
        );
      }
    }

    const student = await Student.findById(params.id)
      .select('name email role createdAt');

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get student' },
      { status: 500 }
    );
  }
}
