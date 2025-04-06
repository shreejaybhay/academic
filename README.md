# QR Code-Based Student Attendance System

A modern attendance tracking system built with Next.js, MongoDB, and JWT authentication. This system allows students to mark attendance by scanning QR codes, and administrators to create sessions and track attendance records.

## Features

- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies
- **Role-Based Access Control**: Different dashboards and permissions for admins and students
- **Route Protection**: Both server-side middleware and client-side components for secure routes
- **QR Code Generation**: Generate unique QR codes for each session
- **QR Code Scanning**: Students can scan QR codes to mark attendance
- **Admin Dashboard**: Create sessions, view attendance records, and manage students
- **Student Dashboard**: View attendance history and scan QR codes
- **Notification System**: Real-time notifications for students when new sessions are created
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **QR Code**: qrcode.react for generation, html5-qrcode for scanning

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd academic
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

Replace `MONGODB_URI` with your MongoDB connection string.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Admin Setup

1. Register a new account
2. Use MongoDB Compass or another tool to change the user's role to 'admin':

```javascript
db.students.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

3. Log in with the admin account
4. Create sessions from the admin dashboard
5. Generate and share QR codes with students

### Student Usage

1. Register a student account
2. Log in with the student account
3. Navigate to the dashboard
4. Scan the QR code provided by the admin
5. View attendance history

## Project Structure

- `/src/app`: Next.js App Router pages
  - `/api`: API routes for authentication, sessions, attendance, and notifications
  - `/dashboard`: Student dashboard for scanning QR codes and viewing attendance
  - `/admin`: Admin dashboard for managing sessions and viewing records
  - `/notifications`: Page for viewing and managing notifications
- `/src/components`: React components
  - `/ui`: UI components (buttons, cards, dropdowns, etc.)
  - `NotificationBell.jsx`: Notification bell component for the navigation bar
- `/src/lib`: Utility functions
- `/src/models`: Mongoose models
  - `Notification.js`: Schema for notifications
- `/src/context`: React context providers
  - `AuthContext.js`: Authentication context
  - `NotificationContext.js`: Notification context
- `/middleware.js`: Server-side route protection
- `/scripts`: Utility scripts for database operations

## Route Protection

This project implements a comprehensive route protection system using both server-side middleware and client-side components. For detailed information, see [ROUTE_PROTECTION.md](ROUTE_PROTECTION.md).

## Notification System

The notification system keeps students informed about new attendance sessions:

- **Real-time Notifications**: Students receive notifications when teachers create new attendance sessions
- **Notification Bell**: A bell icon in the navigation bar shows unread notification count
- **Notification Center**: A dedicated page for viewing and managing all notifications
- **Read/Unread Status**: Students can mark notifications as read or delete them
- **Automatic Updates**: Notifications are automatically checked for updates every 30 seconds

For detailed information about the notification system, see [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md).

## License

This project is licensed under the MIT License.
