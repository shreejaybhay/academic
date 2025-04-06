# QR Code-Based Student Attendance System: Project Overview

This document provides a simple overview of the project, explaining what technologies we used and how we built the system.

## What is this project?

This is a digital attendance system that replaces traditional paper-based attendance sheets. Teachers create attendance sessions, and students mark their attendance by scanning a QR code with their smartphones.

## Who is it for?

- **Teachers/Admins**: Can create attendance sessions and view attendance records
- **Students**: Can scan QR codes to mark their attendance and view their attendance history

## Tech Stack (What we used to build it)

### Frontend (What users see and interact with)
- **Next.js**: A React framework that helps us build both the website and the API
- **React**: A JavaScript library for building user interfaces
- **Tailwind CSS**: A utility-first CSS framework for quickly styling the application
- **shadcn/ui**: A collection of reusable UI components
- **HTML5 QR Scanner**: A library for scanning QR codes using the device camera

### Backend (The server-side logic)
- **Next.js API Routes**: Handles requests from the frontend
- **MongoDB**: A database to store information about users, sessions, and attendance
- **Mongoose**: Makes it easier to work with MongoDB
- **JWT (JSON Web Tokens)**: For secure user authentication

### Development Tools
- **npm**: Package manager for installing and managing libraries
- **ESLint**: Helps catch errors and enforce code style
- **Git**: For version control

## How We Built It

### 1. Setting Up the Project
- Created a Next.js application
- Set up MongoDB database
- Configured authentication with JWT

### 2. Building the Core Features

#### User Authentication
- Created login and registration pages
- Implemented JWT-based authentication
- Set up role-based access control (admin vs. student)

#### Admin Dashboard
- Built a dashboard for teachers/admins
- Created forms for creating attendance sessions
- Implemented QR code generation for sessions
- Added tables for viewing attendance records

#### Student Dashboard
- Built a dashboard for students
- Implemented QR code scanning functionality
- Created attendance history view

#### Notification System
- Created a notification model in the database
- Built API endpoints for managing notifications
- Implemented a notification bell in the navigation bar
- Added a dedicated notifications page

### 3. Making It Secure and User-Friendly
- Added route protection to restrict access based on user roles
- Implemented responsive design for mobile devices
- Added error handling and loading states
- Created a dark/light mode toggle

## How It Works (Simple Flow)

### For Teachers/Admins:
1. Log in to the admin dashboard
2. Create a new attendance session (subject, date, time)
3. The system generates a unique QR code for the session
4. Students scan this QR code to mark their attendance
5. View attendance records for all sessions

### For Students:
1. Log in to the student dashboard
2. Use the QR scanner to scan the QR code provided by the teacher
3. The system marks the student as present for that session
4. View personal attendance history

## Key Features

- **Secure Authentication**: Only registered users can access the system
- **Role-Based Access**: Different interfaces for admins and students
- **QR Code Generation**: Unique QR codes for each session
- **QR Code Scanning**: Easy attendance marking with smartphone cameras
- **Real-time Notifications**: Students get notified when new sessions are created
- **Responsive Design**: Works on both computers and mobile devices
- **Dark/Light Mode**: User can choose their preferred theme

## Folder Structure (Simplified)

- `/src/app`: All the pages of the application
- `/src/components`: Reusable UI components
- `/src/lib`: Helper functions
- `/src/models`: Database models
- `/src/context`: State management

## Technologies Explained Simply

- **Next.js**: Helps us build both the website and the API in one project
- **React**: Makes it easy to build interactive user interfaces
- **MongoDB**: Stores all the data (users, sessions, attendance records)
- **JWT**: Securely remembers who is logged in
- **Tailwind CSS**: Makes styling faster and more consistent
- **QR Code**: A square barcode that can be scanned with a smartphone camera

## Conclusion

This QR Code-Based Student Attendance System modernizes the attendance-taking process, making it faster, more accurate, and more convenient for both teachers and students. It eliminates paper waste, reduces administrative work, and provides instant access to attendance records.
