import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export function generateToken(userId, role = 'student') {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Set JWT token in HTTP-only cookie
export function setTokenCookie(token) {
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

// Get JWT token from cookies
export function getTokenFromCookies() {
  return cookies().get('token')?.value;
}

// Remove JWT token from cookies
export function removeTokenCookie() {
  cookies().delete('token');
}

// Get current user from token
export async function getCurrentUser() {
  const token = getTokenFromCookies();

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  return {
    id: decoded.id,
    role: decoded.role || 'student'
  };
}
