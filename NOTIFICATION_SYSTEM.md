# Notification System in QR Code Attendance System

This document explains how the notification system works in the QR Code Attendance System.

## Overview

The notification system keeps students informed about new attendance sessions and other important events. When a teacher creates a new attendance session, all students receive a notification that they can view in the notification bell or on the dedicated notifications page.

## Components

### 1. Notification Model

The notification system uses a MongoDB schema defined in `src/models/Notification.js`:

- `recipient`: The student who receives the notification
- `title`: The notification title
- `message`: The notification message
- `type`: The type of notification (session, attendance, system)
- `relatedId`: Reference to the related entity (e.g., session ID)
- `relatedModel`: The model of the related entity
- `isRead`: Whether the notification has been read
- `createdAt`: When the notification was created

### 2. API Endpoints

The notification system provides several API endpoints:

- `GET /api/notifications`: Get notifications for the current user
- `POST /api/notifications`: Create a notification (admin only)
- `PATCH /api/notifications/:id`: Mark a notification as read
- `DELETE /api/notifications/:id`: Delete a notification
- `POST /api/notifications/mark-all-read`: Mark all notifications as read

### 3. Notification Context

The `NotificationContext` (`src/context/NotificationContext.js`) provides notification state and functions to all components:

- `notifications`: The list of notifications for the current user
- `unreadCount`: The number of unread notifications
- `loading`: Whether notifications are being fetched
- `fetchNotifications`: Function to fetch notifications
- `markAsRead`: Function to mark a notification as read
- `markAllAsRead`: Function to mark all notifications as read
- `deleteNotification`: Function to delete a notification

### 4. UI Components

The notification system includes several UI components:

- `NotificationBell`: A bell icon in the navigation bar that shows the unread notification count
- `Notifications Page`: A dedicated page for viewing and managing all notifications

## Notification Flow

1. **Creation**: When a teacher creates a new attendance session, the system automatically creates a notification for each student.

2. **Delivery**: Students can see their notifications by clicking the bell icon in the navigation bar or by visiting the notifications page.

3. **Reading**: Students can mark notifications as read by clicking on them or by using the "Mark all as read" button.

4. **Management**: Students can delete notifications they no longer need.

## Automatic Updates

The notification system automatically checks for new notifications every 30 seconds, ensuring that students always have the latest information.

## Best Practices

1. **Keep Notifications Concise**: Notification messages should be clear and concise.

2. **Use Appropriate Types**: Use the appropriate notification type (session, attendance, system) to help students understand the context.

3. **Clean Up Old Notifications**: Encourage students to delete old notifications to keep their notification center organized.

4. **Handle Errors Gracefully**: The notification system includes error handling to ensure that failures in the notification system don't affect the core functionality of the application.
