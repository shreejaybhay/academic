import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import { generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password, role = 'student' } = await request.json();

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new student
    const student = await Student.create({
      name,
      email,
      passwordHash: password, // Will be hashed by the pre-save hook
      role,
    });

    // Generate token
    const token = generateToken(student._id, student.role);

    // Set token in cookie
    setTokenCookie(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
