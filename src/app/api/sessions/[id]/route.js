import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { getCurrentUser } from '@/lib/auth';

// GET a single session by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const session = await Session.findById(params.id)
      .populate('createdBy', 'name email');

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get session' },
      { status: 500 }
    );
  }
}

// DELETE a session
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await Session.findById(params.id);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if the user is the creator of the session
    if (session.createdBy.toString() !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this session' },
        { status: 403 }
      );
    }

    await session.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete session' },
      { status: 500 }
    );
  }
}
